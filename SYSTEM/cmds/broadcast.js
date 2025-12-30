const fs = require("fs");
const path = require("path");

// قراءة config.json
const configPath = path.join(__dirname, "..", "..", "config.json");
let config = { adminBot: [] };

try {
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
} catch (err) {
    console.error("❌ خطأ في قراءة config.json:", err);
}

// ملف سجل الإذاعات
const broadcastLogPath = path.join(__dirname, "..", "..", "broadcast_log.json");

// تسجيل الإذاعات
function logBroadcast(data) {
    try {
        let logs = [];
        if (fs.existsSync(broadcastLogPath)) {
            logs = JSON.parse(fs.readFileSync(broadcastLogPath, "utf8"));
        }

        logs.unshift({
            ...data,
            timestamp: new Date().toISOString()
        });

        if (logs.length > 50) logs = logs.slice(0, 50);

        fs.writeFileSync(broadcastLogPath, JSON.stringify(logs, null, 2));
    } catch (err) {
        console.error("❌ خطأ في تسجيل الإذاعة:", err);
    }
}

// تنسيق الرسالة المزخرفة
function createBroadcastMessage(text, senderName) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
╔═══════════════════════════╗
       📢 [ اذاعة رسمية ]
╚═══════════════════════════╝

${text}

╔═══════════════════════════╗
📅 التاريخ: ${dateStr}
⏰ الوقت: ${timeStr}
👤 المرسل: ${senderName || "الإدارة"}
╚═══════════════════════════╝

✨ من: باتشي 💞
`;
}

module.exports = {
    config: {
        name: "إذاعة",
        aliases: ["broadcast", "اذاعه"],
        version: "2.2",
        author: "عبّودي 🎀",
        countDown: 5,
        role: 0,
        shortDescription: { ar: "إذاعة متقدمة مع تتبع وصور" },
        longDescription: { ar: "إرسال رسالة مزخرفة مع دعم الصور وتتبع متكامل للمشرف فقط" },
        category: "إدارة",
        guide: { ar: "{pn} رسالتك أو قم برد صورة + رسالة" }
    },

    onStart: async function({ message, event, args, api }) {
        try {
            const senderId = String(event.senderID);
            const senderName = event.senderName || "المشرف";

            // التحقق إدمن
            const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
            if (!isAdmin) return message.reply("❌ هذا الأمر مخصص للمشرف فقط 🛡️");

            // نص الرسالة
            const content = args.join(" ").trim();
            if (!content) return message.reply("⚠️ استخدم:\nإذاعة + نص الرسالة");

            // تجهيز الرسالة
            const broadcastText = createBroadcastMessage(content, senderName);

            // إن كان هناك صورة مرفقة
            let attachment = null;

            if (event.attachments && event.attachments.length > 0 && event.attachments[0].type === "photo") {
                attachment = event.attachments[0].url;
            }

            // جلب القروبات من قاعدة البيانات
            const allThreads = global.db?.allThreadData || [];
            const validThreads = allThreads.filter(t => t?.isGroup && t?.threadID);

            if (validThreads.length === 0)
                return message.reply("❌ لم يتم العثور على أي قروبات صالحة 😢");

            await message.reply(`🚀 بدء الإذاعة الرسمية…\n\n📊 عدد القروبات: ${validThreads.length}\n📎 صورة: ${attachment ? "نعم" : "لا"}`);

            // إرسال بدُفعات
            const BATCH_SIZE = 5;
            let success = 0;
            let failed = 0;

            for (let i = 0; i < validThreads.length; i += BATCH_SIZE) {
                const batch = validThreads.slice(i, i + BATCH_SIZE);

                for (const g of batch) {
                    try {
                        await api.sendMessage(
                            attachment
                                ? { body: broadcastText, attachment }
                                : { body: broadcastText },
                            g.threadID
                        );
                        success++;
                    } catch (e) {
                        failed++;
                    }

                    await new Promise(r => setTimeout(r, 500));
                }

                await new Promise(r => setTimeout(r, 1500));
            }

            // تسجيل العملية
            logBroadcast({
                senderId,
                senderName,
                message: content,
                image: !!attachment,
                total: validThreads.length,
                success,
                failed
            });

            return message.reply(
                `🎀 الإذاعة اكتملت:\n\n✅ ناجحة: ${success}\n❌ فاشلة: ${failed}\n📁 تم حفظ السجل`
            );

        } catch (e) {
            console.error(e);
            return message.reply("❌ حدث خطأ أثناء الإذاعة 😭");
        }
    }
};