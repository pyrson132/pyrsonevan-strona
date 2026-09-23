const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serves static files (index.html, style.css, script.js)

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
// 2. PAYMENTS / SHOP SYSTEM
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

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Serwer Pyrsonevan.pl uruchomiony na portu ${PORT}`);
  console.log(` Adres: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
