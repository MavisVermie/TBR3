CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    zip_code INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    title VARCHAR(150),
    attached_photo BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id int REFERENCES users(user_id)
    -- Foreign key????/
);