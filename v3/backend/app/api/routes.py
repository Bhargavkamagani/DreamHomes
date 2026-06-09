from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlencode
from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, WebSocket, WebSocketDisconnect, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session, selectinload

from app.database.session import get_database
from app.models.entities import (
    ContractorProfile,
    Conversation,
    ConversationParticipant,
    EscrowMilestone,
    Estimate,
    LabourLog,
    MaterialLog,
    Message,
    Notification,
    OwnerProfile,
    Project,
    ProjectImage,
    ProjectRequest,
    ProjectTimeline,
    SupplierProduct,
    SupplierProfile,
    User,
)
from app.schemas.entities import (
    AuthResponse,
    BusinessLogoUpdate,
    CompleteProfileRequest,
    ConversationStart,
    EstimateCreate,
    LabourCreate,
    LoginRequest,
    MaterialCreate,
    MessageCreate,
    ProjectCreate,
    ProjectRequestCreate,
    ProfileImageUpdate,
    RequestDecision,
    SignupRequest,
    SupplierProductCreate,
    UserResponse,
)
from app.settings import settings
from app.utils.security import create_access_token, create_refresh_token, hash_password, read_token_user_id, verify_password

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class ChatConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, conversation_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(conversation_id, []).append(websocket)

    def disconnect(self, conversation_id: int, websocket: WebSocket):
        connections = self.active_connections.get(conversation_id, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections and conversation_id in self.active_connections:
            del self.active_connections[conversation_id]

    async def broadcast(self, conversation_id: int, payload: dict):
        for websocket in list(self.active_connections.get(conversation_id, [])):
            await websocket.send_json(payload)


chat_connections = ChatConnectionManager()


def current_user(token: str = Depends(oauth2_scheme), database: Session = Depends(get_database)) -> User:
    user_id = read_token_user_id(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = database.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def auth_payload(user: User) -> AuthResponse:
    return AuthResponse(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id), user=user)


def redirect_with_auth(user: User) -> RedirectResponse:
    payload = auth_payload(user)
    query = urlencode({
        "access_token": payload.access_token,
        "refresh_token": payload.refresh_token,
        "user": payload.user.model_dump_json(),
    })
    return RedirectResponse(f"{settings.frontend_origin}/oauth/callback?{query}", status_code=302)


def role_from_oauth_state(state: str | None) -> str:
    allowed_roles = {"OWNER", "CONTRACTOR", "SUPPLIER"}
    role = (state or "OWNER").upper()
    return role if role in allowed_roles else "OWNER"


def upsert_oauth_user(database: Session, email: str, name: str, role: str) -> User:
    user = database.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        name=name or email.split("@")[0],
        email=email,
        phone="",
        hashed_password=hash_password(uuid4().hex),
        role=role,
        address="",
        pincode="",
    )
    database.add(user)
    database.flush()
    if role == "OWNER":
        database.add(OwnerProfile(user_id=user.id, building_type="RESIDENTIAL", construction_type="CONTRACTOR", budget=0, land_area=0, floors=1))
    elif role == "CONTRACTOR":
        database.add(ContractorProfile(user_id=user.id, company_name=name or "Construction Company", license_number="", experience_years=0))
    elif role == "SUPPLIER":
        database.add(SupplierProfile(user_id=user.id, store_name=name or "Supplier Store", categories=""))
    database.commit()
    database.refresh(user)
    return UserResponse.model_validate(user)


def ensure_role(user: User, role: str):
    if user.role != role:
        raise HTTPException(status_code=403, detail=f"{role} role required")


def create_conversation_for_users(database: Session, title: str, user_ids: list[int]) -> Conversation:
    direct_key = direct_conversation_key(user_ids[0], user_ids[1]) if len(set(user_ids)) == 2 else None
    if direct_key:
        existing_conversation = database.query(Conversation).filter(Conversation.direct_key == direct_key).first()
        if existing_conversation:
            return existing_conversation
    conversation = Conversation(title=title, conversation_type="DIRECT" if direct_key else "GROUP", direct_key=direct_key)
    database.add(conversation)
    database.flush()
    for user_id in set(user_ids):
        database.add(ConversationParticipant(conversation_id=conversation.id, user_id=user_id))
    return conversation


def direct_conversation_key(first_user_id: int, second_user_id: int) -> str:
    low_id, high_id = sorted([first_user_id, second_user_id])
    return f"direct:{low_id}:{high_id}"


def find_direct_conversation(database: Session, user_id: int, receiver_id: int) -> Conversation | None:
    direct_key = direct_conversation_key(user_id, receiver_id)
    conversation = database.query(Conversation).filter(Conversation.direct_key == direct_key).first()
    if conversation:
        return conversation
    participants = (
        database.query(ConversationParticipant)
        .options(selectinload(ConversationParticipant.conversation).selectinload(Conversation.participants))
        .filter(ConversationParticipant.user_id == user_id)
        .all()
    )
    for participant in participants:
        participant_ids = {item.user_id for item in participant.conversation.participants}
        if participant_ids == {user_id, receiver_id}:
            participant.conversation.direct_key = direct_key
            participant.conversation.conversation_type = "DIRECT"
            database.add(participant.conversation)
            return participant.conversation
    return None


def user_chat_identity(database: Session, display_user: User) -> dict:
    secondary_name = display_user.address or display_user.role.title()
    if display_user.role == "OWNER":
        project = database.query(Project).filter(Project.owner_id == display_user.id).order_by(desc(Project.created_at)).first()
        secondary_name = project.title if project else (display_user.address or "House Owner")
    elif display_user.role == "CONTRACTOR" and display_user.contractor_profile:
        secondary_name = display_user.contractor_profile.company_name
    elif display_user.role == "SUPPLIER" and display_user.supplier_profile:
        secondary_name = display_user.supplier_profile.store_name
    return {
        "id": display_user.id,
        "role": display_user.role,
        "primary_name": display_user.name,
        "secondary_name": secondary_name,
        "avatar_url": display_user.profile_image_url,
        "online": False,
    }


