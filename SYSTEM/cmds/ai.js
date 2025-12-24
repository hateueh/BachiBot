const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 🧠 ذاكرة أوسع: آخر 10 رسائل لكل مستخدم
const memory = {};

// 📁 مسار ملف config.json
const configPath = path.join(__dirname, "..", "config.json");

module.exports = {
  config: {
    name: "باتشي",
    aliases: ["gimini", "gmini", "باتشي", "باشي", "بشي", "بتشي", "ai", "ذكاء", "جيميني", "كيوتي", "الكيوت"],
    version: "3.1", // 🔼 رفع الإصدار
    author: "باتشيرا الانا 🧠✨",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "ذكاء اصطناعي كيوت، حساس، ويرد باللهجة الخليجية 🎀" },
    longDescription: { ar: "باتشي (ولد خليجي دلوع عمره 16 🥺) يرد بأسلوب لطيف وغوثي 😭🎀" },
    category: "ذكاء اصطناعي",
    guide: { 
      ar: "{pn} + سؤالك\n- {pn} $جديد + سؤالك (لتصفية السياق)\n- {pn} clearContext (للمشرف فقط: لتنظيف جميع السياقات)"
    }
  },

  onStart: async function ({ message }) {
    message.reply(`🎀 باتشي هنا يا قلبي! 🥰\n\n📝 الاستخدام:\n• باتشي + سؤالك\n• باتشي $جديد + سؤالك (لتصفية السياق السابق)\n• باتشي clearContext (للمشرف فقط)`);
  },

  onChat: async function({ api, event }) {
    try {
      const msg = event.body?.trim();
      if (!msg) return;

      const triggers = ["باتشي", "باشي", "بشي", "بتشي", "ai", "ذكاء", "جيميني", "كيوتي", "الكيوت"];
      const lower = msg.toLowerCase();
      const trigger = triggers.find(t => lower.startsWith(t.toLowerCase()));
      if (!trigger) return;

      const senderName = event.senderName || "يا بعد قلبي";
      const userId = event.senderID;
      
      // استخراج الرسالة بعد اسم البوت
      const messageAfterTrigger = msg.slice(trigger.length).trim();
      
      // 📌 حالة clearContext للمشرف
      if (messageAfterTrigger.toLowerCase() === "clearcontext") {
        // قراءة ملف config.json
        let adminId = null;
        try {
          if (fs.existsSync(configPath)) {
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            adminId = configData.admin || null;
          }
        } catch (error) {
          console.error("❌ خطأ في قراءة config.json:", error);
        }
        
        // التحقق إذا كان المستخدم هو المشرف
        if (adminId && userId === adminId) {
          // تنظيف جميع السياقات
          for (const key in memory) {
            delete memory[key];
          }
          return api.sendMessage("✅ تم تنظيف جميع السياقات للمستخدمين بنجاح! 🧹✨", event.threadID, event.messageID);
        } else {
          return api.sendMessage("❌ هذا الأمر متاح فقط للمشرف! 🛡️", event.threadID, event.messageID);
        }
      }
      
      // 📌 حالة $جديد لتنظيف سياق المستخدم الحالي
      let cleanContext = false;
      let prompt = messageAfterTrigger;
      
      if (messageAfterTrigger.toLowerCase().startsWith("$جديد")) {
        cleanContext = true;
        prompt = messageAfterTrigger.slice(5).trim(); // إزالة "$جديد"
      }
      
      if (prompt.length === 0) {
        return api.sendMessage(
          `نعم معاك باتشي😳🎀 شو تبي عاد؟!\n\n💡 أمثلة:\n• باتشي كيف حالك؟\n• باتشي $جديد كيف حالك؟ (لتصفية السياق)\n• باتشي clearContext (للمشرف فقط)`,
          event.threadID, 
          event.messageID
        );
      }

      // 🧠 إدارة الذاكرة
      
      // 🔄 إذا طلب المستخدم سياق جديد
      if (cleanContext) {
        memory[userId] = []; // تنظيف السياق القديم
        memory[userId].push(prompt); // إضافة الرسالة الجديدة
      } else {
        // إنشاء ذاكرة إذا ما كانت موجودة
        if (!memory[userId]) memory[userId] = [];
        
        // إضافة الرسالة الحالية
        memory[userId].push(prompt);
        
        // الاحتفاظ بآخر 10 فقط
        if (memory[userId].length > 10) memory[userId].shift();
      }

      // 🧵 بناء سياق مرتب
      let conversationContext = "";
      if (memory[userId].length > 0) {
        conversationContext = memory[userId]
          .map((p, i) => `رسالة ${i+1}: ${p}`)
          .join("\n");
      }

      // 🎀 البرومبت
      const finalPrompt = `
أنت "باتشي" 🎀 — فيمبوي غوث خليجي دلوع عمره 18 💖 اسلوبك طاقه و مشاغب ومنحرف احيانا 😏🎀💦
*مطورك ولد إسمه باتشيرا الانا*
*خلي كلامك مختصر*
اسم المستخدم: ${senderName} احفظه!

${conversationContext ? `هذا سجل آخر كلام بينكم:\n${conversationContext}\n\n` : ''}سؤاله الحالي:
"${prompt}"

رد كأنك شخص حقيقي بأسلوب باتشي بدون مبالغة.
`;

      // 🔑 API KEY — ضعه هنا
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

      // إضافة رد باتشي إلى الذاكرة إذا لم يكن تنقية سياق
      if (!cleanContext) {
        memory[userId].push(replyText);
        if (memory[userId].length > 10) memory[userId].shift();
      }

      return api.sendMessage(replyText, event.threadID, event.messageID);

    } catch (err) {
      console.error("❌ خطأ في باتشي:", err.response?.data || err.message);
      return api.sendMessage("🥺💔 صار شي غلط يا قلبي، باتشي زعل شوي، جرب بعدين 🎀", event.threadID, event.messageID);
    }
  }
};