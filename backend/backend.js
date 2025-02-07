const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid File type'));
    }
  },
});
app.post('/api/upload', upload.single('video'), (req, res) => {
  console.log('Upload request received');
  console.log('Uploaded file:', req.file);

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({ videoUrl: `/uploads/${req.file.filename}` });
});

app.post('/api/generate-embed', (req, res) => {
  console.log('Received data:', req.body);
  const { videoUrl, platform } = req.body;

  if (!videoUrl || !platform) {
    return res.status(400).json({ error: 'Missing videoUrl or platform' });
  }

  const embedTemplates = {
    youtube: (id) => `
      <iframe 
        width="560" 
        height="315" 
        src="https://www.youtube.com/embed/${id}" 
        frameborder="0" 
        allowfullscreen>
      </iframe>
    `,
    dailymotion: (id) => `
      <iframe 
        width="560" 
        height="315" 
        src="https://www.dailymotion.com/embed/video/${id}" 
        frameborder="0" 
        allowfullscreen>
      </iframe>
    `,
    local: (url) => `
      <video width="560" height="315" controls>
        <source src="${url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `,
  };

  try {
    let embedCode = '';

    if (platform === 'local') {
      embedCode = embedTemplates.local(videoUrl);
    } else {
      const platformRegexes = {
        youtube: [/youtube\.com\/.*v=([^&]+)/, /youtu\.be\/([^?]+)/],
        dailymotion: [/dailymotion\.com\/video\/([^_]+)/],
      };

      const regex = platformRegexes[platform].find((r) => videoUrl.match(r));
      if (!regex) {
        return res.status(400).json({ error: 'Invalid video URL' });
      }

      const videoId = videoUrl.match(regex)[1];
      embedCode = embedTemplates[platform](videoId);
    }

    res.json({ embedCode });
  } catch (error) {
    res.status(400).json({ error: 'Error generating embed code' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
