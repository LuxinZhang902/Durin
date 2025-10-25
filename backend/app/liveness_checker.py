"""
Liveness verification and fraud prevention gate.
Mock implementation for MVP - validates image and provides deterministic scores.

PRODUCTION UPGRADE PATH:
- Replace with InsightFace ONNX for face embeddings
- Add passive liveness detection (texture analysis, blink detection)
- Integrate with real sanctions/PEP lists (OFAC, OFSI, etc.)
- Add device intelligence service
"""
import base64
import hashlib
from typing import Dict, Set
from datetime import datetime

from app.models import LivenessCheck, LivenessResult


class LivenessChecker:
    """
    Identity integrity gate for underwriting.
    Fraud prevention via facial liveness and sanctions screening.
    """
    
    # Mock sanctions deny-list (hashed names for demo)
    SANCTIONS_LIST: Set[str] = {
        hashlib.sha256(b"blocked_user_1").hexdigest()[:16],
        hashlib.sha256(b"sanctioned_person").hexdigest()[:16],
        hashlib.sha256(b"pep_individual").hexdigest()[:16],
    }
    
    # Device fingerprints flagged as high-risk
    FLAGGED_DEVICES: Set[str] = {
        "suspicious_device_001",
        "known_fraud_device_42",
    }
    
    def __init__(self):
        self.check_history: Dict[str, int] = {}  # user_id -> check count
        self.device_usage: Dict[str, Set[str]] = {}  # device -> set of user_ids
    
    def verify_liveness(self, check: LivenessCheck) -> LivenessResult:
        """
        Perform liveness verification and fraud checks.
        
        Args:
            check: LivenessCheck containing user_id, image, device info
        
        Returns:
            LivenessResult with pass/fail and risk scores
        """
        flags = []
        
        # 1. Image validation
        try:
            image_bytes = base64.b64decode(check.image_data)
            if len(image_bytes) < 1000:
                flags.append("IMAGE_TOO_SMALL")
        except Exception:
            flags.append("INVALID_IMAGE_FORMAT")
            return LivenessResult(
                user_id=check.user_id,
                liveness_pass=False,
                liveness_score=0.0,
                device_risk_score=1.0,
                flags=flags
            )
        
        # 2. Mock liveness scoring
        # In production: Use texture analysis, blink detection, depth estimation
        liveness_score = self._compute_liveness_score(check, image_bytes)
        
        # 3. Replay detection (screen capture detection)
        replay_detected = self._detect_replay(image_bytes)
        if replay_detected:
            flags.append("REPLAY_DETECTED")
        
        # 4. Sanctions screening (mock)
        sanctions_pass = self._check_sanctions(check.user_id)
        if not sanctions_pass:
            flags.append("SANCTIONS_MATCH")
        
        # 5. Device risk scoring
        device_risk = self._compute_device_risk(check)
        if device_risk > 0.7:
            flags.append("HIGH_DEVICE_RISK")
        
        # 6. Velocity checks
        if self._check_velocity_abuse(check.user_id):
            flags.append("VELOCITY_ABUSE")
        
        # Final liveness determination
        liveness_pass = (
            liveness_score >= 0.6 and
            not replay_detected and
            sanctions_pass and
            device_risk < 0.8
        )
        
        # Track usage
        self._track_usage(check)
        
        return LivenessResult(
            user_id=check.user_id,
            liveness_pass=liveness_pass,
            liveness_score=round(liveness_score, 3),
            replay_detected=replay_detected,
            sanctions_pass=sanctions_pass,
            device_risk_score=round(device_risk, 3),
            flags=flags
        )
    
    def _compute_liveness_score(self, check: LivenessCheck, image_bytes: bytes) -> float:
        """
        Mock liveness scoring based on image characteristics.
        
        PRODUCTION: Replace with:
        - InsightFace face detection + embedding extraction
        - Texture analysis (LBP, frequency domain)
        - Blink detection from burst frames
        - 3D depth estimation
        """
        # Deterministic score based on image hash for demo consistency
        image_hash = hashlib.sha256(image_bytes).hexdigest()
        hash_value = int(image_hash[:8], 16)
        
        # Map to 0.5-0.95 range (most pass)
        base_score = 0.5 + (hash_value % 1000) / 2222.0
        
        # Penalize if image is too small
        if len(image_bytes) < 10000:
            base_score *= 0.7
        
        # Bonus for larger images (likely higher quality)
        if len(image_bytes) > 50000:
            base_score = min(0.95, base_score * 1.1)
        
        return base_score
    
    def _detect_replay(self, image_bytes: bytes) -> bool:
        """
        Mock replay/screen capture detection.
        
        PRODUCTION: Replace with:
        - Screen pattern FFT analysis
        - Moiré pattern detection
        - Reflection/glare analysis
        - Frame-to-frame temporal consistency
        """
        # Simple heuristic: flag very small or suspiciously uniform images
        image_hash = hashlib.sha256(image_bytes).hexdigest()
        
        # Deterministic replay detection for demo
        # ~10% flagged as replay
        return int(image_hash[:2], 16) < 26  # 26/256 ≈ 10%
    
    def _check_sanctions(self, user_id: str) -> bool:
        """
        Mock sanctions/PEP screening.
        
        PRODUCTION: Integrate with:
        - OFAC SDN list (US)
        - OFSI sanctions list (UK)
        - EU sanctions database
        - PEP databases
        - Adverse media screening
        """
        # Hash user_id and check against mock deny-list
        user_hash = hashlib.sha256(user_id.encode()).hexdigest()[:16]
        
        return user_hash not in self.SANCTIONS_LIST
    
    def _compute_device_risk(self, check: LivenessCheck) -> float:
        """
        Assess device risk score.
        
        Factors:
        - Device on deny-list
        - Device shared across many users
        - Device seen in fraud patterns
        """
        device_fp = check.device_fingerprint
        
        # Check deny-list
        if device_fp in self.FLAGGED_DEVICES:
            return 0.95
        
        # Check sharing pattern
        if device_fp in self.device_usage:
            user_count = len(self.device_usage[device_fp])
            if user_count > 5:
                return 0.8  # High risk: shared device
            elif user_count > 2:
                return 0.5  # Medium risk
        
        # Deterministic score for demo
        device_hash = hashlib.sha256(device_fp.encode()).hexdigest()
        hash_value = int(device_hash[:8], 16)
        
        # Most devices are low-risk (0.05-0.30)
        return 0.05 + (hash_value % 100) / 400.0
    
    def _check_velocity_abuse(self, user_id: str) -> bool:
        """
        Check for velocity abuse (too many attempts).
        
        PRODUCTION: Use time-windowed counters with Redis/memory cache.
        """
        count = self.check_history.get(user_id, 0)
        
        # Flag if more than 5 attempts
        return count > 5
    
    def _track_usage(self, check: LivenessCheck):
        """Track check history for velocity and device intelligence."""
        # Increment user check count
        self.check_history[check.user_id] = self.check_history.get(check.user_id, 0) + 1
        
        # Track device-to-user mapping
        device_fp = check.device_fingerprint
        if device_fp not in self.device_usage:
            self.device_usage[device_fp] = set()
        self.device_usage[device_fp].add(check.user_id)
    
    def get_device_stats(self, device_fingerprint: str) -> Dict:
        """Get statistics for a device (for investigation)."""
        return {
            'device_fingerprint': device_fingerprint,
            'user_count': len(self.device_usage.get(device_fingerprint, set())),
            'users': list(self.device_usage.get(device_fingerprint, set())),
            'flagged': device_fingerprint in self.FLAGGED_DEVICES
        }

