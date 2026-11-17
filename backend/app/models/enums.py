from enum import Enum

class AdoptionStatus(str, Enum):
    AVAILABLE = "available"
    IN_PROCESS = "in_process"
    ADOPTED = "adopted"
    NOT_AVAILABLE = "not_available"

class CareStatus(str, Enum):
    HEALTHY = "healthy"
    TREATMENT = "treatment"
    TEMPORARY_HOME = "temporary_home"

class ApplicationStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    NEEDS_INFORMATION = "needs_information"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MedicationStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    NEEDS_INFORMATION = "needs_information"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MedicationUrgency(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class PartnerCategory(str, Enum):
    ACCOUNTING = "accounting"
    VETERINARY = "veterinary"
    PHOTOGRAPHY = "photography"

class PartnerSocialPlatform(str, Enum):
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    WHATSAPP = "whatsapp"
    WEBSITE = "website"
