import { pool } from "@workspace/db";
import { logger } from "./lib/logger";

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS employees (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  department  TEXT NOT NULL,
  role        TEXT NOT NULL,
  phone       TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  brand            TEXT,
  model            TEXT,
  serial_number    TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'available',
  condition        TEXT,
  location         TEXT,
  purchase_date    TEXT NOT NULL,
  warranty_expiry  TEXT,
  purchase_price   NUMERIC(10,2),
  assigned_to_id   INTEGER,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'open',
  priority         TEXT NOT NULL DEFAULT 'medium',
  category         TEXT NOT NULL,
  assigned_to_id   INTEGER,
  requester_id     INTEGER,
  related_asset_id INTEGER,
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

const SEED_EMPLOYEES_SQL = `
INSERT INTO employees (name, email, department, role, phone, status) VALUES
  ('Alice Johnson',   'alice@techopsdemo.com',   'Engineering',       'Senior Developer',    '+1-555-0101', 'active'),
  ('Bob Martinez',    'bob@techopsdemo.com',      'IT Support',        'Helpdesk Technician', '+1-555-0102', 'active'),
  ('Carol White',     'carol@techopsdemo.com',    'HR',                'HR Manager',          '+1-555-0103', 'active'),
  ('David Chen',      'david@techopsdemo.com',    'Engineering',       'DevOps Engineer',     '+1-555-0104', 'active'),
  ('Emma Davis',      'emma@techopsdemo.com',     'Marketing',         'Marketing Lead',      '+1-555-0105', 'active'),
  ('Frank Wilson',    'frank@techopsdemo.com',    'Finance',           'Financial Analyst',   '+1-555-0106', 'active'),
  ('Grace Lee',       'grace@techopsdemo.com',    'Engineering',       'QA Engineer',         '+1-555-0107', 'active'),
  ('Henry Brown',     'henry@techopsdemo.com',    'IT Support',        'System Administrator','+1-555-0108', 'active')
ON CONFLICT (email) DO NOTHING;
`;

const SEED_ASSETS_SQL = `
INSERT INTO assets (name, category, brand, model, serial_number, status, condition, location, purchase_date, warranty_expiry, purchase_price, assigned_to_id) VALUES
  ('MacBook Pro 14"',        'Laptop',   'Apple',  'MBP14-2023', 'SN-AP-001', 'in_use',    'good',      'New York HQ',    '2023-01-15', '2026-01-15', 2499.00, 1),
  ('Dell XPS 15',            'Laptop',   'Dell',   'XPS15-9520', 'SN-DL-001', 'in_use',    'good',      'Austin Office',  '2023-03-20', '2026-03-20', 1799.00, 4),
  ('iPhone 14 Pro',          'Mobile',   'Apple',  'IP14P',      'SN-AP-002', 'in_use',    'excellent', 'New York HQ',    '2023-02-10', '2025-02-10',  999.00, 1),
  ('Logitech MX Keys',       'Keyboard', 'Logi',   'MX-KEYS',    'SN-LG-001', 'available', 'good',      'IT Storage',     '2022-11-01', '2025-11-01',  109.00, NULL),
  ('Dell 27" 4K Monitor',    'Monitor',  'Dell',   'U2723DE',    'SN-DL-002', 'in_use',    'excellent', 'Austin Office',  '2023-04-05', '2026-04-05',  579.00, 4),
  ('MacBook Air M2',         'Laptop',   'Apple',  'MBA-M2-2022','SN-AP-003', 'in_use',    'excellent', 'New York HQ',    '2022-09-15', '2025-09-15', 1299.00, 7),
  ('HP LaserJet Pro',        'Printer',  'HP',     'MFP-M428',   'SN-HP-001', 'available', 'good',      'IT Storage',     '2021-06-20', '2024-06-20',  449.00, NULL),
  ('Cisco IP Phone 8861',    'Phone',    'Cisco',  '8861',       'SN-CS-001', 'in_use',    'good',      'New York HQ',    '2022-01-10', '2025-01-10',  299.00, 3),
  ('Samsung Galaxy S23',     'Mobile',   'Samsung','SM-S911B',   'SN-SM-001', 'in_use',    'good',      'Austin Office',  '2023-05-01', '2025-05-01',  799.00, 5),
  ('Lenovo ThinkPad X1',     'Laptop',   'Lenovo', 'X1-CARBON',  'SN-LN-001', 'available', 'fair',      'IT Storage',     '2021-08-15', '2024-08-15', 1549.00, NULL),
  ('Apple Magic Mouse',      'Mouse',    'Apple',  'MK2E3LL',    'SN-AP-004', 'in_use',    'good',      'New York HQ',    '2023-01-15', '2026-01-15',   79.00, 1),
  ('Jabra Evolve2 85',       'Headset',  'Jabra',  'EV2-85',     'SN-JB-001', 'in_use',    'excellent', 'Austin Office',  '2023-06-01', '2026-06-01',  379.00, 4)
ON CONFLICT (serial_number) DO NOTHING;
`;

const SEED_TICKETS_SQL = `
INSERT INTO tickets (title, description, status, priority, category, assigned_to_id, requester_id) VALUES
  ('Laptop screen flickering',       'MacBook screen flickers at 60Hz refresh rate', 'open',        'high',   'Hardware', 2, 1),
  ('VPN connection drops',           'VPN disconnects every 30 minutes',             'in_progress', 'high',   'Network',  4, 5),
  ('Email sync issue',               'Outlook not syncing with Exchange server',      'open',        'medium', 'Software', 2, 3),
  ('Printer offline in Austin',      'HP printer shows offline despite being on',    'resolved',    'medium', 'Hardware', 2, 5),
  ('New software license request',   'Need Adobe Creative Cloud for design work',    'open',        'low',    'Software', 4, 7),
  ('Slow internet in meeting rooms', 'WiFi speed drops during video calls',          'in_progress', 'high',   'Network',  4, 6),
  ('Password reset needed',          'Account locked after too many failed attempts','resolved',    'urgent', 'Access',   2, 8),
  ('Monitor not detected',           'Second monitor not recognised after docking',  'open',        'medium', 'Hardware', 2, 4),
  ('Backup drive full',              'Automated backup failed: NAS 95% full',        'open',        'high',   'Storage',  4, 4),
  ('Teams audio feedback',           'Echo and feedback on Microsoft Teams calls',   'resolved',    'medium', 'Software', 2, 3)
ON CONFLICT DO NOTHING;
`;

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    logger.info("Running startup migrations…");
    await client.query(CREATE_TABLES_SQL);
    logger.info("Tables ready ✓");

    // Seed only if tables are empty
    const { rows } = await client.query("SELECT count(*)::int AS n FROM employees");
    if (rows[0].n === 0) {
      logger.info("Seeding demo data…");
      await client.query(SEED_EMPLOYEES_SQL);
      await client.query(SEED_ASSETS_SQL);
      await client.query(SEED_TICKETS_SQL);
      logger.info("Demo data seeded ✓");
    } else {
      logger.info(`Skipping seed — ${rows[0].n} employees already present`);
    }
  } finally {
    client.release();
  }
}
