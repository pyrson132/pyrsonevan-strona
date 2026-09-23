const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'pyrsonevan_secret_key_change_in_production';

// In-memory user database (Replace with SQLite/MySQL/MongoDB for production)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serves static files (index.html, style.css, script.js)

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Brak tokena autoryzacji' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Nieprawidłowy lub wygasły token' });
    req.user = user;
    next();
  });
}

// ==========================================
// 1. MINECRAFT SERVER STATUS API
// ==========================================
app.get('/api/status', (req, res) => {
  const serverIp = 'pyrsonevan.pl';
  
  // Fetch real status using mcsrvstat.us API
  https.get(`https://api.mcsrvstat.us/2/${serverIp}`, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        res.json({
          online: json.online,
          players: json.players ? json.players.online : 0,
          maxPlayers: json.players ? json.players.max : 0,
          version: json.version || '1.20.x'
        });
      } catch (e) {
        res.json({ online: false, players: 0, maxPlayers: 0, version: 'Nieznana' });
      }
    });
  }).on('error', () => {
    res.json({ online: false, players: 0, maxPlayers: 0, version: 'Nieznana' });
  });
});

// ==========================================
// 2. AUTHENTICATION ROUTES (REGISTER & LOGIN)
// ==========================================
// Endpoint Rejestracji
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Wypełnij wszystkie pola!' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.json({ success: true, message: 'Konto utworzone pomyślnie!', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Błąd podczas rejestracji (możliwe, że e-mail już istnieje).' });
  }
});

// Endpoint Logowania
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Wypełnij wszystkie pola!' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy e-mail lub hasło.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy e-mail lub hasło.' });
    }

    res.json({ success: true, message: 'Zalogowano pomyślnie!', token: 'fake-jwt-token', user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Błąd serwera podczas logowania.' });
  }
});

// ==========================================
// 3. USER PROFILE (PROTECTED ROUTE)
// ==========================================
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });

  res.json({
    success: true,
    user: {
      email: user.email,
      rank: user.rank,
      createdAt: user.createdAt
    }
  });
});

// ==========================================
// 4. PAYMENTS / SHOP SYSTEM
// ==========================================
app.post('/api/shop/checkout', (req, res) => {
  const { rank } = req.body;

  const validRanks = {
    'VIP': 19.99,
    'SVIP': 34.99,
    'GVIP': 49.99,
    'PYRA': 79.99
  };

  if (!validRanks[rank]) {
    return res.status(400).json({ success: false, message: 'Nieprawidłowa ranga!' });
  }

  // Demo payment integration (Simulation of payment provider link generation)
  const price = validRanks[rank];
  
  res.json({
    success: true,
    message: `Generowanie płatności dla rangi ${rank} (${price} zł)...`,
    paymentUrl: `https://example-payment-gateway.com/pay?item=${rank}&price=${price}`
  });
});

// ==========================================
// 5. OAUTH PLACEHOLDERS (DISCORD & GOOGLE)
// ==========================================
app.get('/api/auth/discord', (req, res) => {
  res.redirect('https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code');
});

app.get('/api/auth/google', (req, res) => {
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&response_type=code');
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Serwer Pyrsonevan.pl uruchomiony na portu ${PORT}`);
  console.log(` Adres: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
