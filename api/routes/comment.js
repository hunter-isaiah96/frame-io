import express from 'express';
import expressJwt from 'express-jwt'
import { Comment, Content, User } from '../db'

const router = express.Router()

const jwtMiddleWare = expressJwt({
    secret: process.env.AUTH_TOKEN_SECRET,
    credentialsRequired: false,
    algorithms: ['HS256'],
    getToken: (req) => {
        return req.cookies.auth_token || null
    }
})

router.post('/', jwtMiddleWare, async (req, res) => {
    const { text, timestamp, metaData, contentId, commentId, replyUserId } = req.body
    console.log(req.user.id)
    try {

        const originalPost = Content.findOne({
            where: {
                id: contentId,
                userId: req.user.id
            }
        })
        if (!originalPost) {
            throw new Error('Could not find this post')
        }

        const commentBuilder = {
            text, timestamp, metaData, contentId, userId: req.user.id
        }
        if(commentId) {
            const originalComment = await Comment.findOne({
                where: {
                    id: commentId,
                    contentId
                }
            })
            if(!originalComment) {
                throw new Error('This comment does not exist')
            }
            commentBuilder.commentId = commentId
        }

        await Comment.create(commentBuilder)

        const comments = await Comment.findAll({
            where: {
                contentId,
                commentId: null
            },
            include: [{
                model: Comment,
                as: 'replies',
                include: [
                    {
                        model: User,
                        as: 'user'
                    }
                ]
            }]
        })
        
        res.status(201).json({
            success: true,
            data: comments
        })
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        })
    }
    // try {
    //   Content.find()
    //   const comment = Comment.create({
    //     text: req.body
    //   })
    // } catch (e) {

    // }
})

module.exports = router