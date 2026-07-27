const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'users_db.json');

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file, initializing fresh:', err.message);
  }
  return { users: [] };
}

function saveDb(dbData) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database file:', err.message);
  }
}

function initDb() {
  const db = loadDb();
  let changed = false;

  // Pre-seed default Admin Account if not present
  const adminEmail = 'admin@satyalens.gov.np';
  let adminUser = db.users.find(u => u.email.toLowerCase() === adminEmail);
  if (!adminUser) {
    db.users.push({
      id: 'usr_admin_01',
      name: 'SatyaLens Admin',
      email: adminEmail,
      passwordHash: bcrypt.hashSync('SatyaAdmin@2026', 10),
      role: 'admin',
      is_verified: 1,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    });
    changed = true;
  }

  // Pre-seed default Verified User Account if not present
  const userEmail = 'satya@example.com';
  let normalUser = db.users.find(u => u.email.toLowerCase() === userEmail);
  if (!normalUser) {
    db.users.push({
      id: 'usr_sample_01',
      name: 'Satya Verified User',
      email: userEmail,
      passwordHash: bcrypt.hashSync('Satya@123', 10),
      role: 'user',
      is_verified: 1,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    });
    changed = true;
  }

  if (changed) {
    saveDb(db);
    console.log('Database initialized & pre-seeded default accounts (Admin: admin@satyalens.gov.np / SatyaAdmin@2026, User: satya@example.com / Satya@123)');
  }
}

function findUserByEmail(email) {
  if (!email) return null;
  const db = loadDb();
  const cleanEmail = String(email).trim().toLowerCase();
  return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

function createUser({ name, email, password, role = 'user', is_verified = 1 }) {
  const db = loadDb();
  const cleanEmail = String(email).trim().toLowerCase();

  if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: String(name || cleanEmail.split('@')[0]).trim(),
    email: cleanEmail,
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: role === 'admin' ? 'admin' : 'user',
    is_verified: is_verified !== undefined && is_verified !== null ? (is_verified ? 1 : 0) : 1,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);
  return sanitizeUser(newUser);
}

function verifyUser(email) {
  const db = loadDb();
  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) throw new Error('User not found.');

  user.is_verified = 1;
  saveDb(db);
  return sanitizeUser(user);
}

function revokeUser(email) {
  const db = loadDb();
  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) throw new Error('User not found.');

  user.is_verified = 0;
  saveDb(db);
  return sanitizeUser(user);
}

function deleteUser(email) {
  const db = loadDb();
  const cleanEmail = String(email).trim().toLowerCase();
  const initialCount = db.users.length;
  db.users = db.users.filter(u => u.email.toLowerCase() !== cleanEmail);
  if (db.users.length === initialCount) throw new Error('User not found.');

  saveDb(db);
  return { success: true };
}

function updateLastLogin(email) {
  const db = loadDb();
  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.last_login = new Date().toISOString();
    saveDb(db);
  }
}

function getAllUsers() {
  const db = loadDb();
  return db.users.map(sanitizeUser);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

// Initialize on module require
initDb();

module.exports = {
  initDb,
  findUserByEmail,
  createUser,
  verifyUser,
  revokeUser,
  deleteUser,
  updateLastLogin,
  getAllUsers,
  sanitizeUser
};
