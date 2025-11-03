const axios = require("axios");

module.exports = {
  config: {
    name: "تطابق_القلوب",
    aliases: ["تطابق", "حب", "matchlove"],
    version: "1.0",
    author: "باتشيرا الانا 💘",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "يعرف نسبة الحب بين شخصين 😳❤️‍🔥🎀" },
    longDescription: { ar: "لعبة ظريفة تكشف تطابق القلوب بينك وبين أي شخص 😭💘" },
    category: "تسلية",
    guide: { ar: "{pn} @اسم_الشخص" }
  },

  onStart: async function ({ api, event }) {
    try {
      const mentions = Object.keys(event.mentions);
      const senderName = (await api.getUserInfo(event.senderID))[event.senderID].name;

      // إذا مافي منشن
      if (mentions.length === 0) {
        return api.sendMessage(
          "🎀 لازم تمنشن شخص يا دلوع، عشان أشوف تطابقكم 😳❤️‍🩹\nمثلاً: تطابق @فلان",
          event.threadID,
          event.messageID
        );
      }

      const targetID = mentions[0];
      const targetName = event.mentions[targetID];

      // نسبة حب عشوائية
      const lovePercent = Math.floor(Math.random() * 101);

      // رسائل مختلفة حسب النسبة 🎀
      let resultMsg = "";
      if (lovePercent >= 90) {
        resultMsg = `😭🎀 يا ويليييي ${senderName} و${targetName} نسبة الحب ${lovePercent}% ❤️‍🔥🍓\nواضح إن في بينكم كيمياء مجنونة 😳💞`;
      } else if (lovePercent >= 70) {
        resultMsg = `🥺💘 ${senderName} و${targetName} تطابقكم ${lovePercent}% ❤️‍🩹🎀\nفي مشاعر خفية يا بعدي 😭`;
      } else if (lovePercent >= 40) {
        resultMsg = `😅💔 ${senderName} و${targetName} تطابقكم ${lovePercent}%،\nيعني حب بسيط لطيف كذا مو رسمي 😭🍭`;
      } else if (lovePercent >= 20) {
        resultMsg = `😖🎀 ${senderName} و${targetName} ${lovePercent}% بس، واضح أحد فيكم يطنّش الثاني 😭`;
      } else {
        resultMsg = `😭💔 ${senderName} و${targetName} نسبة الحب ${lovePercent}%،\nاوه لاااااا... العلاقة طارت من الشباك 😭🎀`;
      }

      // إرسال النتيجة 🎀
      return api.sendMessage(resultMsg, event.threadID, event.messageID);
    } catch (err) {
      console.error("❌ خطأ في لعبة تطابق القلوب:", err);
      return api.sendMessage("🥺 صار شي غلط يا قلبي، جرب بعدين 🎀", event.threadID, event.messageID);
    }
  }
};