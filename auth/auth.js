import express from 'express';
import {User} from '../model/user.js'; // Kullanıcı modeli import edilir
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

const router = express.Router();
const mongoUri = process.env.JWT_SECRET;


// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Tüm alanların dolu olup olmadığını kontrol et
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // E-posta ile mevcut kullanıcıyı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Kullanıcı adının benzersiz olduğunu kontrol et
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Şifreyi hashle
    const hashedPassword = await argon2.hash(password);

    // Yeni kullanıcıyı oluştur
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Kullanıcıyı veritabanına kaydet
     user.save();

    // Başarılı kayıt yanıtı gönder
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(mongoUri);
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(402).json({ message: "Invalid email or password" });
    }

    // Şifre doğrulama
    const isMatch = await argon2.verify(user.password, password);

    if (!isMatch) {
      return res.status(401).json({ message:  "Invalid email or password" });
    }

    // Token'ları oluştur
    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );
    console.log(accessToken , );
    const TokenS = {
      accessToken : accessToken,
      refreshToken : refreshToken,
      acsessTime: new Date().toISOString(),
    }
    
    res.status(200).json({
      TokenS,
      user,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Token doğrulama
    const decoded = jwt.verify(refreshToken, process.env.JWT_ACCESS_TOKEN);

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Yeni access token oluştur
    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Yeni refresh token oluştur (opsiyonel)
    const newRefreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // İstersen kullanıcıya yeni refresh token gönder
      acsessTime:  new Date().toISOString(),
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token", error: err.message });
  }
});


export default router;
