
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/user.js";
import dotenv from "dotenv";
dotenv.config();
const route = express.Router();
import { updateDailyData , getAllUsersTotalPoints  , updateTotalPoints} from "../addPoint/addPoint.js";
// API anahtarınızı buraya ekleyin



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Token doğrulama middleware
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Token'ı doğrula
    req.userId = decoded.id; // Token'dan userId'yi al ve req.userId'ye ata
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token", success: false });
  }
};




route.post("/addValue", verifyToken, async (req, res) => {
    const { value } = req.body;

    if (!value) {
        return res.status(401).json({ message: "eksik parametre", success: false });
    }

  
    try {
      const userId = req.userId;
      // Kullanıcıya ait mevcut mesaj geçmişini getirme
      const user = await User.findOne({ _id: userId }).exec();
        
    if (!value) {
        return res.status(401).json({ message: "kullanıcı bulunamadı", success: false });
    }

    await updateDailyData(userId , value)
    
      res.status(200).json({ message: "Message saved successfully", data: user, success: true });
    } catch (err) {
      console.error("Error generating or saving message:", err); // Hata mesajını konsolda da göster
      res.status(500).json({ message: "Server error", error: err.message, success: false });
    }
  });

  route.get("/getAllUsersTotalPoints", verifyToken, async (req, res) => {
    try {
      const data = await getAllUsersTotalPoints();
   
    
      res.status(200).json({ message: "Message saved successfully", data: data , success: true });
    } catch (err) {
      console.error("Error generating or saving message:", err); // Hata mesajını konsolda da göster
      res.status(500).json({ message: "Server error", error: err.message, success: false });
    }
  });

  export default route;