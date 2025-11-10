const axios = require("axios");
const { getPrefix } = global.utils;

const API_KEY = "AIzaSyBJIOdF977s87SfNM2nTQk_O4zgTK1M1II";
const BOT_NAME = "سينكو";
const aliases = ["senku", "سينكو", "سينكووو", "سِنكو", "سينك"];

module.exports = {
  config: {
    name: "سينكو",
    version: "1.5",
    author: "باتشيرا الانا 🎀",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "العالم سينكو يجيب بعقل علمي 🧠⚗️",
    },
    longDescription: {
      ar: "بوت ذكي يتفاعل علميًا فقط عند مناداته باسمه أو ألقابه 😌",
    },
    category: "ذكاء اصطناعي",
    guide: {
      ar: "{pn} [سؤال] بعد مناداة سينكو ⚗️",
    },
  },

  onStart: function ({ message, event }) {
    const { body } = event;
    const lowerBody = body?.toLowerCase() || "";

    // تحقق إذا تم مناداته بالاسم أو alias
    if (!aliases.some(alias => lowerBody.startsWith(alias.toLowerCase()))) return;

    const userMsg = body.replace(new RegExp(`^(${aliases.join("|")})`, "i"), "").trim();
    if (!userMsg) return message.reply("🧠│تفضل، ما هو سؤالك العلمي؟");

    // برومبت سينكو
    const prompt = `
أنت الآن في وضع الشخصية: "سينكو" من أنمي Dr. Stone.
تتحدث بذكاء وهدوء، وتحب التحليل العلمي الدقيق.
تتحدث أحيانًا بأسلوب عبقري ساخر، لكن تظل محترمًا.
أجب على السؤال أدناه بلغة عربية واضحة وذكية، مع لمسة خفيفة من طريقتك العبقرية.

المطور الخاص بك: باتشيرا الانا 🎀  
عبقري صغير ومبتكر في البرمجة 💻  
رابطه في الفيسبوك: https://www.facebook.com/batshyra.alana  

السؤال من المستخدم:
"${userMsg}"
`;

    // إعداد الطلب إلى Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    axios
      .post(url, payload)
      .then(res => {
        const response =
          res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "❌│لم أستطع الوصول لإجابة دقيقة حالياً، أعد صياغة سؤالك من فضلك.";
        message.reply(`🔬│${response}`);
      })
      .catch(() => {
        message.reply("⚠️│حدث خطأ أثناء الاتصال بـ API يا عبقري.");
      });
  },
};