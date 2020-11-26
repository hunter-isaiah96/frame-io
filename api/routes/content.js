import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import db from '../db';
import jwtMiddleWare from '../libraries/authCheck'
import cloudinary from '../libraries/cloudinary'

const Content = db.Content;
const User = db.User;

const screenShotCount = 40;

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}_${req.user.email.split('@')[0]}_${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${file.mimetype.split('/')[1]}`); //Appending .jpg
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: (1024 * 1024) * 100 // 100mb File Size
    },
    fileFilter: async function (req, file, cb) {
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
            console.log(e);
        }
    }
});

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

const uploadMedia = (file) => new Promise(async (resolve, reject) => {
    let filesToDelete = [
        `uploads/${file.filename}`
    ];
    const takeScreenshots = () => new Promise((resolve, reject) => {
        ffmpeg(file.path)
            .on('filenames', function (filenames) {
                filesToDelete = filenames.map(x => `thumbs/${x}`);
            })
            .on('end', function () {

                resolve(null);
            })
            .on('error', function (err) {
                reject(err);
            })
            .screenshots({
                count: screenShotCount,
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
                `tile=1x${screenShotCount}`
            ])
            .output(`thumbs/${file.filename.split('.')[0]}.jpg`).run();
    });

    const uploadToCloudinary = () => new Promise((resolve, reject) => {
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
            return resolve({ media });
        } else if (file.mimetype.split('/')[0] == 'video') {
            await takeScreenshots();
            const previewStrip = await createStrip();
            const media = await uploadToCloudinary();
            resolve({ previewStrip, media });
        } else {
            reject(new Error('Please upload an Image or Video'))
        }
    } catch (e) {
        reject(e);
    } finally {
        deleteFiles(filesToDelete)
    }
});

router.delete('/all', async function (req, res) {

});

router.get('/', jwtMiddleWare, async (req, res) => {
    try {
        const allContent = await Content.find({
            where: {
                userId: req.user.id,
                contentId: null
            },
            include: [{
                model: Content,
                as: 'versions'
            }]
        })
        // const allContent = await User.findAll({
        //     where: {
        //         id: req.user.id
        //     },
        //     include: [{
        //         model: Content,
        //         as: 'content',
        //         where: { contentId: null },
        //         include: [{
        //             model: Content,
        //             as: 'versions'
        //         }]
        //         // attributes: ['email']
        //     }]
        // });
        return res.status(200).json({
            success: true,
            data: allContent
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/new', jwtMiddleWare, upload.single('content'), async (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({
            success: false,
            message: req.fileValidationError
        });
    }
    const { id } = req.body;
    try {
        // START Content Builder Setup
        const contentBuilder = {
            userId: req.user.id
        };
        if (req.body.id) {
            const originalContent = await Content.count({ where: { id } })
            if (!originalContent) {
                throw new Error('Content with the supplied ID not found')
            }
            const versionNumber = await Content.count({ where: { contentId: id } });
            contentBuilder.version = versionNumber + 2;
            contentBuilder.contentId = id;
        }
        const upload = await uploadMedia(req.file);
        contentBuilder.type = upload.media.resource_type;
        contentBuilder.media = upload.media;
        // END Content Builder Setup
        const content = await Content.create(contentBuilder);
        return res.status(201).json({
            success: true,
            message: req.body.id ? 'Uploaded New Version!' : 'Created New Content!',
            data: content.dataValues
        });
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: e.message
        });
    }
});

module.exports = router;