const express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

router.post('/Users', async (request, response) => {
  try {
    const db = request.mongoDb;
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    const userCollection = db.collection('User');
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await userCollection.findOne({ email: normalizedEmail });

    if (existingUser) {
      return response.status(400).json({ message: 'Email đã được đăng ký' });
    }

    const userId = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);

    const createdUser = {
      id: userId,
      email: normalizedEmail,
      password_hash,
      created_at: new Date().toISOString(),
    };

    await userCollection.insertOne(createdUser);

    response.status(201).json({ 
      message: 'Đã thành công tạo tài khoản', 
      user: {
        id: userId,
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error('Sign up failed:', error);
    response.status(500).json({ message: 'Không thể kết nối dịch vụ xác thực', error: error.message });
  }
});

router.post('/Users/Login', async (request, response) => {
  try {
    const db = request.mongoDb;
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await db.collection('User').findOne({ email: normalizedEmail });

    if (!user) {
      return response.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!isPasswordMatch) {
      return response.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, {expiresIn: "1h"})

    response.status(200).json({
      message: 'Đăng nhập thành công',
      token: token,
    });
  } catch (error) {
    console.error('Login failed:', error);
    response.status(500).json({ message: 'Không thể kết nối dịch vụ xác thực', error: error.message });
  }
});

router.get('/getuser/:userid', async (request, response) => {
  try {
    const db = request.mongoDb;
    const decoded = jwt.verify(request.params.userid, process.env.SECRET_KEY);
    const email = decoded.email;

    const userData = await db.collection('User').findOne(
      { email },
      { projection: { _id: 0, password_hash: 0 } }
    );

    if (!userData) {
      return response.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    response.status(200).json({ userData });
  } catch (error) {
    response.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
