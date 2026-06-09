from datetime import datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), index=True, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=0)
    profile_image_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    owner_profile = relationship("OwnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    contractor_profile = relationship("ContractorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    supplier_profile = relationship("SupplierProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    @property
    def profile_complete(self) -> bool:
        if not self.phone or not self.address or not self.pincode:
            return False
        if self.role == "CONTRACTOR":
            profile = self.contractor_profile
            return bool(
                profile
                and profile.company_name
                and profile.license_number
                and profile.experience_years
                and profile.about
                and profile.service_locations
                and profile.services_offered
            )
        if self.role == "SUPPLIER":
            profile = self.supplier_profile
            return bool(
                profile
                and profile.store_name
                and profile.categories
                and profile.about
                and profile.delivery_locations
            )
        return True


class OwnerProfile(Base):
    __tablename__ = "owner_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    building_type: Mapped[str] = mapped_column(String(60), default="RESIDENTIAL")
    construction_type: Mapped[str] = mapped_column(String(60), default="CONTRACTOR")
    budget: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    land_area: Mapped[float] = mapped_column(Float, default=0)
    floors: Mapped[int] = mapped_column(Integer, default=1)
    user = relationship("User", back_populates="owner_profile")


class ContractorProfile(Base):
    __tablename__ = "contractor_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    company_name: Mapped[str] = mapped_column(String(160), nullable=False)
    license_number: Mapped[str | None] = mapped_column(String(100))
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    completed_projects: Mapped[int] = mapped_column(Integer, default=0)
    gallery: Mapped[str | None] = mapped_column(Text)
    company_logo_url: Mapped[str | None] = mapped_column(String(500))
    about: Mapped[str | None] = mapped_column(Text)
    gstin: Mapped[str | None] = mapped_column(String(60))
    pan: Mapped[str | None] = mapped_column(String(60))
    website: Mapped[str | None] = mapped_column(String(255))
    business_type: Mapped[str | None] = mapped_column(String(120))
    registration_year: Mapped[int | None] = mapped_column(Integer)
    team_size: Mapped[str | None] = mapped_column(String(80))
    insurance_available: Mapped[bool] = mapped_column(Boolean, default=False)
    service_locations: Mapped[str | None] = mapped_column(Text)
    services_offered: Mapped[str | None] = mapped_column(Text)
    equipment_owned: Mapped[str | None] = mapped_column(Text)
    documents: Mapped[str | None] = mapped_column(Text)
    user = relationship("User", back_populates="contractor_profile")


class SupplierProfile(Base):
    __tablename__ = "supplier_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    store_name: Mapped[str] = mapped_column(String(160), nullable=False)
    categories: Mapped[str] = mapped_column(Text, default="")
    about: Mapped[str | None] = mapped_column(Text)
    gstin: Mapped[str | None] = mapped_column(String(60))
    pan: Mapped[str | None] = mapped_column(String(60))
    website: Mapped[str | None] = mapped_column(String(255))
    business_type: Mapped[str | None] = mapped_column(String(120))
    registration_year: Mapped[int | None] = mapped_column(Integer)
    delivery_locations: Mapped[str | None] = mapped_column(Text)
    documents: Mapped[str | None] = mapped_column(Text)
    gallery: Mapped[str | None] = mapped_column(Text)
    store_logo_url: Mapped[str | None] = mapped_column(String(500))
    user = relationship("User", back_populates="supplier_profile")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    contractor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    building_type: Mapped[str] = mapped_column(String(60), default="RESIDENTIAL")
    construction_type: Mapped[str] = mapped_column(String(60), default="CONTRACTOR")
    budget: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    land_area: Mapped[float] = mapped_column(Float, default=0)
    floors: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(40), default="active")
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0)
    cover_image_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    owner = relationship("User", foreign_keys=[owner_id])
    contractor = relationship("User", foreign_keys=[contractor_id])
    timelines = relationship("ProjectTimeline", back_populates="project", cascade="all, delete-orphan")
    escrow_milestones = relationship("EscrowMilestone", back_populates="project", cascade="all, delete-orphan")


class ProjectRequest(Base):
    __tablename__ = "project_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"))
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    receiver_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    request_type: Mapped[str] = mapped_column(String(60), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    project = relationship("Project")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class ProjectTimeline(Base):
    __tablename__ = "project_timelines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    completion_status: Mapped[str] = mapped_column(String(40), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="timelines")
    images = relationship("ProjectImage", back_populates="timeline", cascade="all, delete-orphan")


class ProjectImage(Base):
    __tablename__ = "project_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    timeline_id: Mapped[int | None] = mapped_column(ForeignKey("project_timelines.id"))
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    timeline = relationship("ProjectTimeline", back_populates="images")


class Estimate(Base):
    __tablename__ = "estimates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    location: Mapped[str] = mapped_column(String(160), nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    plot_area: Mapped[float] = mapped_column(Float, nullable=False)
    floors: Mapped[int] = mapped_column(Integer, nullable=False)
    construction_type: Mapped[str] = mapped_column(String(60), nullable=False)
    building_type: Mapped[str] = mapped_column(String(60), nullable=False)
    finishing_type: Mapped[str] = mapped_column(String(60), nullable=False)
    budget: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    estimated_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    estimated_duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    material_estimate: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    labour_estimate: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MaterialLog(Base):
    __tablename__ = "material_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    material_name: Mapped[str] = mapped_column(String(80), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(40), nullable=False)
    cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class LabourLog(Base):
    __tablename__ = "labour_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    labour_count: Mapped[int] = mapped_column(Integer, nullable=False)
    labour_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    work_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SupplierProduct(Base):
    __tablename__ = "supplier_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500))
    unit: Mapped[str] = mapped_column(String(40), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    conversation_type: Mapped[str] = mapped_column(String(40), default="DIRECT")
    direct_key: Mapped[str | None] = mapped_column(String(120), unique=True, index=True)
    last_message: Mapped[str | None] = mapped_column(Text)
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    participants = relationship("ConversationParticipant", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    unread_count: Mapped[int] = mapped_column(Integer, default=0)
    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id"), index=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    receiver_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    message_type: Mapped[str] = mapped_column(String(30), default="TEXT")
    body: Mapped[str] = mapped_column(Text, nullable=False)
    attachment_url: Mapped[str | None] = mapped_column(String(500))
    read_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    reviewee_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class EscrowMilestone(Base):
    __tablename__ = "escrow_milestones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="escrow_milestones")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
