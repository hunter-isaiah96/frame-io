import express from 'express';
import multer from 'multer';
import cloudinaryModule from 'cloudinary';
import expressJwt from 'express-jwt';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import Content from '../models/Content';
import User from '../models/User';

const jwtMiddleWare = expressJwt({
  secret: process.env.AUTH_TOKEN_SECRET,
  credentialsRequired: false,
  algorithms: ['HS256'],
  getToken: (req) => {
    return req.cookies.auth_token || null;
  }
});

const cloudinary = cloudinaryModule.v2;
cloudinary.config({
  cloud_name: 'dwanhoixw',
  api_key: '476458331174335',
  api_secret: 'gBS5b7g-EgPX0iSlEOhKabTyh8Q'
});

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}_${req.user.email.split('@')[0]}_${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${file.mimetype.split('/')[1]}`); //Appending .jpg
  }
});
const upload = multer({ storage });

const deleteFiles = (files) => new Promise((resolve, reject) => {
  var i = files.length;
  files.forEach(function (filepath) {
    fs.unlink(filepath, function (err) {
      i--;
      if (err) {
        reject(err);
        return;
      } else if (i <= 0) {
        resolve(null);
      }
    });
  });
});

const uploadMedia = (file, user) => new Promise(async (resolve, reject) => {
  let filesToDelete = [];
  const takeScreenshots = () => new Promise((resolve, reject) => {
    ffmpeg(file.path)
      .on('filenames', function (filenames) {
        filesToDelete = filenames.map(x => `thumbs/${x}`);
      })
      .on('end', function () {
        resolve(null);
      })
      // Limit is 30 because of some fuck shit
      .screenshots({
        count: 30,
        folder: 'thumbs/',
        filename: `${file.filename.split('.')[0]}_%00i.jpg`,
        size: '240x135'
      });
  });

  const createStrip = () => new Promise((resolve, reject) => {
    ffmpeg(`thumbs/${file.filename.split('.')[0]}_%03d.jpg`)
      .on('end', function () {
        filesToDelete.push(`thumbs/${file.filename.split('.')[0]}.jpg`);
        cloudinary.uploader.upload(`thumbs/${file.filename.split('.')[0]}.jpg`, { resource_type: 'auto' }, function (err, result) {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      })
      .complexFilter([
        'tile=1x30'
      ])
      .output(`thumbs/${file.filename.split('.')[0]}.jpg`).run();
  });

  const uploadToCloudinary = () => new Promise((resolve, reject) => {
    filesToDelete.push(`uploads/${file.filename}`);
    cloudinary.uploader.upload(`uploads/${file.filename}`, { resource_type: 'auto' }, function (err, result) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });

  try {
    if (file.mimetype.split('/')[0] == 'image') {
      const media = await uploadToCloudinary();
      await deleteFiles(filesToDelete);
      return resolve({ media });
    } else if (file.mimetype.split('/')[0] == 'video') {
      await takeScreenshots();
      const previewStrip = await createStrip();
      const media = await uploadToCloudinary();
      await deleteFiles(filesToDelete);
      resolve({ previewStrip, media });
    }
  } catch (e) {
    await deleteFiles(filesToDelete);
  }
});

router.get('/', function (req, res) {
});

router.post('/', jwtMiddleWare,  async function (req, res) {
  const { id } = req.body;
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      throw new Error('Sike');
    }
    // START Content Builder Setup
    const contentBuilder = {
      created_by: req.user.id
    };
    if (req.body.id) {
      const originalContent = await Content.findOne({ where: { id } });
      if (!originalContent) {
        throw new Error('Could not find this content');
      } else if (req.file.mimetype.split('/')[0] != originalContent.dataValues.type) {
        throw new Error('Content type must be the same');
      }
      
      const versionNumber = await Content.count({ where: { original_content_id: id } });
      contentBuilder.version = versionNumber + 2;
      contentBuilder.original_content_id = id;
    }
    await uploadFile();
    const upload = await uploadMedia(req.file);
    contentBuilder.type = upload.media.resource_type;
    contentBuilder.media = upload;
    // END Content Builder Setup
    const content = Content.create(contentBuilder);
    return res.status(201).json({
      success: true,
      message: req.body.id ? 'Uploaded New Version!' : 'Created New Content!',
      data: content.dataValues
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      success: false,
      message: e,
    });
  }
});

module.exports = router;