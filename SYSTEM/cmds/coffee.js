module.exports = {
  config: {
    name: "قهوة",
    aliases: ["coffee", "كوفي"],
    version: "1.0",
    author: "باتشيرا الانا 🎀",
    countDown: 5,
    role: 0,
    shortDescription: "أمر لطيف يقدم لك فنجان قهوة ☕",
    longDescription: "البوت يرسل لك صورة قهوة مع رسالة لطيفة للشخص الذي طلب الأمر 🍭",
    category: "متعة",
    guide: "{pn}"
  },

  onStart: async function({ api, event, message }) {
    const senderName = event.senderName;

    // قائمة صور قهوة جميلة (يمكن تضيف صور أكثر)
    const coffeeImages = [
      "https://i.imgur.com/1pR2wVw.jpg",
      "https://i.imgur.com/3Xq6VZf.jpg",
      "https://i.imgur.com/wHkJbGJ.jpg",
      "https://i.imgur.com/Nv7B6cZ.jpg",
      "https://i.imgur.com/2KQ4f6x.jpg"
    ];

    const randomImage = coffeeImages[Math.floor(Math.random() * coffeeImages.length)];

    message.reply({
      body: `☕ ياااه ${senderName}، فنجان قهوة لك اليوم! استمتع 😍🎀`,
      attachment: await global.utils.download(randomImage) // تأكد عندك دالة download
    });
  }
};