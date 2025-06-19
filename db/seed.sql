-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table (without categoryId)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    "authorId" UUID NOT NULL,
    "publishedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_author
        FOREIGN KEY("authorId") 
        REFERENCES users(id)
        ON DELETE RESTRICT
);

-- Create categories_to_posts pivot table
CREATE TABLE IF NOT EXISTS categories_to_posts (
    "categoryId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("categoryId", "postId"),
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE
);

-- Insert test data into users table
INSERT INTO users (email, name)
VALUES
  ('john.doe@example.com', 'John Doe'),
  ('jane.doe@example.com', 'Jane Doe');

-- Insert test data into categories table
INSERT INTO categories (name)
VALUES
  ('Technology'),
  ('Travel'),
  ('Food'),
  ('Lifestyle');

-- Insert test data into posts table
WITH user_ids AS (
  SELECT id, ROW_NUMBER() OVER () AS rn
  FROM users 
  WHERE email IN ('john.doe@example.com', 'jane.doe@example.com')
)
INSERT INTO posts (id, title, content, "authorId", "publishedAt")
SELECT
  uuid_generate_v4(),
  'Post Title ' || generate_series,
  'This is the content of post ' || generate_series || '. It''s written by ' || 
    CASE WHEN generate_series % 2 = 1 THEN 'John Doe' ELSE 'Jane Doe' END,
  (SELECT id FROM user_ids WHERE rn = (generate_series % 2) + 1),
  CURRENT_TIMESTAMP - (random() * INTERVAL '30 days')
FROM generate_series(1, 8)
RETURNING id;

-- Insert test data into categories_to_posts table
WITH post_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "publishedAt") AS rn
  FROM posts
), category_ids AS (
  SELECT id, ROW_NUMBER() OVER () AS rn
  FROM categories
)
INSERT INTO categories_to_posts ("categoryId", "postId")
SELECT 
  c.id,
  p.id
FROM post_ids p
CROSS JOIN LATERAL (
  SELECT id 
  FROM category_ids 
  WHERE rn IN ((p.rn - 1) % 4 + 1, p.rn % 4 + 1)
) c;