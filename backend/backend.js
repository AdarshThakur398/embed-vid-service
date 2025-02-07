const express=require('express');
const multer=require('multer');
const cors=require('cors');

const path=require('path');
const app=express();
app.use(cors());
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

const validateVideoUrl=(url) => {
    const platforms =[
        {
            name:'youtube',
            patters
        }
    ]
}
