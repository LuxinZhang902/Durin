"""
Cashflow analysis engine for underwriting.
Computes financial health metrics from bank transaction history.
"""
from typing import List, Dict
from datetime import datetime, timedelta
from collections import defaultdict
import statistics
import pandas as pd

from app.models import BankTransaction, CashflowMetrics, TransactionType


class CashflowAnalyzer:
    """Analyzes transaction patterns to assess financial health."""
    
    # MCC codes for essential spending categories
    ESSENTIAL_MCC_CODES = {
        '5411', '5412', '5422',  # Grocery stores
        '5541', '5542', '5983',  # Gas stations, auto fuel
        '5912', '5976',          # Pharmacy, medical
        '4814', '4816', '4899',  # Telecom, utilities
        '6300', '6513',          # Insurance
    }
    
    # Keywords for income detection
    INCOME_KEYWORDS = ['salary', 'payroll', 'deposit', 'direct dep', 'wage', 'income']
    
    # Keywords for recurring payments
    RECURRING_KEYWORDS = ['loan', 'mortgage', 'rent', 'payment', 'subscription', 'auto pay']
    
    def __init__(self):
        self.transactions: List[BankTransaction] = []
    
    def analyze(self, transactions: List[BankTransaction]) -> CashflowMetrics:
        """
        Analyze transaction history and compute cashflow metrics.
        
        Args:
            transactions: List of bank transactions (90 days recommended)
        
        Returns:
            CashflowMetrics with computed financial health indicators
        """
        if not transactions:
            raise ValueError("Cannot analyze empty transaction list")
        
        self.transactions = sorted(transactions, key=lambda t: t.timestamp)
        
        # Compute metrics
        income_metrics = self._compute_income_metrics()
        spending_metrics = self._compute_spending_metrics()
        health_metrics = self._compute_health_metrics(income_metrics, spending_metrics)
        
        return CashflowMetrics(
            net_income_median=income_metrics['median_monthly_income'],
            income_cv=income_metrics['income_cv'],
            essential_spend_median=spending_metrics['essential_median'],
            discretionary_spend_median=spending_metrics['discretionary_median'],
            buffer_days=health_metrics['buffer_days'],
            payment_burden=health_metrics['payment_burden'],
            on_time_ratio=health_metrics['on_time_ratio'],
            nsf_count_90d=health_metrics['nsf_count'],
            transaction_count=len(transactions)
        )
    
    def _compute_income_metrics(self) -> Dict:
        """Compute income stability and amount."""
        income_txns = [
            t for t in self.transactions 
            if t.amount > 0 and self._is_income_transaction(t)
        ]
        
        if not income_txns:
            # No clear income detected, estimate from positive flows
            income_txns = [t for t in self.transactions if t.amount > 100]
        
        # Group by month
        monthly_income = defaultdict(float)
        for txn in income_txns:
            month_key = txn.timestamp.strftime('%Y-%m')
            monthly_income[month_key] += txn.amount
        
        income_values = list(monthly_income.values())
        
        if not income_values:
            return {
                'median_monthly_income': 0.0,
                'income_cv': 1.0  # High variability
            }
        
        median_income = statistics.median(income_values)
        
        # Coefficient of variation (std dev / mean)
        if len(income_values) > 1 and median_income > 0:
            cv = statistics.stdev(income_values) / median_income
        else:
            cv = 0.0
        
        return {
            'median_monthly_income': round(median_income, 2),
            'income_cv': round(min(cv, 2.0), 3)  # Cap at 2.0
        }
    
    def _compute_spending_metrics(self) -> Dict:
        """Compute spending patterns by category."""
        expense_txns = [t for t in self.transactions if t.amount < 0]
        
        essential_expenses = []
        discretionary_expenses = []
        
        for txn in expense_txns:
            abs_amount = abs(txn.amount)
            
            if self._is_essential_spending(txn):
                essential_expenses.append(abs_amount)
            else:
                discretionary_expenses.append(abs_amount)
        
        # Group by month for medians
        monthly_essential = self._monthly_aggregate(
            [t for t in self.transactions if t.amount < 0 and self._is_essential_spending(t)]
        )
        monthly_discretionary = self._monthly_aggregate(
            [t for t in self.transactions if t.amount < 0 and not self._is_essential_spending(t)]
        )
        
        return {
            'essential_median': round(statistics.median(monthly_essential) if monthly_essential else 0.0, 2),
            'discretionary_median': round(statistics.median(monthly_discretionary) if monthly_discretionary else 0.0, 2),
            'total_spend': sum(essential_expenses) + sum(discretionary_expenses)
        }
    
    def _compute_health_metrics(self, income_metrics: Dict, spending_metrics: Dict) -> Dict:
        """Compute financial health indicators."""
        # Buffer days: How many days can user survive at current burn rate
        monthly_income = income_metrics['median_monthly_income']
        monthly_spend = spending_metrics['essential_median'] + spending_metrics['discretionary_median']
        
        if monthly_spend > 0:
            daily_burn = monthly_spend / 30
            net_monthly = monthly_income - monthly_spend
            
            if net_monthly > 0:
                # Assume some savings buffer (estimate)
                estimated_buffer = net_monthly * 0.5  # Conservative estimate
                buffer_days = estimated_buffer / daily_burn if daily_burn > 0 else 30
            else:
                buffer_days = 0
        else:
            buffer_days = 30  # Default if no spending detected
        
        # Payment burden: Recurring payments as % of income
        recurring_payments = self._compute_recurring_payments()
        payment_burden = recurring_payments / monthly_income if monthly_income > 0 else 1.0
        
        # On-time payment ratio
        on_time_ratio = self._compute_on_time_ratio()
        
        # NSF (Non-sufficient funds) count
        nsf_count = self._count_nsf_events()
        
        return {
            'buffer_days': round(min(buffer_days, 90), 1),  # Cap at 90
            'payment_burden': round(min(payment_burden, 1.0), 3),  # Cap at 100%
            'on_time_ratio': round(on_time_ratio, 3),
            'nsf_count': nsf_count
        }
    
    def _is_income_transaction(self, txn: BankTransaction) -> bool:
        """Determine if transaction is income."""
        if txn.transaction_type == TransactionType.INCOME:
            return True
        
        # Check merchant/counterparty for income keywords
        text = f"{txn.merchant or ''} {txn.counterparty or ''}".lower()
        return any(keyword in text for keyword in self.INCOME_KEYWORDS)
    
    def _is_essential_spending(self, txn: BankTransaction) -> bool:
        """Determine if spending is essential vs discretionary."""
        # Check MCC code
        if txn.mcc and txn.mcc in self.ESSENTIAL_MCC_CODES:
            return True
        
        # Check merchant keywords
        text = f"{txn.merchant or ''}".lower()
        essential_keywords = ['grocery', 'gas', 'fuel', 'pharmacy', 'medical', 
                             'utility', 'electric', 'water', 'rent', 'mortgage',
                             'insurance', 'phone', 'internet']
        
        return any(keyword in text for keyword in essential_keywords)
    
    def _compute_recurring_payments(self) -> float:
        """Estimate monthly recurring payment obligations."""
        # Look for transactions with recurring keywords
        recurring_txns = [
            t for t in self.transactions 
            if t.amount < 0 and self._is_recurring_payment(t)
        ]
        
        # Sum and divide by number of months
        total = sum(abs(t.amount) for t in recurring_txns)
        
        # Estimate monthly from data range
        if self.transactions:
            date_range = (self.transactions[-1].timestamp - self.transactions[0].timestamp).days
            months = max(date_range / 30, 1)
            return total / months
        
        return 0.0
    
    def _is_recurring_payment(self, txn: BankTransaction) -> bool:
        """Check if transaction appears to be recurring payment."""
        text = f"{txn.merchant or ''} {txn.counterparty or ''}".lower()
        return any(keyword in text for keyword in self.RECURRING_KEYWORDS)
    
    def _compute_on_time_ratio(self) -> float:
        """
        Estimate on-time payment ratio.
        Mock implementation: looks for late fee indicators.
        """
        payment_txns = [t for t in self.transactions if t.amount < 0]
        
        if not payment_txns:
            return 1.0
        
        # Count late fees
        late_fees = sum(
            1 for t in payment_txns 
            if 'late' in f"{t.merchant or ''} {t.counterparty or ''}".lower()
        )
        
        # Assume each late fee represents one late payment
        total_payments = max(len([t for t in payment_txns if self._is_recurring_payment(t)]), 1)
        
        return max(0.0, 1.0 - (late_fees / total_payments))
    
    def _count_nsf_events(self) -> int:
        """Count NSF/overdraft events in last 90 days."""
        nsf_keywords = ['nsf', 'overdraft', 'insufficient', 'returned payment']
        
        count = 0
        for txn in self.transactions:
            text = f"{txn.merchant or ''} {txn.counterparty or ''}".lower()
            if any(keyword in text for keyword in nsf_keywords):
                count += 1
        
        return count
    
    def _monthly_aggregate(self, transactions: List[BankTransaction]) -> List[float]:
        """Aggregate transactions by month."""
        monthly = defaultdict(float)
        
        for txn in transactions:
            month_key = txn.timestamp.strftime('%Y-%m')
            monthly[month_key] += abs(txn.amount)
        
        return list(monthly.values()) if monthly else [0.0]