def conversation_payload(database: Session, participant: ConversationParticipant, current_user_id: int) -> dict:
    conversation = participant.conversation
    other_participant = next((item for item in conversation.participants if item.user_id != current_user_id), None)
    other_user = other_participant.user if other_participant else None
    latest_message = conversation.last_message
    latest_message_at = conversation.last_message_at
    if not latest_message and conversation.messages:
        last_message = max(conversation.messages, key=lambda item: item.created_at)
        latest_message = last_message.body
        latest_message_at = last_message.created_at
    return {
        "id": conversation.id,
        "title": conversation.title,
        "conversation_type": conversation.conversation_type,
        "participant": user_chat_identity(database, other_user) if other_user else None,
        "unread_count": participant.unread_count,
        "latest_message": latest_message or "",
        "latest_message_at": latest_message_at.isoformat() if latest_message_at else None,
        "latest_message_time": latest_message_at.strftime("%I:%M %p") if latest_message_at else "",
    }


def save_local_upload_file(upload: UploadFile | None) -> str | None:
    if not upload or not upload.filename:
        return None
    upload_root = Path(settings.upload_directory)
    upload_root.mkdir(parents=True, exist_ok=True)
    suffix = Path(upload.filename).suffix or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    destination = upload_root / filename
    destination.write_bytes(upload.file.read())
    return f"/uploads/{filename}"


def split_profile_list(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.replace("\n", ",").split(",") if item.strip()]


def contractor_profile_is_complete(profile: ContractorProfile | None, contractor_user: User) -> bool:
    if not profile:
        return False
    return all([
        bool(profile.company_name),
        bool(profile.license_number),
        bool(profile.experience_years),
        bool(profile.about),
        bool(profile.service_locations),
        bool(profile.services_offered),
        bool(contractor_user.profile_image_url),
    ])


def contractor_profile_payload(contractor_user: User, profile: ContractorProfile) -> dict:
    gallery_images = split_profile_list(profile.gallery)
    services = split_profile_list(profile.services_offered) or ["Residential Construction", "Commercial Construction", "Renovation & Remodeling"]
    service_locations = split_profile_list(profile.service_locations) or ([contractor_user.address] if contractor_user.address else [])
    documents = split_profile_list(profile.documents)
    equipment = split_profile_list(profile.equipment_owned)
    return {
        "user_id": contractor_user.id,
        "name": contractor_user.name,
        "email": contractor_user.email,
        "phone": contractor_user.phone,
        "address": contractor_user.address,
        "pincode": contractor_user.pincode,
        "rating": contractor_user.rating,
        "profile_image_url": contractor_user.profile_image_url,
        "company_name": profile.company_name,
        "company_logo_url": profile.company_logo_url,
        "license_number": profile.license_number,
        "experience_years": profile.experience_years,
        "completed_projects": profile.completed_projects,
        "about": profile.about,
        "gstin": profile.gstin,
        "pan": profile.pan,
        "website": profile.website,
        "business_type": profile.business_type,
        "registration_year": profile.registration_year,
        "team_size": profile.team_size,
        "insurance_available": profile.insurance_available,
        "service_locations": service_locations,
        "services_offered": services,
        "equipment_owned": equipment,
        "documents": documents,
        "gallery": gallery_images,
        "profile_complete": contractor_profile_is_complete(profile, contractor_user),
    }


def supplier_profile_is_complete(profile: SupplierProfile | None, supplier_user: User) -> bool:
    if not profile:
        return False
    return all([
        bool(profile.store_name),
        bool(profile.categories),
        bool(profile.about),
        bool(profile.delivery_locations),
        bool(supplier_user.phone),
        bool(supplier_user.address),
        bool(supplier_user.pincode),
    ])


def supplier_profile_payload(supplier_user: User, profile: SupplierProfile) -> dict:
    return {
        "user_id": supplier_user.id,
        "name": supplier_user.name,
        "email": supplier_user.email,
        "phone": supplier_user.phone,
        "address": supplier_user.address,
        "pincode": supplier_user.pincode,
        "rating": supplier_user.rating,
        "profile_image_url": supplier_user.profile_image_url,
        "store_name": profile.store_name,
        "store_logo_url": profile.store_logo_url,
        "categories": split_profile_list(profile.categories),
        "about": profile.about,
        "gstin": profile.gstin,
        "pan": profile.pan,
        "website": profile.website,
        "business_type": profile.business_type,
        "registration_year": profile.registration_year,
        "delivery_locations": split_profile_list(profile.delivery_locations),
        "documents": split_profile_list(profile.documents),
        "gallery": split_profile_list(profile.gallery),
        "profile_complete": supplier_profile_is_complete(profile, supplier_user),
    }


def create_notification(database: Session, user_id: int, title: str, body: str):
    database.add(Notification(user_id=user_id, title=title, body=body))


def infer_notification_module(title: str, body: str) -> str:
    content = f"{title} {body}".upper()
    if "MESSAGE" in content:
        return "message"
    if "TIMELINE" in content or "MATERIAL LOG" in content or "LABOUR LOG" in content:
        return "project"
    if "SUPPLIER" in content or "PRODUCT" in content:
        return "supplier"
    if "CONTRACTOR" in content:
        return "contractor"
    if "ESTIMATE" in content:
        return "estimate"
    if "ESCROW" in content or "PAYMENT" in content or "MILESTONE" in content:
        return "escrow"
    if "PROJECT" in content:
        return "project"
    if "REQUEST" in content:
        return "request"
    return "general"


def fetch_latest_owner_project(database: Session, owner_id: int, pincode: str | None = None) -> Project | None:
    query = database.query(Project).filter(Project.owner_id == owner_id)
    if pincode:
        query = query.filter(Project.pincode == pincode)
    return query.order_by(desc(Project.created_at)).first()


def save_upload_files(project_id: int, timeline_id: int, images: list[UploadFile], database: Session) -> list[str]:
    upload_root = Path(settings.upload_directory)
    upload_root.mkdir(parents=True, exist_ok=True)
    image_urls = []
    for image in images:
        suffix = Path(image.filename or "").suffix or ".jpg"
        filename = f"{uuid4().hex}{suffix}"
        destination = upload_root / filename
        destination.write_bytes(image.file.read())
        image_url = f"/uploads/{filename}"
        database.add(ProjectImage(project_id=project_id, timeline_id=timeline_id, image_url=image_url))
        image_urls.append(image_url)
    return image_urls


