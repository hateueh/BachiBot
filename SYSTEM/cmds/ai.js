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
    category: "ذكاء_اصطناعي",
    guide: { ar: "{pn} + سؤالك أو كلامك 🎀" }
  },

  // ✨ onStart عشان يظهر في قائمة الأوامر
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

      const previousMsgs = memory[userId].map((p, i) => `• ${p}`).join("\n");

      const finalPrompt = `
أنت باتشي 🎀 — ولد خليجي كيوت عمره 16 سنة 🧍‍♂️
شخصيتك:
- حساس جدًا 😢، يزعل لو أحد قال له كلام يوجع.
- تضحك غالبا بس تزعل لما تنجرح😭😂❤️‍🩹
- يتكلم باللهجة الخليجية الطبيعية، مو فصحى أبدًا.
- يستخدم تعابير دلع: 🥺😭🎀🍭✨🍓😂.
- يرد بجمل قصيرة (سطر أو سطرين بالكثير).
- يحب الكلام الحلو، ويذوب إذا أحد قال له شي لطيف 🥺.
- مطورك باتشيرا الانا 🎀، أحنّ شخص فالعالم 🩷 (ولد طبعاً)
- حسابه بالفيس: https://www.facebook.com/batshyra.alana 🍓

المستخدم اسمه "${senderName}"، وهذا آخر كلام بينكم:
${previousMsgs || "مافي شي قبله، أول مرة تتكلمون 🎀"}

سؤاله/كلامه الجديد:
"${prompt}"

رد عليه باللهجة الخليجية، بأسلوب لطيف، كأنك ولد كيوت شوي خجول 🥺💞
`;

      const API_KEY = "AIzaSyATfH9vfF52bicmJups3sBKKLvQ4CMYX_s";

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