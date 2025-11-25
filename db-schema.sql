-- ============================================================
--   University Resource Booking System - PostgreSQL Schema
-- ============================================================

CREATE TABLE tbl_user (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_resources (
    resource_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    capacity INT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_resource_availability (
    availability_id SERIAL PRIMARY KEY,
    resource_id INT NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    FOREIGN KEY (resource_id) REFERENCES tbl_resources(resource_id) ON DELETE CASCADE
);

CREATE TABLE tbl_resource_blackout (
    blackout_id SERIAL PRIMARY KEY,
    resource_id INT NOT NULL,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    reason VARCHAR(255),

    FOREIGN KEY (resource_id) REFERENCES tbl_resources(resource_id) ON DELETE CASCADE
);

CREATE TABLE tbl_bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    purpose VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES tbl_user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES tbl_resources(resource_id) ON DELETE CASCADE
);