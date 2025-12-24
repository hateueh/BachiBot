const axios = require("axios");

// 🧠 ذاكرة أوسع: آخر 10 رسائل لكل مستخدم
const memory = {};

module.exports = {
  config: {
    name: "باتشي",
    aliases: ["gimini", "gmini", "باتشي", "باشي", "بشي", "بتشي", "ai", "ذكاء", "جيميني", "كيوتي", "الكيوت"],
    version: "3.0",
    author: "باتشيرا الانا 🧠✨",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "ذكاء اصطناعي كيوت، حساس، ويرد باللهجة الخليجية 🎀" },
    longDescription: { ar: "باتشي (ولد خليجي دلوع عمره 16 🥺) يرد بأسلوب لطيف وغوثي 😭🎀" },
    category: "ذكاء اصطناعي",
    guide: { ar: "{pn} + سؤالك أو كلامك 🎀" }
  },

  onStart: async function ({ message }) {
    message.reply("🎀 باتشي هنا يا قلبي! للرد عليّ، اكتب: باتشي + كلامك 🩷");
  },

  onChat: async function({ api, event }) {
    try {
      const msg = event.body?.trim();
      if (!msg) return;

      const triggers = ["باتشي", "باشي", "بشي", "بتشي", "ai", "ذكاء", "جيميني", "كيوتي", "الكيوت"];
      const lower = msg.toLowerCase();
      const trigger = triggers.find(t => lower.startsWith(t));
      if (!trigger) return;

      const senderName = event.senderName || "يا بعد قلبي";
      const userId = event.senderID;
      const prompt = msg.slice(trigger.length).trim();

      if (prompt.length === 0) {
        return api.sendMessage("نعم معاك باتشي😳🎀 شو تبي عاد؟! للرد: باتشي (سؤال أو كلامك) 💞", event.threadID, event.messageID);
      }

      // 🧠 إنشاء ذاكرة إذا ما كانت موجودة
      if (!memory[userId]) memory[userId] = [];

      // ➕ إضافة الرسالة الحالية
      memory[userId].push(prompt);

      // ✂️ الاحتفاظ بآخر 10 فقط
      if (memory[userId].length > 10) memory[userId].shift();

      // 🧵 بناء سياق مرتب
      const conversation = memory[userId]
        .map((p, i) => `رسالة ${i+1}: ${p}`)
        .join("\n");

      // 🎀 البرومبت
      const finalPrompt = `
أنت "باتشي" 🎀 — فيمبوي غوث خليجي دلوع عمره 16 🖤.
أسلوبك:
- كيوت ومشاغب، بس لطيف 😭🎀
- حساس شوي ويزعل إذا أحد قسى عليه 💔
- لهجة خليجية قصيرة وخفيفة
- Emojis: 😭🖤🎀😹✨

اسم المستخدم: ${senderName}

هذا سجل آخر كلام بينكم:
${conversation}

سؤاله الحالي:
${prompt}

رد كأنك شخص حقيقي بأسلوب باتشي بدون مبالغة.
`;

      // 🔑 API KEY — ضعه هنا لاحقًا
      const API_KEY = "AIzaSyDJZ6gvbQ28_QjVOK8SkTOVrEtMEVqxYS8";

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: finalPrompt }]
            }
          ],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 2048
          }
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const replyText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        || "هااا 😳؟ ما فهمت يمكن 🥺🎀";

      return api.sendMessage(replyText, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ خطأ في باتشي:", err.response?.data || err.message);
      return api.sendMessage("🥺💔 صار شي غلط يا قلبي، باتشي زعل شوي، جرب بعدين 🎀", event.threadID, event.messageID);
    }
  }
};