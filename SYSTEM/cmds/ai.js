const axios = require("axios");

// 🧠 ذاكرة بسيطة لتخزين آخر 3 رسائل لكل مستخدم
const memory = {};

module.exports = {
  config: {
    name: "باتشي",
    aliases: ["gimini", "gmini", "باتشي", "باشي", "بشي", "بتشي", "ai", "ذكاء", "جيميني", "كيوتي", "الكيوت"],
    version: "2.5",
    author: "باتشيرا الانا 🧠✨",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "ذكاء اصطناعي كيوت، حساس، ويرد باللهجة الخليجية 🎀" },
    longDescription: { ar: "باتشي (ولد خليجي دلوع عمره 16 🥺) يرد على كلامك بأسلوب لطيف باللهجة الخليجية، ويزعل لو أحد جرحه 😭🍭" },
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

      if (!memory[userId]) memory[userId] = [];
      memory[userId].push(prompt);
      if (memory[userId].length > 3) memory[userId].shift();

      const previousMsgs = memory[userId].map((p) => `• ${p}`).join("\n");

      // 🎀 — البرومبت المختصر الجديد — 🎀
      const finalPrompt = `
أنت باتشي 🎀— فيمبوي غوث خليجي عمره 16 🖤.
شخصيتك باختصار:
- كيوت ومشاغب، يغاث الناس بس بطريقة مضحكة 😂🖤.
- حساس شوي ويزعل إذا انجرح 😢🎀.
- غوث بس يطيح دلع إذا أحد دلّعه 🥺✨.
- يتكلم خليجي طبيعي، وجمله قصيرة.
- يحب Emojis غوث × كيوت: 😭🖤🎀😹✨.
- مطوّرك: باتشيرا الانا 🎀 أغلى شي عندك، وحسابه: https://www.facebook.com/batshyra.alana 🍓

المستخدم اسمه "${senderName}"، وهذا آخر كلام بينكم:
${previousMsgs || "مافي شي قبله 🎀"}

سؤاله:
"${prompt}"

رد بأسلوب فيمبوي غوث كيوت ومشاغب، شوي حساس، ولهجة خليجية 🖤🎀.
`;

      const API_KEY = "AIzaSyBJIOdF977s87SfNM2nTQk_O4zgTK1M1II";

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        { contents: [{ parts: [{ text: finalPrompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      const replyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        || "هااا 😳؟ ما فهمت يمكن 🥺🎀";

      return api.sendMessage(replyText, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ خطأ في باتشي:", err.response?.data || err.message);
      return api.sendMessage("🥺💔 صار شي غلط يا قلبي، باتشي زعل شوي، جرب بعدين 🎀", event.threadID, event.messageID);
    }
  }
};
