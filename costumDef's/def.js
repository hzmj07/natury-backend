 export const  getStartOfWeek =(date) => {
    const startDate = new Date(date); // Mevcut tarihi al
    const day = startDate.getUTCDay(); // Haftanın gününü al (0: Pazar, 1: Pazartesi, ...)
    const diff = day === 0 ? -6 : 1 - day; // Eğer Pazar ise -6, diğer günler için (1 - gün)
  
    startDate.setUTCDate(startDate.getUTCDate() + diff); // Haftanın başlangıç tarihini hesapla
    startDate.setHours(0, 0, 0, 0); // Zamanı sıfırla
    return startDate;
  }

 export const getTodayDay = () => {
    const today = new Date(); // Bugünün tarihi
    const currentDay = today.getUTCDay(); // Haftanın gününü al (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
  
    // Gün kısaltmaları
    const daysAbbreviation = ["paz", "pzt", "sal", "çrş", "per", "cum", "cts"];
  
    return daysAbbreviation[currentDay]; // Bugünün kısaltmasını döndür
  };