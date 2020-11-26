import express from 'express';
import bcrypt from 'bcrypt';
import { body,query, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import db from '../db'

const User = db.User
const router = express.Router();

async function checkPasswordMatch(password, hash) {
  return await bcrypt.compare(password, hash);
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// Login
router.post('/', [
  body('email').isEmail().withMessage('Enter a properly formatted email address')
], async function (req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({where: { email }})
    const passwordMatch = await checkPasswordMatch(password, user.dataValues.hashed_password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email or password was not entered correctly'
      });
    }
    const auth_token = jwt.sign({ id: user.dataValues.id, email: user.dataValues.email }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '20d' });
    const refresh_token = jwt.sign({ id: user.dataValues.id, email: user.dataValues.email }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '200d' });
    res.status(201).json({
      success: true,
      message: 'Authenticated',
      auth_token,
      refresh_token
    });
  } catch (err) {
    res.send(err);
  }
});

// Register
router.post('/new', [
  body('email').isEmail().withMessage('Enter a properly formatted email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be no less than 8 characters'),
  body('confirm_password').custom((value, { req }) => {
    if (value != req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], async (req, res) => {
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const { email, password } = req.body;
    const hashed_password = await hashPassword(password);
    const user = await User.create({
      email,
      hashed_password,
    })
    const auth_token = jwt.sign({ id: user.dataValues.id, email: user.dataValues.email }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '20d' });
    const refresh_token = jwt.sign({ id: user.dataValues.id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '200d' });
    res.status(201).json({
      success: true,
      message: 'User Created!',
      auth_token,
      refresh_token
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      error: e.message
    })
  }
});

// Check if user exists
router.get('/checkemail', [
  query('email').isEmail().withMessage('Enter a properly formatted email address'),
], async (req, res) => {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    const { email } = req.query;
    const user = await User.findOne({where: { email }})
    res.status(200).json({
      success: true,
      status: 200,
      exists: !!user
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;