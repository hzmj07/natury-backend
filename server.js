import express from 'express';
import { dbCon } from './config/dbcofing.js';
import router from './auth/auth.js';
import route from './roters/dataRoters.js';
import dotenv from "dotenv";
const app = express();
const port = 5055;
dotenv.config();
app.use(express.json());  // JSON verilerini çözümlemek için

// MongoDB bağlantısı

dbCon();
app.use(express.json());
app.use('/auth', router);
app.use("/data" ,  route);


// Kullanıcı ekleme işlemiD


// Sunucu başlatma
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