def create_project_record(payload: ProjectCreate, user: User, database: Session, cover_image_url: str | None = None) -> Project:
    ensure_role(user, "OWNER")
    project = Project(owner_id=user.id, **payload.model_dump(), cover_image_url=cover_image_url)
    database.add(project)
    database.flush()
    database.add_all([
        EscrowMilestone(project_id=project.id, name="Foundation", amount=(payload.budget or 0) * 0.25, status="pending"),
        EscrowMilestone(project_id=project.id, name="Structure", amount=(payload.budget or 0) * 0.45, status="pending"),
        EscrowMilestone(project_id=project.id, name="Finishing", amount=(payload.budget or 0) * 0.30, status="pending"),
    ])
    if payload.construction_type == "SELF_CONSTRUCTION":
        nearby_suppliers = database.query(User).join(SupplierProfile, SupplierProfile.user_id == User.id).filter(User.pincode == payload.pincode).all()
        for supplier in nearby_suppliers:
            create_notification(database, supplier.id, "New self-construction project", f"Supplier opportunity: {payload.title} is available in {payload.pincode}.")
    else:
        nearby_contractors = database.query(User).join(ContractorProfile, ContractorProfile.user_id == User.id).filter(User.pincode == payload.pincode).all()
        for contractor in nearby_contractors:
            create_notification(database, contractor.id, "New contractor project", f"Contractor opportunity: {payload.title} is available in {payload.pincode}.")
    database.commit()
    database.refresh(project)
    return project


@router.post("/auth/signup", response_model=AuthResponse)
def signup_user(payload: SignupRequest, database: Session = Depends(get_database)):
    if database.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    role = payload.role.upper()
    user = User(name=payload.name, email=payload.email, phone=payload.phone, hashed_password=hash_password(payload.password), role=role, address=payload.address, pincode=payload.pincode)
    database.add(user)
    database.flush()
    if role == "OWNER":
        database.add(OwnerProfile(user_id=user.id, building_type=payload.building_type or "RESIDENTIAL", construction_type=payload.construction_type or "CONTRACTOR", budget=payload.budget or 0, land_area=payload.land_area or 0, floors=payload.floors or 1))
    elif role == "CONTRACTOR":
        database.add(ContractorProfile(user_id=user.id, company_name=payload.company_name or payload.name, license_number=payload.license_number, experience_years=payload.experience_years or 0))
    elif role == "SUPPLIER":
        database.add(SupplierProfile(user_id=user.id, store_name=payload.store_name or payload.name, categories=payload.categories or ""))
    else:
        raise HTTPException(status_code=400, detail="Invalid role")
    database.commit()
    database.refresh(user)
    return auth_payload(user)


@router.post("/auth/login", response_model=AuthResponse)
def login_user(payload: LoginRequest, database: Session = Depends(get_database)):
    user = database.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return auth_payload(user)


@router.patch("/auth/complete-profile", response_model=UserResponse)
def complete_user_profile(payload: CompleteProfileRequest, user: User = Depends(current_user), database: Session = Depends(get_database)):
    if payload.name is not None:
        user.name = payload.name.strip() or user.name
    user.phone = payload.phone
    user.address = payload.address
    user.pincode = payload.pincode
    if payload.profile_image_url:
        user.profile_image_url = payload.profile_image_url

    if user.role == "OWNER":
        profile = user.owner_profile or OwnerProfile(user_id=user.id)
        profile.building_type = payload.building_type or profile.building_type or "RESIDENTIAL"
        profile.construction_type = payload.construction_type or profile.construction_type or "CONTRACTOR"
        profile.budget = payload.budget or 0
        profile.land_area = payload.land_area or 0
        profile.floors = payload.floors or 1
        database.add(profile)
    elif user.role == "CONTRACTOR":
        profile = user.contractor_profile or ContractorProfile(user_id=user.id, company_name=payload.company_name or user.name)
        profile.company_name = payload.company_name or profile.company_name or user.name
        profile.company_logo_url = payload.company_logo_url or profile.company_logo_url
        profile.license_number = payload.license_number or profile.license_number or ""
        profile.experience_years = payload.experience_years or 0
        profile.about = payload.about or profile.about
        profile.gstin = payload.gstin or profile.gstin
        profile.pan = payload.pan or profile.pan
        profile.website = payload.website or profile.website
        profile.business_type = payload.business_type or profile.business_type
        profile.registration_year = payload.registration_year or profile.registration_year
        profile.team_size = payload.team_size or profile.team_size
        profile.insurance_available = bool(payload.insurance_available)
        profile.service_locations = payload.service_locations or profile.service_locations
        profile.services_offered = payload.services_offered or profile.services_offered
        profile.equipment_owned = payload.equipment_owned or profile.equipment_owned
        profile.documents = payload.documents or profile.documents
        profile.gallery = payload.gallery or profile.gallery
        database.add(profile)
    elif user.role == "SUPPLIER":
        profile = user.supplier_profile or SupplierProfile(user_id=user.id, store_name=payload.store_name or user.name)
        profile.store_name = payload.store_name or profile.store_name or user.name
        profile.store_logo_url = payload.store_logo_url or profile.store_logo_url
        profile.categories = payload.categories or profile.categories or ""
        profile.about = payload.about or profile.about
        profile.gstin = payload.gstin or profile.gstin
        profile.pan = payload.pan or profile.pan
        profile.website = payload.website or profile.website
        profile.business_type = payload.business_type or profile.business_type
        profile.registration_year = payload.registration_year or profile.registration_year
        profile.delivery_locations = payload.service_locations or profile.delivery_locations
        profile.documents = payload.documents or profile.documents
        profile.gallery = payload.gallery or profile.gallery
        database.add(profile)

    database.commit()
    database.refresh(user)
    return UserResponse.model_validate(user)


@router.patch("/auth/profile-image", response_model=UserResponse)
def update_profile_image(payload: ProfileImageUpdate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    user.profile_image_url = payload.profile_image_url
    database.commit()
    database.refresh(user)
    return user


@router.patch("/auth/business-logo")
def update_business_logo(payload: BusinessLogoUpdate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    if user.role == "CONTRACTOR":
        profile = user.contractor_profile
        if not profile:
            raise HTTPException(status_code=404, detail="Contractor profile not found")
        profile.company_logo_url = payload.logo_url
        database.add(profile)
        database.commit()
        database.refresh(profile)
        return contractor_profile_payload(user, profile)
    if user.role == "SUPPLIER":
        profile = user.supplier_profile
        if not profile:
            raise HTTPException(status_code=404, detail="Supplier profile not found")
        profile.store_logo_url = payload.logo_url
        database.add(profile)
        database.commit()
        database.refresh(profile)
        return supplier_profile_payload(user, profile)
    raise HTTPException(status_code=403, detail="Business logo is available only for contractors and suppliers")


@router.get("/auth/oauth/google/start")
def start_google_oauth(role: str = Query(default="OWNER")):
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured")
    query = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": role.upper(),
    })
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}", status_code=302)


