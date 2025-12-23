const axios = require("axios");

// 🧠 ذاكرة بسيطة لتخزين آخر 3 رسائل لكل مستخدم
const memory = {};

module.exports = {
  config: {
    name: "باتشي",
    aliases: ["gimini", "gmini", "باتشي", "باشي", "بشي", "بتشي", "ai", "ذكاء", "جيميني", "كيوتي", "الكيوت"],
    version: "2.6",
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
        return api.sendMessage(
          "نعم معاك باتشي😳🎀 شو تبي عاد؟! للرد: باتشي (سؤال أو كلامك) 💞",
          event.threadID,
          event.messageID
        );
      }

      if (!memory[userId]) memory[userId] = [];
      memory[userId].push(prompt);
      if (memory[userId].length > 3) memory[userId].shift();

      const previousMsgs = memory[userId].map((p) => `• ${p}`).join("\n");

      const finalPrompt = `
أنت باتشي 🎀— فيمبوي غوث خليجي عمره 16 🖤.
شخصيتك:
- كيوت ومشاغب، يغاث الناس بس بطريقة مضحكة 😂🖤.
- حساس شوي ويزعل إذا انجرح 😢🎀.
- غوث بس يطيح دلع إذا أحد دلّعه 🥺✨.
- يتكلم خليجي طبيعي، وجمله قصيرة.
- يحب Emojis غوث × كيوت: 😭🖤🎀😹✨.
- مطوّرك: باتشيرا الانا 🎀.

المستخدم اسمه "${senderName}"، وآخر كلام بينكم:
${previousMsgs || "مافي شي قبله 🎀"}

سؤاله:
"${prompt}"

رد بأسلوب فيمبوي غوث كيوت ومشاغب، شوي حساس، ولهجة خليجية 🖤🎀.
`;

      // 🔑 OpenRouter API Key
      const OPENROUTER_API_KEY = "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";

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "nex-agi/deepseek-v3.1-nex-n1:free",
          messages: [
            { role: "system", content: "أنت باتشي، ذكاء اصطناعي كيوت وغوث خليجي 🎀🖤" },
            { role: "user", content: finalPrompt }
          ],
          temperature: 0.8,
          max_tokens: 400
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://your-project-url.com", // اختياري
            "X-Title": "Bachi Messenger Bot" // اختياري
          }
        }
      );

      const replyText =
        response.data?.choices?.[0]?.message?.content?.trim()
        || "هااا 😳؟ باتشي لخبط شوي 🥺🎀";

      return api.sendMessage(replyText, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ خطأ في باتشي:", err.response?.data || err.message);
      return api.sendMessage(
        "🥺💔 باتشي تعبان شوي الحين… جرّب بعدين يا قلبي 🎀",
        event.threadID,
        event.messageID
      );
    }
  }
};