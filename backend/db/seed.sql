-- Insert 1 company
INSERT INTO companies (name, country, currency_code)
VALUES ('Demo Corp', 'United States', 'USD');

-- Insert 1 admin
INSERT INTO users (company_id, name, email, password_hash, role)
VALUES (
  1, 
  'Admin Boss', 
  'admin@democorp.com', 
  -- hashed password for 'password123'
  '$2a$10$wN20g3K/9XGzV6F.d60vYenL6141vL5Q0G/16gA935d21x9bM/NWe', 
  'admin'
);

-- Insert 1 manager
INSERT INTO users (company_id, name, email, password_hash, role, is_manager_approver)
VALUES (
  1, 
  'Manager Mike', 
  'manager@democorp.com', 
  '$2a$10$wN20g3K/9XGzV6F.d60vYenL6141vL5Q0G/16gA935d21x9bM/NWe', 
  'manager',
  true
);

-- Insert 2 employees reporting to manager 2
INSERT INTO users (company_id, name, email, password_hash, role, manager_id)
VALUES (
  1, 
  'Employee One', 
  'emp1@democorp.com', 
  '$2a$10$wN20g3K/9XGzV6F.d60vYenL6141vL5Q0G/16gA935d21x9bM/NWe', 
  'employee', 
  2
);

INSERT INTO users (company_id, name, email, password_hash, role, manager_id)
VALUES (
  1, 
  'Employee Two', 
  'emp2@democorp.com', 
  '$2a$10$wN20g3K/9XGzV6F.d60vYenL6141vL5Q0G/16gA935d21x9bM/NWe', 
  'employee', 
  2
);
