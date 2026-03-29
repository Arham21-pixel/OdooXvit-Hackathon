const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'app.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
function initializeDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT,
      currency_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'employee' CHECK(role IN ('admin','manager','employee')),
      manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      is_manager_approver INTEGER DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      converted_amount REAL,
      company_currency TEXT,
      category TEXT,
      description TEXT,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS approval_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      step_order INTEGER NOT NULL,
      approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      role_label TEXT
    );

    CREATE TABLE IF NOT EXISTS approval_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      rule_type TEXT NOT NULL CHECK(rule_type IN ('percentage','specific','hybrid')),
      percentage_threshold REAL,
      specific_approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS expense_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
      step_id INTEGER REFERENCES approval_steps(id) ON DELETE SET NULL,
      approver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      comment TEXT,
      actioned_at DATETIME
    );
  `);

  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id)',
    'CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON expenses(employee_id)',
    'CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status)',
    'CREATE INDEX IF NOT EXISTS idx_approval_steps_company_id ON approval_steps(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_approval_rules_company_id ON approval_rules(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense_id ON expense_approvals(expense_id)',
    'CREATE INDEX IF NOT EXISTS idx_expense_approvals_status ON expense_approvals(status)',
  ];
  indexes.forEach(idx => db.exec(idx));
}

initializeDB();

// Provide a pg-compatible query interface so all controllers work unchanged
module.exports = {
  query: (text, params) => {
    // Convert pg-style $1, $2 to SQLite ? placeholders
    let sqliteText = text;
    let paramIndex = 1;
    while (sqliteText.includes('$' + paramIndex)) {
      sqliteText = sqliteText.replace('$' + paramIndex, '?');
      paramIndex++;
    }

    // Trim the query
    sqliteText = sqliteText.trim();

    const upperText = sqliteText.toUpperCase().trimStart();

    if (upperText.startsWith('BEGIN') || upperText.startsWith('COMMIT') || upperText.startsWith('ROLLBACK')) {
      try { db.exec(sqliteText); } catch(e) { /* ignore nested transactions */ }
      return { rows: [] };
    }

    if (upperText.startsWith('SELECT') || upperText.includes('RETURNING')) {
      // For RETURNING queries, split off the RETURNING clause and handle separately
      if (upperText.includes('RETURNING') && !upperText.startsWith('SELECT')) {
        const returningMatch = sqliteText.match(/RETURNING\s+(.+)$/i);
        const mainSql = sqliteText.replace(/\s+RETURNING\s+.+$/i, '');
        
        const stmt = db.prepare(mainSql);
        const info = stmt.run(...(params || []));
        
        // Build a SELECT to get the returned row
        const table = extractTable(mainSql);
        let selectCols = returningMatch ? returningMatch[1] : '*';
        
        let row;
        if (upperText.startsWith('INSERT')) {
          row = db.prepare('SELECT ' + selectCols + ' FROM ' + table + ' WHERE id = ?').get(info.lastInsertRowid);
        } else if (upperText.startsWith('UPDATE') || upperText.startsWith('DELETE')) {
          // Re-run a select with the same WHERE clause
          const whereMatch = mainSql.match(/WHERE\s+(.+?)$/i);
          if (whereMatch) {
            row = db.prepare('SELECT ' + selectCols + ' FROM ' + table + ' WHERE ' + whereMatch[1]).get(...(params || []).slice(-countParams(whereMatch[1])));
          }
        }
        
        return { rows: row ? [row] : [], rowCount: info.changes };
      }
      
      const stmt = db.prepare(sqliteText);
      const rows = stmt.all(...(params || []));
      return { rows };
    }

    const stmt = db.prepare(sqliteText);
    const info = stmt.run(...(params || []));
    return { rows: [], rowCount: info.changes };
  },
};

function extractTable(sql) {
  // Extract table name from INSERT INTO table or UPDATE table or DELETE FROM table
  let match = sql.match(/INSERT\s+INTO\s+(\w+)/i);
  if (match) return match[1];
  match = sql.match(/UPDATE\s+(\w+)/i);
  if (match) return match[1];
  match = sql.match(/DELETE\s+FROM\s+(\w+)/i);
  if (match) return match[1];
  return '';
}

function countParams(str) {
  return (str.match(/\?/g) || []).length;
}
