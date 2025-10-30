-- =====================================================
-- ALTER STATEMENTS - Schema modifications added later
-- =====================================================

USE MovieDB;

-- Add email and password columns to UserTable for JWT authentication
ALTER TABLE UserTable 
ADD COLUMN email VARCHAR(255) UNIQUE,
ADD COLUMN password VARCHAR(255);

-- Verify the changes
DESCRIBE UserTable;
