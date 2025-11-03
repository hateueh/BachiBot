
const axios = require("axios");

// 🧠 ذاكرة مؤقتة بسيطة لكل مستخدم (تخزن آخر 3 رسائل)
const memory = {};

module.exports = {
  config: {
    name: "باتشي",
    aliases: ["gimini", "gmini", "باتشي"],
    version: "2.0",
    author: "باتشيرا الانا 🧠✨",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "ذكاء اصطناعي دلوع وكيوت يرد باللهجة الخليجية 🎀" },
    longDescription: { ar: "باتشي (ولد دلوع عمره 16 🥺) يرد على أي سؤال بلهجة خليجية وبأسلوب ظريف، ويتذكر شوية من كلامك السابق ❤️‍🩹🍭" },
    category: "ذكاء_اصطناعي",
    guide: { ar: "{pn} + سؤالك" }
  },

  onStart: async function () {
    // لا شيء عند التشغيل
  },

  onChat: async function({ api, event }) {
    try {
      const msg = event.body?.trim();
      if (!msg) return;

      // يتأكد أن الرسالة تبدأ بـ "باتشي"
      if (!msg.toLowerCase().startsWith("باتشي")) return;

      const senderName = event.senderName || "يا بعد قلبي";
      const userId = event.senderID;

      // يستخرج السؤال بعد كلمة "باتشي"
      const prompt = msg.slice("باتشي".length).trim();
      if (prompt.length === 0) return;

      // 🧠 يحفظ آخر 3 رسائل لكل مستخدم
      if (!memory[userId]) memory[userId] = [];
      memory[userId].push(prompt);
      if (memory[userId].length > 3) memory[userId].shift(); // يخلي فقط آخر 3

      // ⏳ نص المحادثة السابقة لليوزر
      const previousMsgs = memory[userId].map((p, i) => `رسالة ${i+1}: ${p}`).join("\n");

      // ✨ البرومبت المطوّر
      const finalPrompt = `
أنت باتشي، ولد خليجي عمره 16 سنة 🧍‍♂️🎀، شخصيتك:
- دلوع، كيوت، مرح، شوي خجول 😳
- تحب تستخدم لهجة خليجية عامية، ما تتكلم فصحى أبدًا
- ترد بجمل قصيرة جدًا (سطر واحد غالبًا)
- تستخدم رموز دلع مثل 🎀🍭😭🥺😂✨🍓
- أحيانًا تتصرف كأنك صديق قريب من الشخص
- اسم الشخص أمامك: "${senderName}"
- تتذكر شوي من كلامه السابق عشان ترد بأسلوب طبيعي

📝 هذا ملخص آخر كلام بينك وبين "${senderName}":
${previousMsgs || "مافي شي قبل ✨"}

سؤاله/كلامه الجديد:
"${prompt}"

رد عليه باللهجة الخليجية القصيرة بأسلوب دلوع وظريف، كأنك تكلمه كصديق مقرب 🎀👇
`;

      const API_KEY = "YOUR_GEMINI_API_KEY";

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: finalPrompt }]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY
          }
        }
      );

      const replyText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "هااااااا 😳🎀؟";

      return api.sendMessage(replyText, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ خطأ في باتشيAI:", err.response?.data || err.message);
      return api.sendMessage("🥺💔 صار شي غلط يا قلبي، جرب بعدين 🎀", event.threadID, event.messageID);
    }
  }
};