import mongoose from "mongoose";
import { User } from "../model/user.js"; // User modelini uygun yoldan içe aktar
import { getStartOfWeek, getTodayDay } from "../costumDef's/def.js";


const today = new Date();
const weekStart = getStartOfWeek(today);
const day = getTodayDay();



export const upDateEnergy = async (userId, energy) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    // Eğer userData.recoveredEnergy yoksa, sıfırla başlat.
    if (!user.userData.recoveredEnergy) {
      user.userData.recoveredEnergy = 0;
    }
    console.log(energy);
    
    // recoveredEnergy'yi güncellemeden önce doğru şekilde toplama yapalım.
    const currentEnergy = user.userData.recoveredEnergy;

    user.userData.recoveredEnergy = currentEnergy + energy;
    console.log("dataaaaa" ,user.userData.recoveredEnergy );
    
    // Kullanıcıyı güncelle.
    await user.save();
    return { success: true };
  } catch (error) {
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

export const upDateTree = async (userId, trees) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    // Eğer userData.trees yoksa, sıfırla başlat.
    if (!user.userData.trees) {
      user.userData.trees = 0;
    }
    console.log(trees);
    
    // trees'yi güncellemeden önce doğru şekilde toplama yapalım.
    const currenttrees = user.userData.trees;
    user.userData.trees = currenttrees + trees;
    console.log("dataaaaa" ,user.userData.trees );
    
    // Kullanıcıyı güncelle.
    await user.save();
    return { success: true };
  } catch (error) {
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

export const upDatePoint = async (userId, additionalValue) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    let userWeek = user.userData.weeks;
    const lastWeek = userWeek.length > 0 ? userWeek[userWeek.length - 1] : null;

    if (!lastWeek || new Date(lastWeek.start).getTime() !== weekStart.getTime()) {
      // Yeni hafta başlatma işlemi
      const newWeek = {
        start: weekStart,
        end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
        data: [{ day, value: additionalValue }]
      };

      await User.findByIdAndUpdate(
        userId,
        { $push: { "userData.weeks": newWeek } },
        { new: true }
      );
    } else {
      // Var olan haftayı güncelleme işlemi
      const dayData = lastWeek.data.find((d) => d.day === day);
      if (dayData) {
        dayData.value += additionalValue;
      } else {
        lastWeek.data.push({ day, value: additionalValue });
      }

      await User.findOneAndUpdate(
        { _id: userId, "userData.weeks.start": lastWeek.start },
        { $set: { "userData.weeks.$.data": lastWeek.data } },
        { new: true }
      );
    }
    await updateTotalPoints(userId);
    return { success: true };
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};





export const getAllUsersTotalPoints = async () => {
  try {
    // Sadece username ve totalPoints alanlarını al
    const users = await User.find({}, "username userData.totalPoints").lean();

    if (!users || users.length === 0) {
      return { message: "No users found", success: false };
    }

    // Büyükten küçüğe sırala
    users.sort((a, b) => (b.userData.totalPoints || 0) - (a.userData.totalPoints || 0));

    // Sıralama ekle
    users.forEach((user, index) => {
      user.rank = index + 1; // 1. sıradan başlat
    });

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
    const newTotalPoints = user.userData.weeks.reduce((total, week) => {
      return total + week.data.reduce((weekTotal, day) => weekTotal + day.value, 0);
    }, 0);

    // totalPoints'i güncelle ve kaydet
    user.userData.totalPoints = newTotalPoints;
    await user.save();

    console.log(` Kullanıcının toplam puanı güncellendi: ${newTotalPoints}`);
    return { "status": true, message: "veriEklendi ${newTotalPoints} " }
  } catch (error) {
    console.error(" Total points güncellenirken hata oluştu:", error);
    throw error;
  }
};


export const getUserData = async (userId) => {
  try {
      const user = await User.findById(userId, 'userData'); // Sadece name ve email alanlarını getir
      console.log(user);
      return user
  } catch (error) {
      console.error('Hata:', error);
  }
};
