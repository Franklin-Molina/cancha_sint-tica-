-- Script SQL generado a partir de los modelos de Django

-- Tabla: users_user
-- Modelo: User (backend/users/models.py)
CREATE TABLE users_user (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_superuser BOOLEAN NOT NULL,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    is_staff BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL,
    edad INTEGER,
    -- Campos para ManyToManyField con Group y Permission se manejan con tablas intermedias por defecto en Django
    -- users_user_groups y users_user_user_permissions
);

-- Tabla intermedia para users_user.groups
CREATE TABLE users_user_groups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
    UNIQUE (user_id, group_id)
);

-- Tabla intermedia para users_user.user_permissions
CREATE TABLE users_user_user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE (user_id, permission_id)
);

-- Tabla: users_perfilsocial
-- Modelo: PerfilSocial (backend/users/models.py)
CREATE TABLE users_perfilsocial (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(255) NOT NULL,
    uid VARCHAR(255) NOT NULL,
    extra_data JSONB,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users_user(id) ON DELETE CASCADE
);

-- Tabla: courts_court
-- Modelo: Court (backend/courts/models.py)
CREATE TABLE courts_court (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    characteristics TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Tabla: courts_courtimage
-- Modelo: CourtImage (backend/courts/models.py)
CREATE TABLE courts_courtimage (
    id SERIAL PRIMARY KEY,
    image VARCHAR(100) NOT NULL, -- Django almacena la ruta del archivo
    court_id INTEGER NOT NULL REFERENCES courts_court(id) ON DELETE CASCADE
);

-- Tabla: plans_plan
-- Modelo: Plan (backend/plans/models.py)
CREATE TABLE plans_plan (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    auto_renew BOOLEAN NOT NULL,
    benefits TEXT NOT NULL
);

-- Tabla: users_suscripcionplan
-- Modelo: SuscripcionPlan (backend/users/models.py)
CREATE TABLE users_suscripcionplan (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    auto_renew BOOLEAN NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans_plan(id) ON DELETE CASCADE
);

-- Tabla: bookings_booking
-- Modelo: Booking (backend/bookings/models.py)
CREATE TABLE bookings_booking (
    id SERIAL PRIMARY KEY,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    court_id INTEGER NOT NULL REFERENCES courts_court(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments_payment(id) ON DELETE SET NULL -- Puede ser NULL
);

-- Tabla: payments_payment
-- Modelo: Payment (backend/payments/models.py)
CREATE TABLE payments_payment (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255), -- Puede ser NULL
    gateway_data JSONB, -- Puede ser NULL
    user_id INTEGER NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    booking_id INTEGER NOT NULL REFERENCES bookings_booking(id) ON DELETE CASCADE
);

-- Índices y restricciones adicionales (opcional, Django los crea automáticamente)
-- Ejemplo de índice para campos ForeignKey
-- CREATE INDEX bookings_booking_user_id_idx ON bookings_booking (user_id);
-- CREATE INDEX bookings_booking_court_id_idx ON bookings_booking (court_id);
-- CREATE INDEX bookings_booking_payment_id_idx ON bookings_booking (payment_id);
-- CREATE INDEX courts_courtimage_court_id_idx ON courts_courtimage (court_id);
-- CREATE INDEX payments_payment_user_id_idx ON payments_payment (user_id);
-- CREATE INDEX payments_payment_booking_id_idx ON payments_payment (booking_id);
-- CREATE INDEX users_perfilsocial_user_id_idx ON users_perfilsocial (user_id);
-- CREATE INDEX users_suscripcionplan_user_id_idx ON users_suscripcionplan (user_id);
-- CREATE INDEX users_suscripcionplan_plan_id_idx ON users_suscripcionplan (plan_id);