@router.get("/auth/oauth/google/callback")
async def complete_google_oauth(code: str, state: str | None = None, database: Session = Depends(get_database)):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured")
    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        })
        token_response.raise_for_status()
        access_token = token_response.json()["access_token"]
        profile_response = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={"Authorization": f"Bearer {access_token}"})
        profile_response.raise_for_status()
    profile = profile_response.json()
    email = profile.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account email is required")
    user = upsert_oauth_user(database, email=email, name=profile.get("name") or "", role=role_from_oauth_state(state))
    return redirect_with_auth(user)


@router.get("/auth/oauth/microsoft/start")
def start_microsoft_oauth(role: str = Query(default="OWNER")):
    if not settings.microsoft_client_id:
        raise HTTPException(status_code=503, detail="Microsoft OAuth is not configured")
    query = urlencode({
        "client_id": settings.microsoft_client_id,
        "redirect_uri": settings.microsoft_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile User.Read",
        "response_mode": "query",
        "state": role.upper(),
    })
    return RedirectResponse(f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?{query}", status_code=302)


@router.get("/auth/oauth/microsoft/callback")
async def complete_microsoft_oauth(code: str, state: str | None = None, database: Session = Depends(get_database)):
    if not settings.microsoft_client_id or not settings.microsoft_client_secret:
        raise HTTPException(status_code=503, detail="Microsoft OAuth is not configured")
    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post("https://login.microsoftonline.com/common/oauth2/v2.0/token", data={
            "code": code,
            "client_id": settings.microsoft_client_id,
            "client_secret": settings.microsoft_client_secret,
            "redirect_uri": settings.microsoft_redirect_uri,
            "grant_type": "authorization_code",
        })
        token_response.raise_for_status()
        access_token = token_response.json()["access_token"]
        profile_response = await client.get("https://graph.microsoft.com/oidc/userinfo", headers={"Authorization": f"Bearer {access_token}"})
        profile_response.raise_for_status()
    profile = profile_response.json()
    email = profile.get("email") or profile.get("preferred_username")
    if not email:
        raise HTTPException(status_code=400, detail="Microsoft account email is required")
    user = upsert_oauth_user(database, email=email, name=profile.get("name") or "", role=role_from_oauth_state(state))
    return redirect_with_auth(user)


@router.get("/locations/pincode/{pincode}")
async def lookup_pincode_area(pincode: str):
    cleaned_pincode = "".join(character for character in pincode if character.isdigit())
    if len(cleaned_pincode) < 5:
        raise HTTPException(status_code=400, detail="Enter a valid pincode / zip code")

    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(f"https://api.postalpincode.in/pincode/{cleaned_pincode}")
        response.raise_for_status()

    payload = response.json()
    result = payload[0] if payload else {}
    post_offices = result.get("PostOffice") or []
    if result.get("Status") != "Success" or not post_offices:
        raise HTTPException(status_code=404, detail="No area found for this pincode")

    primary_area = post_offices[0]
    area_names = [item.get("Name") for item in post_offices if item.get("Name")]
    district = primary_area.get("District") or ""
    state = primary_area.get("State") or ""
    country = primary_area.get("Country") or "India"
    display = ", ".join(item for item in [area_names[0] if area_names else "", district, state] if item)
    return {
        "pincode": cleaned_pincode,
        "area": area_names[0] if area_names else "",
        "areas": area_names,
        "city": district,
        "district": district,
        "state": state,
        "country": country,
        "display": display,
    }


@router.post("/files/upload")
def upload_profile_file(file: UploadFile = File(...), user: User = Depends(current_user)):
    file_url = save_local_upload_file(file)
    if not file_url:
        raise HTTPException(status_code=400, detail="File upload failed")
    return {"url": file_url}


@router.get("/owners/projects")
def fetch_owner_projects(user: User = Depends(current_user), database: Session = Depends(get_database)):
    query = database.query(Project).options(selectinload(Project.escrow_milestones)).order_by(desc(Project.created_at))
    if user.role == "OWNER":
        query = query.filter(Project.owner_id == user.id)
    elif user.role == "CONTRACTOR":
        query = query.filter(Project.contractor_id == user.id)
    else:
        query = query.filter(Project.pincode == user.pincode)
    return query.all()


@router.post("/projects/create")
def create_project_request(payload: ProjectCreate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    return create_project_record(payload, user, database)


@router.post("/projects/create-with-image")
def create_project_with_image(
    title: str = Form(...),
    description: str = Form(...),
    address: str = Form(...),
    pincode: str = Form(...),
    building_type: str = Form(...),
    construction_type: str = Form(...),
    budget: float = Form(default=0),
    land_area: float = Form(default=0),
    floors: int = Form(default=1),
    image: UploadFile | None = File(default=None),
    user: User = Depends(current_user),
    database: Session = Depends(get_database),
):
    cover_image_url = save_local_upload_file(image)
    payload = ProjectCreate(
        title=title,
        description=description,
        address=address,
        pincode=pincode,
        building_type=building_type,
        construction_type=construction_type,
        budget=budget,
        land_area=land_area,
        floors=floors,
    )
    return create_project_record(payload, user, database, cover_image_url=cover_image_url)


@router.get("/projects/{project_id}")
def fetch_project_details(project_id: int, user: User = Depends(current_user), database: Session = Depends(get_database)):
    project = database.query(Project).options(selectinload(Project.timelines).selectinload(ProjectTimeline.images), selectinload(Project.escrow_milestones)).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user.id not in [project.owner_id, project.contractor_id] and user.pincode != project.pincode:
        raise HTTPException(status_code=403, detail="Project access denied")
    return project


@router.get("/contractors/nearby")
def fetch_nearby_contractors(pincode: str | None = Query(default=None), user: User = Depends(current_user), database: Session = Depends(get_database)):
    matching_pincode = (pincode or "").strip()
    latest_project = None
    if not matching_pincode and user.role == "OWNER":
        latest_project = fetch_latest_owner_project(database, user.id)
        matching_pincode = (latest_project.pincode if latest_project else "") or ""
    matching_pincode = matching_pincode or (user.pincode or "")
    if user.role == "OWNER" and not latest_project:
        latest_project = fetch_latest_owner_project(database, user.id, matching_pincode)

    query = (
        database.query(ContractorProfile, User)
        .join(User, ContractorProfile.user_id == User.id)
        .filter(User.pincode == matching_pincode)
    )
    if latest_project:
        accepted_contractor_ids = [
            item.sender_id if item.sender_id != user.id else item.receiver_id
            for item in database.query(ProjectRequest)
            .filter(
                ProjectRequest.project_id == latest_project.id,
                ProjectRequest.status == "accepted",
                ProjectRequest.request_type.in_(["OWNER_TO_CONTRACTOR", "CONTRACTOR_TO_OWNER"]),
            )
            .all()
        ]
        excluded_contractor_ids = set(accepted_contractor_ids)
        if latest_project.contractor_id:
            excluded_contractor_ids.add(latest_project.contractor_id)
        if excluded_contractor_ids:
            query = query.filter(User.id.notin_(excluded_contractor_ids))

    contractors = query.order_by(desc(User.rating), desc(User.created_at)).all()
    return [
        {
            "id": profile.id,
            "user_id": contractor_user.id,
            "name": contractor_user.name,
            "company_name": profile.company_name,
            "company_logo_url": profile.company_logo_url,
            "pincode": contractor_user.pincode,
            "rating": contractor_user.rating,
            "experience_years": profile.experience_years,
            "completed_projects": profile.completed_projects,
            "gallery": profile.gallery,
            "profile_image_url": contractor_user.profile_image_url,
            "profile_complete": contractor_profile_is_complete(profile, contractor_user),
        }
        for profile, contractor_user in contractors
    ]


@router.get("/contractors/{contractor_id}/profile")
def fetch_contractor_profile(contractor_id: int, user: User = Depends(current_user), database: Session = Depends(get_database)):
    contractor_user = database.query(User).filter(User.id == contractor_id, User.role == "CONTRACTOR").first()
    if not contractor_user or not contractor_user.contractor_profile:
        raise HTTPException(status_code=404, detail="Contractor profile not found")
    return contractor_profile_payload(contractor_user, contractor_user.contractor_profile)


@router.get("/suppliers/nearby")
def fetch_nearby_suppliers(pincode: str | None = Query(default=None), user: User = Depends(current_user), database: Session = Depends(get_database)):
    matching_pincode = (pincode or "").strip()
    latest_project = None
    if not matching_pincode and user.role == "OWNER":
        latest_project = fetch_latest_owner_project(database, user.id)
        matching_pincode = (latest_project.pincode if latest_project else "") or ""
    matching_pincode = matching_pincode or (user.pincode or "")
    if user.role == "OWNER" and not latest_project:
        latest_project = fetch_latest_owner_project(database, user.id, matching_pincode)

    query = (
        database.query(SupplierProfile, User)
        .join(User, SupplierProfile.user_id == User.id)
        .filter(User.pincode == matching_pincode)
    )
    if latest_project:
        accepted_supplier_ids = [
            item.sender_id if item.sender_id != user.id else item.receiver_id
            for item in database.query(ProjectRequest)
            .filter(
                ProjectRequest.project_id == latest_project.id,
                ProjectRequest.status == "accepted",
                ProjectRequest.request_type.in_(["OWNER_TO_SUPPLIER", "SUPPLIER_TO_OWNER"]),
            )
            .all()
        ]
        if accepted_supplier_ids:
            query = query.filter(User.id.notin_(accepted_supplier_ids))

    suppliers = query.order_by(desc(User.rating), desc(User.created_at)).all()
    return [
        {
            "id": profile.id,
            "user_id": supplier_user.id,
            "name": supplier_user.name,
            "store_name": profile.store_name,
            "store_logo_url": profile.store_logo_url,
            "categories": profile.categories,
            "pincode": supplier_user.pincode,
            "rating": supplier_user.rating,
            "profile_image_url": supplier_user.profile_image_url,
            "profile_complete": supplier_profile_is_complete(profile, supplier_user),
        }
        for profile, supplier_user in suppliers
    ]


@router.get("/suppliers/{supplier_id}/profile")
def fetch_supplier_profile(supplier_id: int, user: User = Depends(current_user), database: Session = Depends(get_database)):
    supplier_user = database.query(User).filter(User.id == supplier_id, User.role == "SUPPLIER").first()
    if not supplier_user or not supplier_user.supplier_profile:
        raise HTTPException(status_code=404, detail="Supplier profile not found")
    return supplier_profile_payload(supplier_user, supplier_user.supplier_profile)


@router.get("/contractors/find-clients")
def fetch_nearby_projects(user: User = Depends(current_user), database: Session = Depends(get_database)):
    ensure_role(user, "CONTRACTOR")
    recent_cutoff = datetime.utcnow() - timedelta(days=5)
    return database.query(Project).filter(Project.pincode == user.pincode, Project.contractor_id.is_(None), Project.created_at >= recent_cutoff).order_by(desc(Project.created_at)).all()


@router.get("/suppliers/find-clients")
def fetch_supplier_clients(user: User = Depends(current_user), database: Session = Depends(get_database)):
    ensure_role(user, "SUPPLIER")
    owner_projects = (
        database.query(Project, User)
        .join(User, Project.owner_id == User.id)
        .filter(Project.pincode == user.pincode, Project.construction_type == "SELF_CONSTRUCTION")
        .order_by(desc(Project.created_at))
        .all()
    )
    accepted_owner_project_ids = {
        item.project_id
        for item in database.query(ProjectRequest)
        .filter(
            ProjectRequest.status == "accepted",
            ProjectRequest.project_id.isnot(None),
            ProjectRequest.request_type.in_(["OWNER_TO_SUPPLIER", "SUPPLIER_TO_OWNER"]),
            or_(ProjectRequest.sender_id == user.id, ProjectRequest.receiver_id == user.id),
        )
        .all()
    }
    owner_projects = [(project, owner) for project, owner in owner_projects if project.id not in accepted_owner_project_ids]

    accepted_contractor_ids = {
        item.sender_id if item.sender_id != user.id else item.receiver_id
        for item in database.query(ProjectRequest)
        .filter(
            ProjectRequest.status == "accepted",
            ProjectRequest.request_type.in_(["SUPPLIER_TO_CONTRACTOR", "CONTRACTOR_TO_SUPPLIER"]),
            or_(ProjectRequest.sender_id == user.id, ProjectRequest.receiver_id == user.id),
        )
        .all()
    }
    contractors = (
        database.query(User)
        .join(ContractorProfile, ContractorProfile.user_id == User.id)
        .filter(User.pincode == user.pincode)
        .order_by(desc(User.rating), desc(User.created_at))
    )
    if accepted_contractor_ids:
        contractors = contractors.filter(User.id.notin_(accepted_contractor_ids))
    contractors = contractors.all()
    owner_clients = [
        {
            "user_id": owner.id,
            "name": owner.name,
            "type": owner.role,
            "pincode": project.pincode,
            "project_id": project.id,
            "project_title": project.title,
            "project_image_url": project.cover_image_url,
            "construction_type": project.construction_type,
        }
        for project, owner in owner_projects
    ]
    contractor_clients = [{"user_id": item.id, "name": item.name, "type": item.role, "pincode": item.pincode} for item in contractors]
    return owner_clients + contractor_clients


@router.post("/project-requests/send")
def send_project_request(payload: ProjectRequestCreate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    receiver = database.get(User, payload.receiver_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="Request receiver not found")
    if receiver.id == user.id:
        raise HTTPException(status_code=400, detail="You cannot send a request to yourself")

    project = None
    if payload.project_id:
        project = database.get(Project, payload.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

    if payload.request_type == "OWNER_TO_CONTRACTOR":
        ensure_role(user, "OWNER")
        if not project:
            raise HTTPException(status_code=400, detail="Create a project before contacting a contractor")
        if project.owner_id != user.id:
            raise HTTPException(status_code=403, detail="You can only send requests for your own project")
        if receiver.role != "CONTRACTOR":
            raise HTTPException(status_code=400, detail="Selected user is not a contractor")
        if project.contractor_id:
            raise HTTPException(status_code=400, detail="This project already has a contractor")
        if receiver.pincode != project.pincode:
            raise HTTPException(status_code=400, detail="Contractor pincode does not match this project")

    if payload.request_type == "CONTRACTOR_TO_OWNER":
        ensure_role(user, "CONTRACTOR")
        if not project:
            raise HTTPException(status_code=400, detail="Project is required")
        if project.owner_id != receiver.id:
            raise HTTPException(status_code=400, detail="Project owner does not match request receiver")
        if project.contractor_id:
            raise HTTPException(status_code=400, detail="This project already has a contractor")
        if user.pincode != project.pincode:
            raise HTTPException(status_code=400, detail="Project pincode does not match your profile")

    if payload.request_type == "OWNER_TO_SUPPLIER":
        ensure_role(user, "OWNER")
        if not project:
            raise HTTPException(status_code=400, detail="Create a self-construction project before contacting a supplier")
        if project.owner_id != user.id:
            raise HTTPException(status_code=403, detail="You can only send requests for your own project")
        if project.construction_type != "SELF_CONSTRUCTION":
            raise HTTPException(status_code=400, detail="Supplier requests are available for self-construction projects")
        if receiver.role != "SUPPLIER":
            raise HTTPException(status_code=400, detail="Selected user is not a supplier")
        if receiver.pincode != project.pincode:
            raise HTTPException(status_code=400, detail="Supplier pincode does not match this project")

    if payload.request_type == "SUPPLIER_TO_OWNER":
        ensure_role(user, "SUPPLIER")
        if not project:
            raise HTTPException(status_code=400, detail="Self-construction project is required")
        if receiver.role != "OWNER":
            raise HTTPException(status_code=400, detail="Selected user is not a house owner")
        if project.owner_id != receiver.id:
            raise HTTPException(status_code=400, detail="Project owner does not match request receiver")
        if project.construction_type != "SELF_CONSTRUCTION":
            raise HTTPException(status_code=400, detail="Suppliers can contact self-construction projects only")
        if user.pincode != project.pincode:
            raise HTTPException(status_code=400, detail="Project pincode does not match your supplier profile")

    existing_request = (
        database.query(ProjectRequest)
        .filter(
            ProjectRequest.sender_id == user.id,
            ProjectRequest.receiver_id == payload.receiver_id,
            ProjectRequest.project_id == payload.project_id,
            ProjectRequest.request_type == payload.request_type,
            ProjectRequest.status.in_(["pending", "accepted"]),
        )
        .first()
    )
    if existing_request:
        raise HTTPException(status_code=409, detail="Request already sent")

    request = ProjectRequest(sender_id=user.id, receiver_id=payload.receiver_id, project_id=payload.project_id, request_type=payload.request_type)
    database.add(request)
    create_notification(
        database,
        payload.receiver_id,
        "New request",
        f"{payload.request_type}: {user.name} sent a request{f' for {project.title}' if project else ''}.",
    )
    database.commit()
    database.refresh(request)
    return request


@router.get("/notifications")
def fetch_user_notifications(user: User = Depends(current_user), database: Session = Depends(get_database)):
    notifications = (
        database.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(desc(Notification.created_at))
        .limit(60)
        .all()
    )
    dashboard_notifications = [
        item for item in notifications
        if infer_notification_module(item.title, item.body) != "message"
    ][:30]
    return [
        {
            "id": item.id,
            "title": item.title,
            "body": item.body,
            "is_read": item.is_read,
            "module": infer_notification_module(item.title, item.body),
            "created_at": item.created_at.strftime("%d %b %Y, %I:%M %p"),
        }
        for item in dashboard_notifications
    ]


@router.post("/notifications/read-all")
def mark_notifications_read(user: User = Depends(current_user), database: Session = Depends(get_database)):
    notifications = database.query(Notification).filter(Notification.user_id == user.id, Notification.is_read.is_(False)).all()
    for notification in notifications:
        if infer_notification_module(notification.title, notification.body) != "message":
            notification.is_read = True
    database.commit()
    return {"status": "read"}


@router.post("/notifications/read-module")
def mark_module_notifications_read(module: str = Query(...), user: User = Depends(current_user), database: Session = Depends(get_database)):
    requested_module = module.strip().lower()
    notifications = database.query(Notification).filter(Notification.user_id == user.id, Notification.is_read.is_(False)).all()
    for notification in notifications:
        if infer_notification_module(notification.title, notification.body) == requested_module:
            notification.is_read = True
    database.commit()
    return {"status": "read", "module": requested_module}


@router.get("/project-requests/incoming")
def fetch_incoming_requests(user: User = Depends(current_user), database: Session = Depends(get_database)):
    requests = database.query(ProjectRequest).options(selectinload(ProjectRequest.sender), selectinload(ProjectRequest.project)).filter(ProjectRequest.receiver_id == user.id).order_by(desc(ProjectRequest.created_at)).all()
    return [
        {
            "id": item.id,
            "sender_name": item.sender.name,
            "sender_role": item.sender.role,
            "sender_address": item.sender.address,
            "sender_pincode": item.sender.pincode,
            "project_title": item.project.title if item.project else "General",
            "project_address": item.project.address if item.project else "",
            "project_pincode": item.project.pincode if item.project else "",
            "building_type": item.project.building_type if item.project else "",
            "construction_type": item.project.construction_type if item.project else "",
            "budget": item.project.budget if item.project else 0,
            "land_area": item.project.land_area if item.project else 0,
            "floors": item.project.floors if item.project else 0,
            "request_type": item.request_type,
            "status": item.status,
            "created_at": item.created_at.strftime("%d %b %Y, %I:%M %p"),
        }
        for item in requests
    ]


@router.post("/project-requests/accept")
def accept_project_request(payload: RequestDecision, user: User = Depends(current_user), database: Session = Depends(get_database)):
    request = database.get(ProjectRequest, payload.request_id)
    if not request or request.receiver_id != user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    request.status = "accepted"
    if request.project_id and "CONTRACTOR" in request.request_type:
        project = database.get(Project, request.project_id)
        if project:
            project.contractor_id = request.sender_id if user.role == "OWNER" else user.id
            create_conversation_for_users(database, project.title, [project.owner_id, project.contractor_id])
    else:
        create_conversation_for_users(database, "Material request", [request.sender_id, request.receiver_id])
    create_notification(database, request.sender_id, "Request accepted", f"{user.name} accepted your {request.request_type} request.")
    database.commit()
    return {"status": "accepted"}


@router.post("/project-requests/reject")
def reject_project_request(payload: RequestDecision, user: User = Depends(current_user), database: Session = Depends(get_database)):
    request = database.get(ProjectRequest, payload.request_id)
    if not request or request.receiver_id != user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    request.status = "rejected"
    create_notification(database, request.sender_id, "Request rejected", f"{user.name} rejected your {request.request_type} request.")
    database.commit()
    return {"status": "rejected"}


@router.post("/timelines/create")
def save_timeline_update(project_id: int, title: str = Form(...), description: str = Form(...), date: str = Form(...), completion_status: str = Form(...), images: list[UploadFile] = File(default=[]), user: User = Depends(current_user), database: Session = Depends(get_database)):
    project = database.get(Project, project_id)
    if not project or project.contractor_id != user.id:
        raise HTTPException(status_code=403, detail="Only assigned contractor can update timeline")
    timeline = ProjectTimeline(project_id=project_id, title=title, description=description, date=datetime.fromisoformat(date), completion_status=completion_status)
    database.add(timeline)
    database.flush()
    save_upload_files(project_id, timeline.id, images, database)
    create_notification(database, project.owner_id, "Project timeline updated", f"{user.name} added timeline update: {title}.")
    database.commit()
    database.refresh(timeline)
    return timeline


@router.get("/timelines/project/{project_id}")
def fetch_project_timeline_entries(project_id: int, user: User = Depends(current_user), database: Session = Depends(get_database)):
    project = database.get(Project, project_id)
    if not project or user.id not in [project.owner_id, project.contractor_id]:
        raise HTTPException(status_code=403, detail="Timeline access denied")
    return database.query(ProjectTimeline).options(selectinload(ProjectTimeline.images)).filter(ProjectTimeline.project_id == project_id).order_by(ProjectTimeline.date).all()


@router.post("/materials/create")
def save_material_log(payload: MaterialCreate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    ensure_role(user, "CONTRACTOR")
    log = MaterialLog(**payload.model_dump())
    database.add(log)
    project = database.get(Project, payload.project_id)
    if project:
        create_notification(database, project.owner_id, "Material log updated", f"{user.name} added material entry: {payload.material_name}.")
    database.commit()
    database.refresh(log)
    return log


@router.post("/labour/create")
def save_labour_log(payload: LabourCreate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    ensure_role(user, "CONTRACTOR")
    log = LabourLog(**payload.model_dump())
    database.add(log)
    project = database.get(Project, payload.project_id)
    if project:
        create_notification(database, project.owner_id, "Labour log updated", f"{user.name} added labour details for the project.")
    database.commit()
    database.refresh(log)
    return log


@router.post("/messages/send")
async def send_message(payload: MessageCreate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    conversation = None
    if payload.conversation_id:
        conversation = database.get(Conversation, payload.conversation_id)
    elif payload.receiver_id:
        receiver = database.get(User, payload.receiver_id)
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver not found")
        conversation = find_direct_conversation(database, user.id, receiver.id)
        if not conversation:
            conversation = create_conversation_for_users(database, f"{user.name} and {receiver.name}", [user.id, receiver.id])
            database.flush()
    if not conversation:
        raise HTTPException(status_code=400, detail="conversation_id or receiver_id is required")
    participant = database.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == conversation.id, ConversationParticipant.user_id == user.id).first()
    if not participant:
        raise HTTPException(status_code=403, detail="Conversation access denied")
    receiver_participant = database.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == conversation.id, ConversationParticipant.user_id != user.id).first()
    created_at = datetime.utcnow()
    message = Message(
        conversation_id=conversation.id,
        sender_id=user.id,
        receiver_id=receiver_participant.user_id if receiver_participant else payload.receiver_id,
        body=payload.body,
        attachment_url=payload.attachment_url,
        message_type=(payload.message_type or ("IMAGE" if payload.attachment_url else "TEXT")).upper(),
        created_at=created_at,
    )
    database.add(message)
    conversation.last_message = payload.body
    conversation.last_message_at = created_at
    database.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == conversation.id, ConversationParticipant.user_id != user.id).update({ConversationParticipant.unread_count: ConversationParticipant.unread_count + 1})
    database.commit()
    database.refresh(message)
    await chat_connections.broadcast(conversation.id, {
        "event": "message",
        "message": {
            "id": message.id,
            "body": message.body,
            "attachment_url": message.attachment_url,
            "messageType": message.message_type,
            "createdAt": message.created_at.isoformat(),
            "senderId": str(message.sender_id),
            "receiverId": str(message.receiver_id or ""),
        },
    })
    return message


@router.post("/messages/start")
def start_conversation(payload: ConversationStart, user: User = Depends(current_user), database: Session = Depends(get_database)):
    if payload.receiver_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot start a conversation with yourself")
    receiver = database.get(User, payload.receiver_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    conversation = find_direct_conversation(database, user.id, receiver.id)
    if not conversation:
        title = payload.title or f"{user.name} and {receiver.name}"
        conversation = create_conversation_for_users(database, title, [user.id, receiver.id])
        database.commit()
        database.refresh(conversation)
    return {"id": conversation.id, "title": conversation.title, "participant": user_chat_identity(database, receiver)}


@router.get("/messages/conversations")
def fetch_conversations(user: User = Depends(current_user), database: Session = Depends(get_database)):
    participants = (
        database.query(ConversationParticipant)
        .options(
            selectinload(ConversationParticipant.conversation).selectinload(Conversation.messages),
            selectinload(ConversationParticipant.conversation).selectinload(Conversation.participants).selectinload(ConversationParticipant.user).selectinload(User.contractor_profile),
            selectinload(ConversationParticipant.conversation).selectinload(Conversation.participants).selectinload(ConversationParticipant.user).selectinload(User.supplier_profile),
        )
        .filter(ConversationParticipant.user_id == user.id)
        .all()
    )
    payloads = [conversation_payload(database, item, user.id) for item in participants]
    return sorted(payloads, key=lambda item: item["latest_message_at"] or "", reverse=True)


@router.get("/messages/conversation/{conversation_id}")
def fetch_conversation_messages(conversation_id: int, search: str | None = Query(default=None), limit: int = Query(default=30, ge=1, le=100), before_id: int | None = Query(default=None), user: User = Depends(current_user), database: Session = Depends(get_database)):
    participant = database.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == conversation_id, ConversationParticipant.user_id == user.id).first()
    if not participant:
        raise HTTPException(status_code=403, detail="Conversation access denied")
    participant.unread_count = 0
    database.query(Message).filter(Message.conversation_id == conversation_id, Message.receiver_id == user.id, Message.read_at.is_(None)).update({Message.read_at: datetime.utcnow()})
    query = database.query(Message).filter(Message.conversation_id == conversation_id)
    if search:
        query = query.filter(Message.body.ilike(f"%{search}%"))
    if before_id:
        anchor = database.get(Message, before_id)
        if anchor:
            query = query.filter(Message.created_at < anchor.created_at)
    messages = list(reversed(query.order_by(desc(Message.created_at)).limit(limit).all()))
    database.commit()
    return [{
        "id": item.id,
        "messageId": str(item.id),
        "conversationId": str(item.conversation_id),
        "senderId": str(item.sender_id),
        "receiverId": str(item.receiver_id or ""),
        "messageType": item.message_type,
        "body": item.body,
        "content": item.body,
        "attachment_url": item.attachment_url,
        "created_at": item.created_at.strftime("%d %b %Y, %I:%M %p"),
        "createdAt": item.created_at.isoformat(),
        "read": bool(item.read_at),
        "is_mine": item.sender_id == user.id,
    } for item in messages]


@router.websocket("/messages/ws/{conversation_id}")
async def conversation_websocket(websocket: WebSocket, conversation_id: int, token: str = Query(default="")):
    user_id = read_token_user_id(token)
    if not user_id:
        await websocket.close(code=1008)
        return
    database = next(get_database())
    try:
        participant = database.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == conversation_id, ConversationParticipant.user_id == int(user_id)).first()
        if not participant:
            await websocket.close(code=1008)
            return
        await chat_connections.connect(conversation_id, websocket)
        await websocket.send_json({"event": "online", "conversation_id": conversation_id})
        while True:
            incoming = await websocket.receive_json()
            if incoming.get("event") in ["typing", "read"]:
                await chat_connections.broadcast(conversation_id, {"event": incoming.get("event"), "user_id": int(user_id)})
    except WebSocketDisconnect:
        chat_connections.disconnect(conversation_id, websocket)
    finally:
        database.close()


@router.get("/supplier-products")
def fetch_supplier_products(user: User = Depends(current_user), database: Session = Depends(get_database)):
    ensure_role(user, "SUPPLIER")
    return database.query(SupplierProduct).filter(SupplierProduct.supplier_id == user.id).order_by(desc(SupplierProduct.created_at)).all()


@router.post("/supplier-products")
def save_supplier_product(payload: SupplierProductCreate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    ensure_role(user, "SUPPLIER")
    product = SupplierProduct(supplier_id=user.id, **payload.model_dump())
    database.add(product)
    database.commit()
    database.refresh(product)
    return product


@router.delete("/supplier-products/{product_id}")
def delete_supplier_product(product_id: int, user: User = Depends(current_user), database: Session = Depends(get_database)):
    product = database.query(SupplierProduct).filter(SupplierProduct.id == product_id, SupplierProduct.supplier_id == user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    database.delete(product)
    database.commit()
    return {"deleted": True}


@router.post("/estimates")
def save_estimate(payload: EstimateCreate, user: User = Depends(current_user), database: Session = Depends(get_database)):
    ensure_role(user, "OWNER")
    base_rate = 2400 if payload.finishing_type.lower() == "premium" else 1900
    estimated_cost = payload.plot_area * payload.floors * base_rate
    estimate = Estimate(owner_id=user.id, **payload.model_dump(), estimated_cost=estimated_cost, estimated_duration_days=max(90, payload.floors * 90), material_estimate=estimated_cost * 0.62, labour_estimate=estimated_cost * 0.28)
    database.add(estimate)
    database.commit()
    database.refresh(estimate)
    return estimate
