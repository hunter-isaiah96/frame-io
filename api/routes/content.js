import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { User, Content } from '../db';
import jwtMiddleWare from '../libraries/authCheck'
import cloudinary from '../libraries/cloudinary'

const screenShotCount = 40;

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}_${req.user.email.split('@')[0]}_${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: (1024 * 1024) * 100 // 100mb File Size
    },
    fileFilter: async (req, file, cb) => {
        try {
            const user = await User.findOne({ where: { id: req.user.id } });
            if (!user) {
                req.fileValidationError = 'User does not exist';
                return cb(null, false, req.fileValidationError);
            }
            if (req.body.id) {
                const originalContent = await Content.findOne({ where: { id: req.body.id } });
                if (originalContent) {
                    if (file.mimetype.split('/')[0] != originalContent.dataValues.type) {
                        req.fileValidationError = 'Content type must be the same';
                        return cb(null, false, req.fileValidationError);
                    } else {
                        return cb(null, true);
                    }
                } else {
                    req.fileValidationError = 'Content not found';
                    return cb(null, false, req.fileValidationError, false);
                }
            } else {
                return cb(null, true);
            }

        } catch (e) {
            return cb(null, false, e.message, false);
        }
    }
});

const deleteFiles = (files) => Promise.all(files.map(file => new Promise((resolve, reject) => {
    try {
        fs.unlink(file, err => {
            if (err) return console.log(err);
            resolve()
        });
    } catch (e) {
        reject(e)
    }
})))

const uploadMedia = (file) => new Promise(async (resolve, reject) => {

    const filesToDelete = [
        `thumbs/${file.filename.split('.')[0]}.jpg`,
        `uploads/${file.filename}`
    ];

    const uploadToCloudinary = (file) => new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file, { resource_type: 'auto' }, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });

    const takeScreenshots = () => new Promise((resolve, reject) => {
        ffmpeg(file.path)
            .screenshots({
                count: screenShotCount,
                folder: 'thumbs/',
                filename: `${file.filename.split('.')[0]}_%00i.jpg`,
                size: '240x135'
            })
            .on('filenames', (filenames) => {
                filesToDelete.push(...filenames.map(x => `thumbs/${x}`))
            })
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                resolve();
            })
    });

    const createStrip = () => new Promise((resolve, reject) => {
        ffmpeg(`thumbs/${file.filename.split('.')[0]}_%03d.jpg`)
            .complexFilter([
                `tile=1x${screenShotCount}`
            ]).on('end', () => {
                resolve()
            })
            .on('err', (err) => {
                reject(err)
            })
            .output(`thumbs/${file.filename.split('.')[0]}.jpg`).run();
    });

    try {
        if (file.mimetype.split('/')[0] == 'image') {
            // throw new Error(`It's okay`)
            // const media = await uploadToCloudinary(`uploads/${file.filename}`);
            // resolve({ media });
            resolve({ media: { resource_type: 'image' }})
        } else if (file.mimetype.split('/')[0] == 'video') {
            await takeScreenshots();
            await createStrip();
            const previewStrip = await uploadToCloudinary(`thumbs/${file.filename.split('.')[0]}.jpg`)
            const media = await uploadToCloudinary(`uploads/${file.filename}`);
            resolve({ previewStrip, media });
        } else {
            reject(new Error('Please upload an Image or Video'))
        }
    } catch (e) {
        reject(e);
    } finally {
        console.log()
        await deleteFiles(filesToDelete)
    }
});

router.delete('/all', async (req, res) => {

});

router.get('/', jwtMiddleWare, async (req, res) => {
    try {
        const allContent = await Content.findAll({
            where: {
                userId: req.user.id,
                contentId: null
            },
            include: [{
                model: Content,
                as: 'versions'
            }]
        })
        res.status(200).json({
            success: true,
            data: allContent
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/new', jwtMiddleWare, upload.single('content'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            throw new Error(req.fileValidationError)
        }
        // START Content Builder Setup
        const contentBuilder = {
            userId: req.user.id
        };
        if (req.body.id) {
            const originalContent = await Content.count({ where: { id: req.body.id, userId: req.user.id } })
            if (!originalContent) {
                throw new Error('Content not found')
            }
            const versionNumber = await Content.count({ where: { contentId: req.body.id, userId: req.user.id } })
            contentBuilder.version = versionNumber + 2;
            contentBuilder.contentId = req.body.id;
        }
        const upload = await uploadMedia(req.file);
        contentBuilder.type = upload.media.resource_type || 'image';
        contentBuilder.media = upload.media;
        // END Content Builder Setup
        const content = await Content.create(contentBuilder);
        res.status(201).json({
            success: true,
            message: req.body.id ? 'Uploaded New Version!' : 'Created New Content!',
            data: {
                id: content.dataValues.id
            }
        });
    } catch (e) {
        console.log(e)
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
});

module.exports = router;