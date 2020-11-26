import expressJwt from 'express-jwt'

module.exports = expressJwt({
    secret: process.env.AUTH_TOKEN_SECRET,
    algorithms: ['HS256'],
    getToken: (req) => {
        return req.cookies.auth_token || null;
    }
});