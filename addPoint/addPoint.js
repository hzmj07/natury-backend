import mongoose from "mongoose";
import { User } from "../model/user.js"; // User modelini uygun yoldan içe aktar
import { getStartOfWeek, getTodayDay } from "../costumDef's/def.js";


const today = new Date();
const weekStart = getStartOfWeek(today);
const day = getTodayDay();



export const upDatePoint = async (userId, additionalValue) => {
  try {
    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    let userWeek = user.userData.weeks;

    if (userWeek.length === 0 || userWeek.at(-1).start.toISOString() !== weekStart.toISOString()) {
      // Yeni hafta işlemleri
      console.log("yeni hafta ");
      const week = {
        start: weekStart,
        end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
        data: [{ day: day, value: additionalValue }]
      };
      user.userData.weeks.push(week);
      await user.save();
      console.log("yeni veri eklendi");
    } else {
      // Geçerli haftaya ekleme işlemleri
      const dayData = userWeek.at(-1).data.find((d) => d.day === day);
      if (dayData) {
        dayData.value += additionalValue;
      } else {
        userWeek.at(-1).data.push({ day: day, value: additionalValue });
      }
      await user.save();
      console.log("Veri güncellendi:", user);
    }
  } catch (error) {
    console.error("Güncelleme hatası:", error);
  }
};






export const getAllUsersTotalPoints = async () => {
  try {
    // Sadece username ve totalPoints alanlarını al
    const users = await User.find({}, "username totalPoints").lean();

    if (!users || users.length === 0) {
      return { message: "No users found", success: false };
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
    return { "status": true, message: "veriEklendi ${newTotalPoints} " }
  } catch (error) {
    console.error("❌ Total points güncellenirken hata oluştu:", error);
    throw error;
  }
};
