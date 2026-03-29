CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255),
  currency_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'employee',
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_manager_approver BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_manager_id ON users(manager_id);

CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  converted_amount NUMERIC(15, 2),
  company_currency VARCHAR(10),
  category VARCHAR(255),
  description TEXT,
  date DATE NOT NULL,
  status expense_status DEFAULT 'pending',
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_employee_id ON expenses(employee_id);
CREATE INDEX idx_expenses_status ON expenses(status);

CREATE TABLE approval_steps (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  role_label VARCHAR(100)
);

CREATE INDEX idx_approval_steps_company_id ON approval_steps(company_id);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps(approver_id);

CREATE TYPE rule_type_enum AS ENUM ('percentage', 'specific', 'hybrid');

CREATE TABLE approval_rules (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  rule_type rule_type_enum NOT NULL,
  percentage_threshold NUMERIC(5, 2),
  specific_approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_approval_rules_company_id ON approval_rules(company_id);
CREATE INDEX idx_approval_rules_approver_id ON approval_rules(specific_approver_id);

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE expense_approvals (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
  step_id INTEGER REFERENCES approval_steps(id) ON DELETE SET NULL,
  approver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status approval_status DEFAULT 'pending',
  comment TEXT,
  actioned_at TIMESTAMP
);

CREATE INDEX idx_expense_approvals_expense_id ON expense_approvals(expense_id);
CREATE INDEX idx_expense_approvals_approver_id ON expense_approvals(approver_id);
CREATE INDEX idx_expense_approvals_status ON expense_approvals(status);
