import mongoose from "mongoose";
import {User} from "../model/user.js"; // User modelini uygun yoldan içe aktar
import {getStartOfWeek , getTodayDay} from "../costumDef's/def.js";


const today = new Date();
const weekStart = getStartOfWeek(today);
const day = getTodayDay();



export const updateDailyData = async (userId, additionalValue) => {
  try {
    // Kullanıcıyı bul
    const user = await User.findOne({ _id: userId });
    console.log(user);
    if (!user) {
      console.log("Kullanıcı bulunamadı.");
      return;
    }

    // Güncel haftayı bul
    let week = user.weeks.find((w) => w.start.toISOString() === weekStart.toISOString());

    // Eğer hafta yoksa yeni bir hafta oluştur
    if (!week) {
      week = {
        start: weekStart,
        end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), // Haftanın bitiş tarihi
        data: [{ day: day, value: additionalValue }]
      };
      user.weeks.push(week); 
      await user.save();
      return;// Yeni haftayı kullanıcının haftalarına ekle
    }

    // Gün verisini güncelle
    const dayData = week.data.find((d) => d.day === day);

    if (dayData) {
      dayData.value += additionalValue; // Mevcut değere ekleme yap
    } else {
      week.data.push({ day: day, value: additionalValue }); // Yeni gün ekle
    }

    // Kullanıcı belgesini kaydet
    await user.save(); 
    console.log("Veri güncellendi:", user);
    return;
   
  } catch (error) {
    console.error("Güncelleme hatası:", error);
  }
};



export const getUserTotalPoints = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      console.log("Kullanıcı bulunamadı.");
      return 0;
    }

    console.log(`Kullanıcının toplam puanı: ${user.totalPoints}`);
    return user.totalPoints;
  } catch (error) {
    console.error("Toplam puan hesaplama hatası:", error);
    return 0;
  }
};



export const getAllUsersTotalPoints = async () => {
  try {
    // Sadece username ve totalPoints alanlarını al
    const users = await User.find({}, "username totalPoints").lean();

    if (!users || users.length === 0) {
      return { message: "No users found", users: [], success: false };
    }

    return { users, success: true };
  } catch (error) {
    console.error("Error fetching users' total points:", error);
    return { message: "Server error", error: error.message, success: false };
  }
};




export const updateTotalPoints = async (userId) => {
  try {
    // Kullanıcıyı veritabanından çek
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    // Yeni totalPoints hesapla
    const newTotalPoints = user.weeks.reduce((total, week) => {
      return total + week.data.reduce((weekTotal, day) => weekTotal + day.value, 0);
    }, 0);

    // totalPoints'i güncelle ve kaydet
    user.totalPoints = newTotalPoints;
    await user.save();

    console.log(`✅ Kullanıcının toplam puanı güncellendi: ${newTotalPoints}`);
    return newTotalPoints;
  } catch (error) {
    console.error("❌ Total points güncellenirken hata oluştu:", error);
    throw error;
  }
};
