import express from 'express';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 8080;
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Multer config
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// MongoDB with auth
const mongoUri = 'mongodb://mongo-service:27017';
const dbName = 'local_lens';
const collectionName = 'insight_logs';

let dbClient;
MongoClient.connect(mongoUri)
  .then(client => {
    dbClient = client;
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error(' MongoDB connection failed:', err.message));

// Upload endpoint
app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filename = req.file.originalname.toLowerCase();
    let insight;

    if (filename.includes('monument')) {
      insight = 'This appears to be a monument of historical significance.';
    } else if (filename.includes('flower')) {
      insight = 'This might be a native flower species.';
    } else if (filename.includes('menu')) {
      insight = 'This looks like a food menu.';
    } else if (filename.includes('sign')) {
      insight = 'This might be a street or informational sign.';
    } else {
      insight = 'Possibly a local landmark or item of interest.';
    }

    const db = dbClient.db(dbName);
    await db.collection(collectionName).insertOne({
      filename: req.file.filename,
      analysis: insight,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Analysis complete',
      insight,
      fileStoredAs: req.file.filename
    });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Visual history view
app.get('/history-view', async (_, res) => {
  try {
    const db = dbClient.db(dbName);
    const entries = await db.collection(collectionName).find().sort({ timestamp: -1 }).toArray();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LocalLens — Upload History</title>
          <style>
            body { font-family: sans-serif; padding: 20px; background: #fff; }
            h2 { margin-bottom: 20px; }
            .entry { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 15px; }
            .entry img { max-width: 300px; margin-top: 10px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>LocalLens — Upload History</h2>
          ${entries.map(e => `
            <div class="entry">
              <div><span class="label">Filename:</span> ${e.filename}</div>
              <div><span class="label">Insight:</span> ${e.analysis}</div>
              <img src="/uploads/${e.filename}" alt="Uploaded Image">
            </div>
          `).join('')}
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error('Error loading history:', err.message);
    res.status(500).send('Could not load history');
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
