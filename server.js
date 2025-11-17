const http = require('http');
const fs = require('fs');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

// MSSQL Bağlantı Ayarları
const config = {
  server: 'localhost\\MSSQLSERVER_2022',
  database: 'frekans',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    trustedConnection: true
  },
  driver: 'msnodesqlv8'
};

// Veritabanı bağlantısını başlat
let pool;

async function connectDB() {
  try {
    pool = await sql.connect(config);
    console.log('✅ MSSQL veritabanına bağlandı: frekans');
    return pool;
  } catch (err) {
    console.error('❌ Veritabanı bağlantı hatası:', err);
    throw err;
  }
}

// Sunucu başlatıldığında veritabanını bağla
connectDB();

const server = http.createServer(async (req, res) => {
  // API endpoint'leri
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    // Kullanıcıları getir
    if (req.url === '/api/users' && req.method === 'GET') {
      try {
        const result = await pool.request().query('SELECT * FROM Kullanicilar');
        res.writeHead(200);
        res.end(JSON.stringify(result.recordset));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
    
    // Şarkıları getir
    if (req.url === '/api/songs' && req.method === 'GET') {
      try {
        const result = await pool.request().query('SELECT * FROM Sarkilar');
        res.writeHead(200);
        res.end(JSON.stringify(result.recordset));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
    
    // Playlist'leri getir
    if (req.url === '/api/playlists' && req.method === 'GET') {
      try {
        const result = await pool.request().query('SELECT * FROM CalmaListeleri');
        res.writeHead(200);
        res.end(JSON.stringify(result.recordset));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
  }

  // Static dosyalar için
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.mp3': 'audio/mpeg'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        fs.readFile('./404.html', (error, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});