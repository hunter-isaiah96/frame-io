require('dotenv').config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import commentRoutes from './routes/comment';
import db from './db';

db.sequelize.sync({ force: true }).then(() => {

});
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
// ROUTES //

app.use('/auth', authRoutes);
app.use('/content', contentRoutes);
app.use('/comment', commentRoutes);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(err.status).send({ message: err.message });
    return;
  }
  next();
});

export default {
  path: '/api',
  handler: app
};
