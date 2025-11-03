const fs = require("fs");

module.exports = {
  config: {
    name: "من_يحبك",
    aliases: ["من يحبك", "حب_سري", "love"],
    version: "1.0",
    author: "باتشيرا الانا 💖",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "يكتشف من يحبك سرًا 😳🎀" },
    longDescription: { ar: "يختار البوت شخصًا من القروب عشوائيًا ويخبرك أنه يحبك سرًا بطريقة دلّوعة وكيوت 🍭" },
    category: "تسلية",
    guide: { ar: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    try {
      // جلب قائمة الأعضاء من القروب
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());

      if (members.length < 2) {
        return api.sendMessage("مافي أحد بالقروب غيرك يا دلوووع 😭🎀", event.threadID);
      }

      // اختيار شخص عشوائي
      const loverID = members[Math.floor(Math.random() * members.length)];
      const loverInfo = await api.getUserInfo(loverID);
      const loverName = loverInfo[loverID]?.name || "واحد مجهول 😳";

      // عبارات عشوائية كيوت ومحرجة شويه 😭🎀
      const messages = [
        `🥺🎀 ترى في واحد يحبك من بعيد... بس يستحي يقول... اسمه ${loverName} 😳❤️‍🩹`,
        `😖🍭 ${loverName} معجب فيك سرًا من زمااان، ودايم يسأل عنك بالقروب 😭💘`,
        `🎀💞 ${loverName} قال لي اليوم: "ياخي قل له/لها أحبّه بس ما أبي ينصدم 😳🍓"`,
        `😳✨ ${loverName} يتوتر كل ما تكتب، يقول: "كلامه/ها يجننن 😭❤️‍🔥"`,
        `😖🎀 ${loverName} يحبك حب بريء ولطيف، يقول "أبي أحتويه مو أكثر 😭🍭"`
      ];

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      // إرسال الرسالة
      return api.sendMessage(randomMsg, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ خطأ في لعبة من يحبك:", err);
      return api.sendMessage("🥺 صار خطأ بسيط، حاول بعدين يا دلوع 🎀", event.threadID, event.messageID);
    }
  }
};