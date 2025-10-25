"""
Credit risk scoring engine with PD calculation.
Combines cashflow metrics into probability of default with monotone constraints.
"""
from typing import List, Dict, Tuple
import uuid
from datetime import datetime

from app.models import (
    CashflowMetrics, LivenessResult, PersonalData,
    UnderwritingDecision, RiskReason, Counterfactual
)


class UnderwritingScorer:
    """
    Cashflow-first underwriting model with explainable decisions.
    
    Model characteristics:
    - Monotone constraints: Better cashflow → Lower PD
    - Feature-driven: Uses computed metrics, not raw transactions
    - Explainable: Returns reasons and counterfactuals
    - Jurisdiction-aware: Different thresholds for US/UK
    """
    
    # Policy thresholds by jurisdiction
    THRESHOLDS = {
        'US': {
            'min_buffer_days': 15,
            'max_payment_burden': 0.40,
            'min_on_time_ratio': 0.85,
            'max_nsf_count': 2,
            'max_income_cv': 0.5,
            'starter_max_pd': 0.12,
            'prime_max_pd': 0.06,
        },
        'UK': {
            'min_buffer_days': 20,
            'max_payment_burden': 0.35,
            'min_on_time_ratio': 0.90,
            'max_nsf_count': 1,
            'max_income_cv': 0.4,
            'starter_max_pd': 0.10,
            'prime_max_pd': 0.05,
        }
    }
    
    # Credit limit tiers based on PD
    LIMIT_TIERS = [
        (0.00, 0.03, 3000),  # Prime: PD < 3%
        (0.03, 0.06, 2000),  # Near-prime
        (0.06, 0.09, 1200),  # Starter
        (0.09, 0.12, 800),   # High-risk starter
    ]
    
    # APR pricing based on PD
    def __init__(self):
        pass
    
    def score(
        self,
        user_id: str,
        personal_data: PersonalData,
        cashflow_metrics: CashflowMetrics,
        liveness_result: LivenessResult,
        jurisdiction: str = 'US'
    ) -> UnderwritingDecision:
        """
        Generate underwriting decision from all inputs.
        
        Args:
            user_id: User identifier
            personal_data: Personal and employment info
            cashflow_metrics: Computed cashflow health metrics
            liveness_result: Fraud gate verification result
            jurisdiction: 'US' or 'UK'
        
        Returns:
            UnderwritingDecision with PD, limits, reasons, counterfactuals
        """
        decision_id = f"dec_{uuid.uuid4().hex[:12]}"
        thresholds = self.THRESHOLDS.get(jurisdiction, self.THRESHOLDS['US'])
        
        # Check fraud gate
        if not liveness_result.liveness_pass:
            return self._decline_fraud_gate(
                decision_id, user_id, jurisdiction, liveness_result
            )
        
        # Calculate PD from cashflow
        pd_score, feature_impacts = self._calculate_pd(
            cashflow_metrics, personal_data, thresholds
        )
        
        # Generate risk reasons
        reasons = self._generate_reasons(
            cashflow_metrics, personal_data, feature_impacts, thresholds
        )
        
        # Generate counterfactuals
        counterfactuals = self._generate_counterfactuals(
            cashflow_metrics, feature_impacts
        )
        
        # Determine approval and limits
        approved = pd_score <= thresholds['starter_max_pd']
        credit_limit = self._determine_credit_limit(pd_score) if approved else 0
        apr = self._determine_apr(pd_score) if approved else None
        
        # Expected loss calculation
        lgd = 0.45  # Loss given default (45% for unsecured credit)
        ead = credit_limit  # Exposure at default
        expected_loss = pd_score * lgd * ead
        
        return UnderwritingDecision(
            decision_id=decision_id,
            user_id=user_id,
            timestamp=datetime.utcnow(),
            jurisdiction=jurisdiction,
            fraud_gate_passed=True,
            liveness_result=liveness_result,
            cashflow_metrics=cashflow_metrics,
            pd_12m=round(pd_score, 4),
            lgd=lgd,
            expected_loss=round(expected_loss, 2),
            approved=approved,
            credit_limit=credit_limit,
            apr=apr,
            reasons=reasons,
            counterfactuals=counterfactuals
        )
    
    def _calculate_pd(
        self,
        metrics: CashflowMetrics,
        personal: PersonalData,
        thresholds: Dict
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculate probability of default using monotone logic.
        
        Returns:
            (pd_score, feature_impacts) where impacts show contribution
        """
        # Base PD (starts at median baseline)
        base_pd = 0.08
        pd = base_pd
        impacts = {}
        
        # 1. Buffer days impact (monotone decreasing)
        if metrics.buffer_days >= 30:
            delta = -0.025
        elif metrics.buffer_days >= 20:
            delta = -0.015
        elif metrics.buffer_days >= 15:
            delta = -0.005
        elif metrics.buffer_days >= 10:
            delta = 0.010
        else:
            delta = 0.025
        
        pd += delta
        impacts['buffer_days'] = delta
        
        # 2. Payment burden impact (monotone increasing)
        if metrics.payment_burden <= 0.25:
            delta = -0.020
        elif metrics.payment_burden <= 0.35:
            delta = -0.010
        elif metrics.payment_burden <= 0.45:
            delta = 0.015
        else:
            delta = 0.030
        
        pd += delta
        impacts['payment_burden'] = delta
        
        # 3. On-time ratio impact (monotone decreasing)
        if metrics.on_time_ratio >= 0.95:
            delta = -0.015
        elif metrics.on_time_ratio >= 0.85:
            delta = -0.005
        elif metrics.on_time_ratio >= 0.75:
            delta = 0.010
        else:
            delta = 0.025
        
        pd += delta
        impacts['on_time_ratio'] = delta
        
        # 4. NSF events impact (monotone increasing)
        if metrics.nsf_count_90d == 0:
            delta = -0.010
        elif metrics.nsf_count_90d == 1:
            delta = 0.015
        else:
            delta = 0.030
        
        pd += delta
        impacts['nsf_count'] = delta
        
        # 5. Income stability impact (monotone decreasing on CV)
        if metrics.income_cv <= 0.2:
            delta = -0.010
        elif metrics.income_cv <= 0.4:
            delta = 0.000
        elif metrics.income_cv <= 0.6:
            delta = 0.015
        else:
            delta = 0.025
        
        pd += delta
        impacts['income_cv'] = delta
        
        # 6. Income level adjustment
        if metrics.net_income_median >= 4000:
            delta = -0.010
        elif metrics.net_income_median >= 2500:
            delta = -0.005
        elif metrics.net_income_median >= 1500:
            delta = 0.000
        else:
            delta = 0.015
        
        pd += delta
        impacts['income_level'] = delta
        
        # 7. Employment tenure (from personal data)
        if personal.tenure_months >= 24:
            delta = -0.010
        elif personal.tenure_months >= 12:
            delta = -0.005
        elif personal.tenure_months >= 6:
            delta = 0.005
        else:
            delta = 0.015
        
        pd += delta
        impacts['tenure'] = delta
        
        # Ensure PD is in valid range
        pd = max(0.01, min(0.30, pd))
        
        return pd, impacts
    
    def _generate_reasons(
        self,
        metrics: CashflowMetrics,
        personal: PersonalData,
        impacts: Dict[str, float],
        thresholds: Dict
    ) -> List[RiskReason]:
        """Generate human-readable risk reasons sorted by impact."""
        reasons = []
        
        # Buffer days
        if metrics.buffer_days < thresholds['min_buffer_days']:
            reasons.append(RiskReason(
                code="INSUFFICIENT_BUFFER_DAYS",
                description=f"Cash buffer of {metrics.buffer_days:.1f} days is below recommended {thresholds['min_buffer_days']} days",
                impact=impacts.get('buffer_days', 0),
                severity="high" if metrics.buffer_days < 10 else "medium"
            ))
        elif metrics.buffer_days >= 30:
            reasons.append(RiskReason(
                code="STRONG_CASH_BUFFER",
                description=f"Healthy cash buffer of {metrics.buffer_days:.1f} days",
                impact=impacts.get('buffer_days', 0),
                severity="low"
            ))
        
        # Payment burden
        if metrics.payment_burden > thresholds['max_payment_burden']:
            reasons.append(RiskReason(
                code="HIGH_PAYMENT_BURDEN",
                description=f"Recurring payments at {metrics.payment_burden:.1%} of income exceeds {thresholds['max_payment_burden']:.0%} threshold",
                impact=impacts.get('payment_burden', 0),
                severity="high"
            ))
        elif metrics.payment_burden <= 0.25:
            reasons.append(RiskReason(
                code="LOW_PAYMENT_BURDEN",
                description=f"Manageable payment burden at {metrics.payment_burden:.1%} of income",
                impact=impacts.get('payment_burden', 0),
                severity="low"
            ))
        
        # On-time ratio
        if metrics.on_time_ratio < thresholds['min_on_time_ratio']:
            reasons.append(RiskReason(
                code="LATE_PAYMENT_HISTORY",
                description=f"On-time payment ratio of {metrics.on_time_ratio:.1%} below {thresholds['min_on_time_ratio']:.0%} standard",
                impact=impacts.get('on_time_ratio', 0),
                severity="high" if metrics.on_time_ratio < 0.75 else "medium"
            ))
        
        # NSF events
        if metrics.nsf_count_90d > thresholds['max_nsf_count']:
            reasons.append(RiskReason(
                code="NSF_EVENTS_DETECTED",
                description=f"{metrics.nsf_count_90d} NSF/overdraft events in last 90 days",
                impact=impacts.get('nsf_count', 0),
                severity="high"
            ))
        
        # Income stability
        if metrics.income_cv > thresholds['max_income_cv']:
            reasons.append(RiskReason(
                code="IRREGULAR_INCOME",
                description=f"Income variability (CV={metrics.income_cv:.2f}) above {thresholds['max_income_cv']:.2f} threshold",
                impact=impacts.get('income_cv', 0),
                severity="medium"
            ))
        elif metrics.income_cv <= 0.2:
            reasons.append(RiskReason(
                code="STABLE_INCOME",
                description="Consistent and stable income pattern detected",
                impact=impacts.get('income_cv', 0),
                severity="low"
            ))
        
        # Sort by absolute impact (most important first)
        reasons.sort(key=lambda r: abs(r.impact), reverse=True)
        
        return reasons[:5]  # Top 5 reasons
    
    def _generate_counterfactuals(
        self,
        metrics: CashflowMetrics,
        impacts: Dict[str, float]
    ) -> List[Counterfactual]:
        """Generate improvement suggestions with PD impact."""
        counterfactuals = []
        
        # Buffer days improvement
        if metrics.buffer_days < 20 and impacts.get('buffer_days', 0) > 0:
            counterfactuals.append(Counterfactual(
                action="Increase cash buffer to 20 days",
                current_value=metrics.buffer_days,
                target_value=20.0,
                pd_delta=-0.015,
                feasibility="moderate"
            ))
        
        # Payment burden reduction
        if metrics.payment_burden > 0.35 and impacts.get('payment_burden', 0) > 0:
            target = 0.30
            pd_delta = (0.30 - metrics.payment_burden) * 0.05  # Estimate
            counterfactuals.append(Counterfactual(
                action=f"Reduce payment burden to {target:.0%} of income",
                current_value=metrics.payment_burden,
                target_value=target,
                pd_delta=pd_delta,
                feasibility="hard"
            ))
        
        # On-time ratio improvement
        if metrics.on_time_ratio < 0.90:
            counterfactuals.append(Counterfactual(
                action="Achieve 100% on-time payment rate for 3 months",
                current_value=metrics.on_time_ratio,
                target_value=1.0,
                pd_delta=-0.020,
                feasibility="easy"
            ))
        
        # NSF elimination
        if metrics.nsf_count_90d > 0:
            counterfactuals.append(Counterfactual(
                action="Eliminate NSF/overdraft events",
                current_value=float(metrics.nsf_count_90d),
                target_value=0.0,
                pd_delta=-0.015 * metrics.nsf_count_90d,
                feasibility="moderate"
            ))
        
        return counterfactuals[:3]  # Top 3 suggestions
    
    def _determine_credit_limit(self, pd: float) -> float:
        """Map PD to credit limit using tier system."""
        for min_pd, max_pd, limit in self.LIMIT_TIERS:
            if min_pd <= pd < max_pd:
                return limit
        
        # Below all tiers - declined
        return 0
    
    def _determine_apr(self, pd: float) -> float:
        """Calculate risk-based APR."""
        # Base rate + risk premium
        base_rate = 12.0  # Base APR
        risk_premium = pd * 100  # PD as percentage points
        
        apr = base_rate + risk_premium
        
        # Cap at reasonable max
        return min(apr, 35.99)
    
    def _decline_fraud_gate(
        self,
        decision_id: str,
        user_id: str,
        jurisdiction: str,
        liveness_result: LivenessResult
    ) -> UnderwritingDecision:
        """Generate decline decision due to fraud gate failure."""
        reasons = []
        
        if not liveness_result.liveness_pass:
            reasons.append(RiskReason(
                code="LIVENESS_CHECK_FAILED",
                description="Identity verification did not meet security standards",
                impact=1.0,
                severity="high"
            ))
        
        if liveness_result.replay_detected:
            reasons.append(RiskReason(
                code="REPLAY_DETECTED",
                description="Potential screen replay or spoofing detected",
                impact=1.0,
                severity="high"
            ))
        
        if not liveness_result.sanctions_pass:
            reasons.append(RiskReason(
                code="SANCTIONS_SCREENING_FAILED",
                description="Sanctions screening requirements not met",
                impact=1.0,
                severity="high"
            ))
        
        return UnderwritingDecision(
            decision_id=decision_id,
            user_id=user_id,
            jurisdiction=jurisdiction,
            fraud_gate_passed=False,
            liveness_result=liveness_result,
            cashflow_metrics=None,
            pd_12m=1.0,  # Max risk
            expected_loss=0.0,
            approved=False,
            credit_limit=0,
            reasons=reasons,
            counterfactuals=[]
        )

