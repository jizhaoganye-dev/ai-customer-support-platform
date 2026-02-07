"""
Harassment Detection API Endpoints
Real-time customer harassment detection and analysis
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

router = APIRouter()

// ============================================================================
// Models
// ============================================================================

class SeverityLevel(str, Enum):
    """Harassment severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RecommendationAction(str, Enum):
    """Recommended actions"""
    CONTINUE = "continue"
    ESCALATE = "escalate"
    TERMINATE = "terminate"

class HarassmentDetectionRequest(BaseModel):
    """Harassment detection request"""
    message: str = Field(..., min_length=1, max_length=4000, description="Message to analyze")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")

class HarassmentPattern(BaseModel):
    """Detected harassment pattern"""
    id: str
    pattern: str
    severity: SeverityLevel
    category: str
    description: Optional[str] = None

class HarassmentDetectionResponse(BaseModel):
    """Harassment detection result"""
    is_harassment: bool = Field(..., description="Whether harassment was detected")
    score: float = Field(..., ge=0, le=1, description="Harassment score (0-1)")
    severity: Optional[SeverityLevel] = Field(None, description="Severity level")
    flags: List[str] = Field(default_factory=list, description="Detected flags")
    detected_patterns: List[HarassmentPattern] = Field(default_factory=list)
    recommendation: RecommendationAction = Field(..., description="Recommended action")
    explanation: str = Field(..., description="Human-readable explanation")

class SentimentRequest(BaseModel):
    """Sentiment analysis request"""
    message: str = Field(..., min_length=1, max_length=4000)

class EmotionScores(BaseModel):
    """Emotion analysis scores"""
    anger: float = Field(..., ge=0, le=1)
    disgust: float = Field(..., ge=0, le=1)
    fear: float = Field(..., ge=0, le=1)
    joy: float = Field(..., ge=0, le=1)
    sadness: float = Field(..., ge=0, le=1)
    surprise: float = Field(..., ge=0, le=1)

class SentimentResponse(BaseModel):
    """Sentiment analysis result"""
    score: float = Field(..., ge=-1, le=1, description="Sentiment score (-1 to 1)")
    label: str = Field(..., description="Sentiment label: negative, neutral, positive")
    emotions: EmotionScores
    confidence: float = Field(..., ge=0, le=1)

// ============================================================================
// Endpoints
// ============================================================================

@router.post("/detect", response_model=HarassmentDetectionResponse)
async def detect_harassment(request: HarassmentDetectionRequest):
    """
    Detect customer harassment in message
    
    Performs multi-level analysis:
    1. Keyword-based quick scan
    2. AI-powered context analysis
    3. Pattern matching against known harassment types
    
    Returns severity level and recommended action
    """
    try:
        // In production, use actual harassment detection logic
        # from app.services.harassment_detection import detect_harassment
        
        # Simplified demonstration
        message_lower = request.message.lower()
        
        # Check for critical keywords
        critical_keywords = ["殺す", "死ね", "ころす", "しね"]
        is_critical = any(keyword in message_lower for keyword in critical_keywords)
        
        if is_critical:
            return HarassmentDetectionResponse(
                is_harassment=True,
                score=1.0,
                severity=SeverityLevel.CRITICAL,
                flags=["violent_threat", "life_threatening"],
                detected_patterns=[
                    HarassmentPattern(
                        id="p1",
                        pattern="生命に関する脅迫",
                        severity=SeverityLevel.CRITICAL,
                        category="暴力的脅迫",
                        description="殺害や暴力を示唆する表現"
                    )
                ],
                recommendation=RecommendationAction.TERMINATE,
                explanation="重大な脅迫的表現が検出されました。直ちに対応を終了し、管理者にエスカレーションしてください。"
            )
        
        # Check for high severity
        high_keywords = ["バカ", "ばか", "アホ", "クズ", "無能", "訴える"]
        is_high = any(keyword in message_lower for keyword in high_keywords)
        
        if is_high:
            return HarassmentDetectionResponse(
                is_harassment=True,
                score=0.75,
                severity=SeverityLevel.HIGH,
                flags=["insult", "personal_attack"],
                detected_patterns=[
                    HarassmentPattern(
                        id="p2",
                        pattern="人格否定",
                        severity=SeverityLevel.HIGH,
                        category="侮辱",
                        description="相手の人格や能力を否定する表現"
                    )
                ],
                recommendation=RecommendationAction.ESCALATE,
                explanation="重度のカスタマーハラスメントの可能性があります。管理者にエスカレーションすることを推奨します。"
            )
        
        // No harassment detected
        return HarassmentDetectionResponse(
            is_harassment=False,
            score=0.1,
            severity=None,
            flags=[],
            detected_patterns=[],
            recommendation=RecommendationAction.CONTINUE,
            explanation="問題となる表現は検出されませんでした。"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Harassment detection failed: {str(e)}"
        )

@router.post("/sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment and emotions in message
    
    Returns:
    - Overall sentiment score (-1 to 1)
    - Sentiment label (negative/neutral/positive)
    - Detailed emotion scores
    - Confidence level
    """
    try:
        # In production, use actual sentiment analysis
        # Simplified demonstration
        
        message_lower = request.message.lower()
        
        # Simple keyword-based sentiment (replace with AI in production)
        negative_words = ["悪い", "ダメ", "最悪", "ひどい", "困る", "嫌", "問題"]
        positive_words = ["良い", "いい", "ありがとう", "助かる", "素晴らしい", "感謝"]
        
        neg_count = sum(1 for word in negative_words if word in message_lower)
        pos_count = sum(1 for word in positive_words if word in message_lower)
        
        if neg_count > pos_count:
            return SentimentResponse(
                score=-0.6,
                label="negative",
                emotions=EmotionScores(
                    anger=0.4,
                    disgust=0.2,
                    fear=0.1,
                    joy=0.05,
                    sadness=0.3,
                    surprise=0.05
                ),
                confidence=0.75
            )
        elif pos_count > neg_count:
            return SentimentResponse(
                score=0.7,
                label="positive",
                emotions=EmotionScores(
                    anger=0.0,
                    disgust=0.0,
                    fear=0.0,
                    joy=0.8,
                    sadness=0.0,
                    surprise=0.2
                ),
                confidence=0.85
            )
        else:
            return SentimentResponse(
                score=0.0,
                label="neutral",
                emotions=EmotionScores(
                    anger=0.1,
                    disgust=0.05,
                    fear=0.05,
                    joy=0.2,
                    sadness=0.1,
                    surprise=0.1
                ),
                confidence=0.65
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sentiment analysis failed: {str(e)}"
        )

@router.get("/patterns")
async def get_harassment_patterns():
    """
    Get list of known harassment patterns
    
    Returns all active harassment patterns used for detection
    """
    return {
        "patterns": [
            {
                "id": "p1",
                "pattern": "生命に関する脅迫",
                "severity": "critical",
                "category": "暴力的脅迫",
                "description": "殺害や暴力を示唆する表現",
                "detection_count": 12
            },
            {
                "id": "p2",
                "pattern": "人格否定",
                "severity": "high",
                "category": "侮辱",
                "description": "相手の人格や能力を否定する表現",
                "detection_count": 245
            },
            {
                "id": "p3",
                "pattern": "法的措置の示唆",
                "severity": "high",
                "category": "威圧",
                "description": "訴訟や法的手段を仄めかす表現",
                "detection_count": 89
            }
        ]
    }
