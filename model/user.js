import mongoose from 'mongoose';

// Gün Verisi Şeması
const dataSchema = new mongoose.Schema({
  day: { type: String, required: true }, // Gün adı (pzt, sal, çrş, vb.)
  value: { type: Number, required: true }, // Gün için değer
});

// Haftalık Veri Şeması
const weekSchema = new mongoose.Schema({
  start: { type: Date, required: true }, // Haftanın başlangıç tarihi
  end: { type: Date, required: true },   // Haftanın bitiş tarihi
  data: [dataSchema], // Gün verileri
});

// Kullanıcı Şeması
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userData:{
      recoveredEnergy:{ type: Number, default: 0 },
      weeks: [weekSchema], // Haftalık veriler
    totalPoints: { type: Number, default: 0 },
    trees : { type: Number, default: 0 },
    }
     // Toplam puanı kaydet
  },
  {
    timestamps: true
  }
);

// **Her kayıttan önce totalPoints güncelle**
// **Kayıttan sonra totalPoints güncelle**


// Kullanıcı Modelini Oluştur
export const User = mongoose.model("User", userSchema, "users");
