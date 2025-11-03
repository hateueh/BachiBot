const fs = require("fs-extra");

const emojis = {
  حب: ["❤️", "💖", "💘", "💝", "💕", "💞", "💓", "😍", "😘", "🥰"],
  نار: ["🔥", "💥", "⚡", "😈", "🥵", "☄️"],
  حزن: ["😢", "😭", "💔", "😞", "😔", "🥺"],
  ضحك: ["😂", "🤣", "😆", "😁", "😹", "🤭"],
  نوم: ["😴", "💤", "🛌", "😪", "🌙"],
  كيوت: ["🥺", "😳", "🎀", "🍭", "🧸", "💖", "🤍"],
  قلوب: ["❤️", "🩷", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎"],
  غضب: ["😡", "😠", "🤬", "💢", "👿"],
  اكل: ["🍕", "🍔", "🍟", "🍣", "🍩", "🍫", "🍦", "🍰", "🍉", "🍓"],
  حيوان: ["🐱", "🐶", "🐰", "🐻", "🐼", "🐯", "🦊", "🐸", "🐥", "🦋"],
  سماء: ["🌙", "🌞", "⭐", "☁️", "🌈", "⚡", "🌤️", "🌧️"],
  زهره: ["🌸", "🌹", "🌷", "💐", "🌺", "🌻", "🌼"],
  مال: ["💰", "💸", "💵", "💳", "🪙", "🏦"],
  وقت: ["⏰", "⌛", "🕒", "📅", "⏱️"],
};

let activeGames = {};

module.exports = {
  config: {
    name: "احزر_الايموجي",
    aliases: ["emoji", "guess_emoji"],
    version: "1.3",
    author: "باتشيرا الانا🍭",
    countDown: 5,
    role: 0,
    shortDescription: "لعبة احزر الإيموجي 🎀",
    longDescription: "يحاول اللاعبون تخمين الإيموجي المناسب للكلمة 🎀🍭",
    category: "العاب",
    guide: "{pn}"
  },

  // بداية اللعبة
  onStart: async function({ api, event, message }) {
    const threadID = event.threadID;

    if (activeGames[threadID]) {
      return message.reply("😭🎀 في لعبة شغالة بالفعل، اصبر شوي يا مشاغب!");
    }

    const words = Object.keys(emojis);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const correctEmojis = emojis[randomWord];

    activeGames[threadID] = { word: randomWord, answers: correctEmojis };

    message.reply(
      `🎀🍭 احزر الإيموجي المناسب للكلمة التالية:\n\n💬 الكلمة: "${randomWord}"\n\nأول واحد يرسل الإيموجي الصحيح يفوز 😆❤️‍🔥`
    );

    // ينتهي الوقت بعد 15 ثانية
    setTimeout(() => {
      if (activeGames[threadID]) {
        message.reply(
          `⏰ الوقت انتهى 😭🎀\nالإيموجيات الصحيحة كانت: ${correctEmojis.join(" ")}`
        );
        delete activeGames[threadID];
      }
    }, 15000);
  },

  // التحقق من الردود (استبدلنا onChat بـ onMessage)
  onMessage: async function({ event, message, api }) {
    const threadID = event.threadID;
    const currentGame = activeGames[threadID];
    if (!currentGame) return;

    const userAnswer = event.body.trim();

    if (currentGame.answers.includes(userAnswer)) {
      const userName =
        (await api.getUserInfo(event.senderID))[event.senderID]?.name ||
        "لاعب مجهول 🎀";

      message.reply(
        `🎉 مبرووووك ${userName}! 😍❤️‍🔥\nعرفت الإيموجي الصحيح "${userAnswer}" 🎀🍭`
      );

      delete activeGames[threadID];
    }
  }
};