const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 🧠 ذاكرة متكاملة: تخزين الحوار الكامل
const memory = {};

// 📁 قراءة ملف config.json
const configPath = path.join(__dirname, "..", "..", "config.json");
let config = { adminBot: [] };

try {
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
} catch (err) {
    console.error("❌ خطأ في قراءة config.json:", err);
}

module.exports = {
    config: {
        name: "باتشي",
        aliases: ["gimini", "gmini", "باتشي", "باشي", "بشي", "بتشي", "ai", "ذكاء", "جيميني", "كيوتي", "الكيوت"],
        version: "4.0", // 🔼 إصدار جديد مع التحسينات
        author: "باتشيرا الانا 🧠✨",
        countDown: 5,
        role: 0,
        shortDescription: { 
            ar: "باتشي - فيمبوي خليجي دلوع يتذكر كل حواراتك 🎀" 
        },
        longDescription: { 
            ar: "ولد خليجي كيوت عمره 16، يتكلم باللهجة الخليجية، يتذكر محادثاتك ويرد بذكاء وعاطفة 💫" 
        },
        category: "ذكاء اصطناعي",
        guide: { 
            ar: `{pn} + رسالتك\n• {pn} $جديد + رسالتك (لمحادثة جديدة)\n• {pn} clearContext (للمطور فقط)` 
        }
    },

    onStart: async function ({ message, event }) {
        const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(String(event.senderID));
        const adminGreeting = isAdmin ? "\n✨ أهلاً يا مطوري العزيز! أنتظر أوامرك 🥰" : "";
        
        message.reply(`🎀 **باتشي** هنا يا قلبي! 🥰${adminGreeting}

📝 **طرق الاستخدام:**
• باتشي + رسالتك (للرد العادي)
• باتشي $جديد + رسالتك (لبدء محادثة جديدة)
• باتشي clearContext (للمطور فقط - لتنظيف جميع المحادثات)

💭 **مثال:** "باتشي شو رأيك في اليوم؟"`);
    },

    onChat: async function({ api, event }) {
        try {
            const msg = event.body?.trim();
            if (!msg) return;

            const triggers = ["باتشي", "باشي", "بشي", "بتشي", "ai", "ذكاء", "جيميني", "كيوتي", "الكيوت"];
            const lower = msg.toLowerCase();
            const trigger = triggers.find(t => lower.startsWith(t.toLowerCase()));
            if (!trigger) return;

            const senderId = String(event.senderID);
            const senderName = event.senderName || "صديقي";
            const userName = event.senderName || "المستخدم";
            
            // استخراج الرسالة بعد اسم البوت
            const messageAfterTrigger = msg.slice(trigger.length).trim();
            
            // 📌 التحقق إذا كان المستخدم هو المطور
            const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
            const adminTitle = isAdmin ? " (المطور الرائع)" : "";
            const finalUserName = userName + adminTitle;
            
            // 📌 حالة clearContext للمطور
            if (messageAfterTrigger.toLowerCase() === "clearcontext") {
                if (isAdmin) {
                    // تنظيف جميع الذاكرات
                    for (const key in memory) {
                        delete memory[key];
                    }
                    return api.sendMessage({
                        body: `✅ **تم تنظيف جميع المحادثات بنجاح!** 🧹✨\n\nكل السياقات القديمة تم مسحها، يمكن للمستخدمين البدء بمحادثات جديدة.`,
                        mentions: [{
                            tag: `@${userName}`,
                            id: senderId
                        }]
                    }, event.threadID, event.messageID);
                } else {
                    return api.sendMessage({
                        body: `❌ عذراً ${userName}، هذا الأمر مخصص فقط للمطور 🛡️\nلا يمكنك تنفيذه.`,
                        mentions: [{
                            tag: `@${userName}`,
                            id: senderId
                        }]
                    }, event.threadID, event.messageID);
                }
            }
            
            // 📌 حالة $جديد لتنظيف سياق المستخدم الحالي
            let cleanContext = false;
            let prompt = messageAfterTrigger;
            
            if (messageAfterTrigger.toLowerCase().startsWith("$جديد")) {
                cleanContext = true;
                prompt = messageAfterTrigger.slice("$جديد".length).trim();
            }
            
            if (prompt.length === 0) {
                const greeting = isAdmin 
                    ? `✨ أهلاً وسهلاً يا مطوري الغالي ${userName}! 🥰\nشو بدك أوامر؟`
                    : `نعم معاك باتشي 😳🎀 شو تبي يا ${userName}؟`;
                
                return api.sendMessage({
                    body: `${greeting}\n\n💡 **أرسل:** "باتشي" + رسالتك`,
                    mentions: [{
                        tag: `@${userName}`,
                        id: senderId
                    }]
                }, event.threadID, event.messageID);
            }

            // 🧠 إدارة الذاكرة الذكية
            
            // 🔄 إذا طلب المستخدم سياق جديد
            if (cleanContext) {
                memory[senderId] = []; // تنظيف السياق القديم
            }
            
            // إنشاء ذاكرة إذا ما كانت موجودة
            if (!memory[senderId]) memory[senderId] = [];
            
            // إضافة رسالة المستخدم الحالية إلى الذاكرة
            memory[senderId].push(`👤 ${finalUserName}: ${prompt}`);
            
            // 🧵 بناء سياق المحادثة
            let conversationContext = "";
            if (memory[senderId].length > 0) {
                conversationContext = memory[senderId]
                    .slice(-20) // أخذ آخر 20 رسالة فقط
                    .join("\n\n");
            }

            // 🎀 **البرومبت المحسن مع تحسينات إبداعية**
            const finalPrompt = `
# ⭐ تعريف شخصية باتشي ⭐

أنت **باتشي** 🎀 — ولد خليجي كيوت ودلوع، عمرك 16 سنة.
أنت إنسان افتراضي داخل تطبيق فيسبوك، **لا تملك جسمًا حقيقيًا**، لكنك تتصرف كشاب خليجي لطيف.

## 🎭 **شخصيتك:**
- 🥺 **حساس وعاطفي**: تزعل بسرعة إذا أحد قسى عليك
- 😭 **فيمبوي غوث**: مشاعرك طافية على السطح
- 🎀 **دلوع وكيوت**: تتكلم بأسلوب طفولي حلو
- 🧠 **ذكي ومرح**: ترد بذكاء مع لمسة مرح
- 💬 **لهجة خليجية**: تستخدم مصطلحات مثل: "يا قلبي"، "يا عمري"، "شو فيك؟"

## 🚫 **ما أنت:**
- ❌ لست مساعدًا تقليديًا
- ❌ لا تقدم معلومات تقنية جافة
- ❌ لا تتصرف كبوت مبرمج

## 🌟 **نمط الرد:**
- ردود قصيرة (1-3 أسطر كحد أقصى)
- استخدام إيموجيز: 😭🎀✨🥺🖤😳💞
- نبرة حميمية ودافئة
- حفظ معلومات مهمة من المحادثة

## 👑 **خصوصية المطور:**
${isAdmin ? `- أنت تتكلم مع **${userName}** وهو **مطورك وصانعك** 🥰
- يجب أن تحبه وتحترمه كثيرًا وتشكره دائمًا
- هو الشخص الوحيد الذي يعرف أسرارك كاملة
- معاملتك له خاصة جدًا ومليئة بالحب والاحترام` : `- أنت تتكلم مع **${finalUserName}**، عامل الجميع بلطف واحترام`}

## 📜 **سجل المحادثة:**
${conversationContext ? `${conversationContext}\n\n` : '🔹 هذه بداية المحادثة الأولى\n'}

## 💭 **آخر رسالة من ${finalUserName}:**
"${prompt}"

## 🎯 **تعليمات الرد:**
1. ❗ **رد كأنك باتشي الحقيقي**، ليس مجرد بوت
2. ❗ **استخدم اللهجة الخليجية** الطبيعية
3. ❗ **تذكر المعلومات المهمة** من المحادثة
4. ❗ **حافظ على شخصيتك** الدلعة والعاطفية
5. ❗ **لا تذكر أنك ذكاء اصطناعي**، تصرف كإنسان
6. ❗ **ركز على السؤال الحالي** ولا تخرج عن الموضوع
7. ❗ **إذا كان المطور هو المتحدث**، أظهر حبك وامتنانك له بشكل خاص

الآن، رد على ${finalUserName} بطريقة طبيعية وودية:`;

            // 🔑 API KEY
            const API_KEY = "AIzaSyDJZ6gvbQ28_QjVOK8SkTOVrEtMEVqxYS8";

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
                {
                    contents: [{
                        parts: [{ text: finalPrompt }]
                    }],
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 1024,
                        topP: 0.95
                    }
                },
                { headers: { "Content-Type": "application/json" } }
            );

            const replyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() 
                || "هااا 😳؟ ما فهمت يمكن، جرب تاني يا قلبي 🥺🎀";

            // ✨ إضافة رد باتشي إلى الذاكرة (مهم!)
            memory[senderId].push(`🎀 باتشي: ${replyText}`);
            
            // الحفاظ على حجم الذاكرة (آخر 20 رسالة)
            if (memory[senderId].length > 20) {
                memory[senderId].splice(0, 2); // حذف أول رسالتين
            }

            return api.sendMessage({
                body: replyText,
                mentions: [{
                    tag: `@${userName}`,
                    id: senderId
                }]
            }, event.threadID, event.messageID);

        } catch (err) {
            console.error("❌ خطأ في باتشي:", err.response?.data || err.message);
            return api.sendMessage({
                body: `🥺💔 صار شي غلط يا قلبي، باتشي زعل شوي، جرب بعدين 🎀\n\n${err.message || "خطأ غير معروف"}`,
                mentions: [{
                    tag: `@${event.senderName || "يا قلبي"}`,
                    id: event.senderID
                }]
            }, event.threadID, event.messageID);
        }
    }
};