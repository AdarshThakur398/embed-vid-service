const express=require('express');
const multer=require('multer');
const cors=require('cors');

const path=require('path');
const app=express();
app.use(cors());
app.use(express.json());
app.use('/uploads',express.static('uploads'));


const  storage=multer.diskStorage({
    destination:(req,file,cb)  => {
        cb(null,'uploads/');
    },
    filename:(req,file,cb) => {
        cb(null,`${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage:storage,
    fileFilter:(req,file,cb) => {
        const allowedTypes =['video/mp4','video/webm','video/ogg'];
        if(allowedTypes.includes(file.mimetype)){
            cb(null,true);
        } else {
            cb(new Error('Invalid File type'));
        }
    }
})
app.get('/', (req, res) => {
    res.send('Server is running!');
});


app.post('/api/upload',upload.single('video'),(req,res) => {
    if(!req.file) {
        return res.status(400).json({error:'NO file Uploaded'});

    }
    res.json({
        videoUrl:`/uploads/${req.file.filename}`
    });
})
app.post('/api/generated-embed',(req,res)=> {
    const {videoUrl,platform}=req.body;
    const embedTemplate = {
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
`
};
try {
    let embedCode;
    if (platform === 'local') {
      embedCode = embedTemplates.local(videoUrl);
    } else {
      const platformRegexes = {
        youtube: [
          /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
          /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/
        ],
        dailymotion: [/(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([^_]+)/]
      };
      const regex = platformRegexes[platform].find(r => r.test(videoUrl));
      if (!regex) throw new Error('Invalid URL');

      const videoId = videoUrl.match(regex)[1];
      embedCode = embedTemplates[platform](videoId);
    }

    res.json({ embedCode });
  } catch (error) {
    res.status(400).json({ error: 'Invalid video URL' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
    

