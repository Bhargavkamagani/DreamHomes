CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL DEFAULT '',
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('OWNER', 'CONTRACTOR', 'SUPPLIER')),
    address TEXT NOT NULL DEFAULT '',
    pincode VARCHAR(20) NOT NULL DEFAULT '',
    rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users (role);
CREATE INDEX IF NOT EXISTS ix_users_pincode ON users (pincode);
CREATE INDEX IF NOT EXISTS ix_users_created_at ON users (created_at);

CREATE TABLE IF NOT EXISTS owner_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    building_type VARCHAR(60) NOT NULL DEFAULT 'RESIDENTIAL',
    construction_type VARCHAR(60) NOT NULL DEFAULT 'CONTRACTOR',
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    land_area DOUBLE PRECISION NOT NULL DEFAULT 0,
    floors INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS contractor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(160) NOT NULL,
    license_number VARCHAR(100),
    experience_years INTEGER NOT NULL DEFAULT 0,
    completed_projects INTEGER NOT NULL DEFAULT 0,
    gallery TEXT
);

CREATE TABLE IF NOT EXISTS supplier_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(160) NOT NULL,
    categories TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contractor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    building_type VARCHAR(60) NOT NULL DEFAULT 'RESIDENTIAL',
    construction_type VARCHAR(60) NOT NULL DEFAULT 'CONTRACTOR',
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    land_area DOUBLE PRECISION NOT NULL DEFAULT 0,
    floors INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(40) NOT NULL DEFAULT 'active',
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_projects_owner_id ON projects (owner_id);
CREATE INDEX IF NOT EXISTS ix_projects_contractor_id ON projects (contractor_id);
CREATE INDEX IF NOT EXISTS ix_projects_pincode ON projects (pincode);
CREATE INDEX IF NOT EXISTS ix_projects_created_at ON projects (created_at);
CREATE INDEX IF NOT EXISTS ix_projects_find_clients ON projects (pincode, created_at DESC) WHERE contractor_id IS NULL;

CREATE TABLE IF NOT EXISTS project_requests (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_project_requests_project_id ON project_requests (project_id);
CREATE INDEX IF NOT EXISTS ix_project_requests_sender_id ON project_requests (sender_id);
CREATE INDEX IF NOT EXISTS ix_project_requests_receiver_id ON project_requests (receiver_id);
CREATE INDEX IF NOT EXISTS ix_project_requests_created_at ON project_requests (created_at);

CREATE TABLE IF NOT EXISTS project_timelines (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    completion_status VARCHAR(40) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_project_timelines_project_id ON project_timelines (project_id);
CREATE INDEX IF NOT EXISTS ix_project_timelines_date ON project_timelines (project_id, date);

CREATE TABLE IF NOT EXISTS project_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    timeline_id INTEGER REFERENCES project_timelines(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_project_images_project_id ON project_images (project_id);
CREATE INDEX IF NOT EXISTS ix_project_images_timeline_id ON project_images (timeline_id);

CREATE TABLE IF NOT EXISTS estimates (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(160) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    plot_area DOUBLE PRECISION NOT NULL,
    floors INTEGER NOT NULL,
    construction_type VARCHAR(60) NOT NULL,
    building_type VARCHAR(60) NOT NULL,
    finishing_type VARCHAR(60) NOT NULL,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    estimated_cost NUMERIC(12, 2) NOT NULL,
    estimated_duration_days INTEGER NOT NULL,
    material_estimate NUMERIC(12, 2) NOT NULL,
    labour_estimate NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_estimates_owner_id ON estimates (owner_id);
CREATE INDEX IF NOT EXISTS ix_estimates_pincode ON estimates (pincode);
CREATE INDEX IF NOT EXISTS ix_estimates_created_at ON estimates (created_at);

CREATE TABLE IF NOT EXISTS material_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    material_name VARCHAR(80) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    unit VARCHAR(40) NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_material_logs_project_id ON material_logs (project_id);
CREATE INDEX IF NOT EXISTS ix_material_logs_material_name ON material_logs (material_name);

CREATE TABLE IF NOT EXISTS labour_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    labour_count INTEGER NOT NULL,
    labour_cost NUMERIC(12, 2) NOT NULL,
    work_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_labour_logs_project_id ON labour_logs (project_id);
CREATE INDEX IF NOT EXISTS ix_labour_logs_work_date ON labour_logs (project_id, work_date);

CREATE TABLE IF NOT EXISTS supplier_products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(80) NOT NULL,
    image_url VARCHAR(500),
    unit VARCHAR(40) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_supplier_products_supplier_id ON supplier_products (supplier_id);
CREATE INDEX IF NOT EXISTS ix_supplier_products_category ON supplier_products (category);
CREATE INDEX IF NOT EXISTS ix_supplier_products_created_at ON supplier_products (created_at);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unread_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_conversation_participants_conversation_id ON conversation_participants (conversation_id);
CREATE INDEX IF NOT EXISTS ix_conversation_participants_user_id ON conversation_participants (user_id);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    attachment_url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_messages_conversation_id ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS ix_messages_sender_id ON messages (sender_id);
CREATE INDEX IF NOT EXISTS ix_messages_created_at ON messages (created_at);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_reviews_project_id ON reviews (project_id);
CREATE INDEX IF NOT EXISTS ix_reviews_reviewer_id ON reviews (reviewer_id);
CREATE INDEX IF NOT EXISTS ix_reviews_reviewee_id ON reviews (reviewee_id);

CREATE TABLE IF NOT EXISTS escrow_milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_escrow_milestones_project_id ON escrow_milestones (project_id);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS ix_notifications_created_at ON notifications (created_at);
CREATE INDEX IF NOT EXISTS ix_notifications_unread ON notifications (user_id, is_read) WHERE is_read = FALSE;
