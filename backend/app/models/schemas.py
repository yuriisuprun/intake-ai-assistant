"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class SessionStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class MessageRole(str, Enum):
    CLIENT = "client"
    SYSTEM = "system"
    LAWYER = "lawyer"


class MessageType(str, Enum):
    TEXT = "text"
    QUESTION = "question"
    ANSWER = "answer"
    DOCUMENT_REFERENCE = "document_reference"


# Client Models
class ClientCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    company_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ClientUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ClientResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str]
    company_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Intake Session Models
class IntakeSessionCreate(BaseModel):
    # Client information (required for new intake)
    client_name: str = Field(..., min_length=1, max_length=255)
    client_email: EmailStr
    client_phone: Optional[str] = Field(None, max_length=20)


class IntakeSessionUpdate(BaseModel):
    status: Optional[SessionStatus] = None
    notes: Optional[str] = None


class IntakeStepSubmit(BaseModel):
    session_id: str = Field(..., min_length=1)
    step_key: str = Field(..., min_length=1)
    answer: Optional[Any] = None  # Allow None for optional fields
    question_type: str = Field(..., min_length=1)  # text, textarea, select, radio, date, file
    
    class Config:
        # Ensure Pydantic is more lenient with type coercion
        use_enum_values = True


class IntakeSessionResponse(BaseModel):
    id: str
    reference_number: str
    status: SessionStatus
    current_step: int
    # Intake flow fields (flattened from former flow_data)
    legal_area: Optional[str] = None
    problem_description: Optional[str] = None
    timeline: Optional[str] = None
    urgency_description: Optional[str] = None  # from urgency question
    desired_outcome: Optional[str] = None
    documents: Optional[str] = None
    contact_preference: Optional[str] = None
    additional_info: Optional[str] = None
    # Client info (stored directly in intakes table)
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    # Other fields
    ai_summary: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Intake Models
class IntakeCreate(BaseModel):
    client_name: str = Field(..., min_length=1, max_length=255)
    client_email: EmailStr
    client_phone: Optional[str] = Field(None, max_length=20)


class IntakeResponse(BaseModel):
    id: str
    session_id: str
    client_name: str
    client_email: str
    client_phone: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Message Models
class MessageCreate(BaseModel):
    session_id: str
    role: MessageRole
    content: str
    message_type: Optional[MessageType] = MessageType.TEXT
    metadata: Optional[Dict[str, Any]] = None


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: MessageRole
    content: str
    message_type: MessageType
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


# File Models
class FileUploadResponse(BaseModel):
    id: str
    session_id: str
    file_name: str
    file_type: str
    file_size: int
    file_url: str
    document_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class FileListResponse(BaseModel):
    files: List[FileUploadResponse]
    total: int


# AI Summary Models
class AISummaryRequest(BaseModel):
    session_id: str


class KeyFact(BaseModel):
    fact: str
    source: Optional[str] = None  # message_id or file_id


class MissingInfo(BaseModel):
    info: str
    category: Optional[str] = None


class RecommendedQuestion(BaseModel):
    question: str
    priority: Optional[str] = None  # high, medium, low


class AISummaryResponse(BaseModel):
    summary: str
    urgency: UrgencyLevel
    key_facts: List[str]
    missing_information: List[str]
    recommended_next_questions: List[str]
    confidence: float = Field(..., ge=0.0, le=1.0)
    generated_at: datetime
    model: str


# Intake Flow Definition
class IntakeQuestion(BaseModel):
    key: str
    step: int
    question: str
    description: Optional[str] = None
    question_type: str  # text, textarea, select, radio, date, file
    required: bool = True
    options: Optional[List[str]] = None  # for select/radio
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    validation: Optional[Dict[str, Any]] = None


class IntakeFlowResponse(BaseModel):
    questions: List[IntakeQuestion]
    total_steps: int


# API Response Wrapper
class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None


class APIErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None


# Pagination
class PaginationParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    skip: int
    limit: int
    has_more: bool
