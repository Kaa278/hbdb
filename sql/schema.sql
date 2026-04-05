CREATE DATABASE IF NOT EXISTS happykuliner;
USE happykuliner;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert a default admin for testing purposes
INSERT IGNORE INTO users (name, email, password, role) 
VALUES ('Super Admin', 'admin@example.com', '$2b$10$X7h6Uv./xS/b5N9h0yP8T.6A.Z6fW3Wd3CZhL8K1Pj8X6r8r0s.8y', 'admin');
-- Note: the password hash is for 'admin123' generated with bcrypt
