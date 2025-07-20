const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');
let db = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : {};

function saveDB() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db));
}

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/create', (req, res) => {
  const id = generateId();
  const { title, description, image, url } = req.body;
  db[id] = { title, description, image, url };
  saveDB();
  res.redirect(`/c/${id}`);
});

app.get('/c/:id', (req, res) => {
  const card = db[req.params.id];
  if (!card) return res.status(404).send('Card not found');
  res.send(`
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${card.title}</title>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${card.title}" />
      <meta name="twitter:description" content="${card.description}" />
      <meta name="twitter:image" content="${card.image}" />
      <meta http-equiv="refresh" content="2;url=${card.url}" />
    </head>
    <body>
      <p>Redirecting to <a href="${card.url}">${card.url}</a>...</p>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
