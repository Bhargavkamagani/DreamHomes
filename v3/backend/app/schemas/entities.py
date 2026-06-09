from datetime import datetime

from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    address: str
    pincode: str
    role: str
    building_type: str | None = None
    construction_type: str | None = None
    budget: float | None = 0
    land_area: float | None = 0
    floors: int | None = 1
    company_name: str | None = None
    company_logo_url: str | None = None
    license_number: str | None = None
    experience_years: int | None = 0
    store_name: str | None = None
    categories: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    role: str
    address: str
    pincode: str
    rating: float
    profile_image_url: str | None = None
    profile_complete: bool = False

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserResponse


class ProjectCreate(BaseModel):
    title: str
    description: str
    address: str
    pincode: str
    building_type: str
    construction_type: str
    budget: float = 0
    land_area: float = 0
    floors: int = 1


class ProjectRequestCreate(BaseModel):
    receiver_id: int
    project_id: int | None = None
    request_type: str


class RequestDecision(BaseModel):
    request_id: int


class MaterialCreate(BaseModel):
    project_id: int
    material_name: str
    quantity: float
    unit: str
    cost: float


class LabourCreate(BaseModel):
    project_id: int
    labour_count: int
    labour_cost: float
    work_date: datetime


class MessageCreate(BaseModel):
    conversation_id: int | None = None
    receiver_id: int | None = None
    body: str
    attachment_url: str | None = None
    message_type: str | None = "TEXT"


class ConversationStart(BaseModel):
    receiver_id: int
    title: str | None = None


class SupplierProductCreate(BaseModel):
    name: str
    category: str
    unit: str
    price: float
    quantity: float
    image_url: str | None = None


class EstimateCreate(BaseModel):
    location: str
    pincode: str
    plot_area: float
    floors: int
    construction_type: str
    building_type: str
    finishing_type: str
    budget: float = 0


class CompleteProfileRequest(BaseModel):
    name: str | None = None
    phone: str
    address: str
    pincode: str
    building_type: str | None = None
    construction_type: str | None = None
    budget: float | None = 0
    land_area: float | None = 0
    floors: int | None = 1
    company_name: str | None = None
    company_logo_url: str | None = None
    license_number: str | None = None
    experience_years: int | None = 0
    profile_image_url: str | None = None
    about: str | None = None
    gstin: str | None = None
    pan: str | None = None
    website: str | None = None
    business_type: str | None = None
    registration_year: int | None = None
    team_size: str | None = None
    insurance_available: bool | None = False
    service_locations: str | None = None
    services_offered: str | None = None
    equipment_owned: str | None = None
    documents: str | None = None
    gallery: str | None = None
    store_name: str | None = None
    store_logo_url: str | None = None
    categories: str | None = None


class ProfileImageUpdate(BaseModel):
    profile_image_url: str


class BusinessLogoUpdate(BaseModel):
    logo_url: str
