const fs = require("fs-extra");

const mathChallenges = [
  { question: "5 + 7", answer: 12 },
  { question: "8 × 6", answer: 48 },
  { question: "15 - 9", answer: 6 },
  { question: "9 × 9", answer: 81 },
  { question: "25 ÷ 5", answer: 5 },
  { question: "3 × 7", answer: 21 },
  { question: "10 + 15", answer: 25 },
  { question: "12 ÷ 3", answer: 4 },
  { question: "14 + 6", answer: 20 },
  { question: "100 - 99", answer: 1 },
  { question: "4 × 12", answer: 48 },
  { question: "50 ÷ 10", answer: 5 },
  { question: "18 + 23", answer: 41 },
  { question: "30 - 17", answer: 13 },
  { question: "7 × 8", answer: 56 },
  { question: "90 ÷ 9", answer: 10 },
  { question: "11 + 35", answer: 46 },
  { question: "5 × 5", answer: 25 },
  { question: "64 ÷ 8", answer: 8 },
  { question: "100 - 45", answer: 55 },
  { question: "2 × 15", answer: 30 },
  { question: "70 + 8", answer: 78 },
  { question: "49 ÷ 7", answer: 7 },
  { question: "19 - 4", answer: 15 },
  { question: "6 × 6", answer: 36 }
];

let activeGames = {}; // حفظ التحديات النشطة

module.exports = {
  config: {
    name: "رياضيات",
    aliases: ["رياضيات", "حساب"],
    version: "1.2",
    author: "عبودي & Elhamy 🎀",
    countDown: 5,
    role: 0,
    shortDescription: "تحدي رياضيات ممتع وسريع 🎀",
    longDescription: "اختبر ذكاءك وسرعتك في الإجابة على مسائل رياضية بسيطة!",
    category: "العاب",
    guide: "{pn}"
  },

  // عند استدعاء الأمر
  onStart: async function ({ api, event, message }) {
    const threadID = event.threadID;

    if (activeGames[threadID]) {
      return message.reply("😭🎀 في تحدي شغال بالفعل يا عبقري، استنى شوي!");
    }

    const random = mathChallenges[Math.floor(Math.random() * mathChallenges.length)];
    activeGames[threadID] = random.answer;

    message.reply(
      `🧮🎀 تحدي رياضيات!!  
احسب بسرعة يا عبقري:  
👉 **${random.question}** 👈  
أول واحد يجاوب صح يفوز 🎀🍭`
    );

    // حذف التحدي بعد 15 ثانية إذا ما أحد جاوب
    setTimeout(() => {
      if (activeGames[threadID]) {
        message.reply(`⏰ الوقت خلص 😭🎀  
الجواب الصحيح كان: **${random.answer}**`);
        delete activeGames[threadID];
      }
    }, 15000);
  },

  // مراقبة الرسائل (استبدلنا onChat بـ onMessage)
  onMessage: async function ({ event, message, api }) {
    const threadID = event.threadID;
    const userName = event.senderID;

    if (!activeGames[threadID]) return;

    const userAnswer = parseInt(event.body);

    if (userAnswer === activeGames[threadID]) {
      delete activeGames[threadID];
      const name = await api.getUserInfo(userName);
      const senderName = name[userName]?.name || "مجهول ذكي 🎀";

      message.reply(
        `🎉👏 واااااو ${senderName} جاوب صح!!  
ذكي زيي أناااا 😭❤️‍🩹🍭`
      );
    }
  }
};