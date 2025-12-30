const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "..", "config.json");
let config = { adminBot: [] };

try {
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
} catch (err) {
    console.error("خطأ في قراءة config.json:", err);
}
//ver2
module.exports = {
    config: {
        name: "إذاعة",
        aliases: ["broadcast", "اذاعه"],
        version: "1.2",
        author: "عبّودي 🎀",
        countDown: 5,
        role: 0,
        shortDescription: { ar: "إرسال رسالة إلى كل القروبات" },
        longDescription: { ar: "هذا الأمر مخصص للمشرف فقط لإرسال إذاعة عامة" },
        category: "إدارة",
        guide: { ar: "{pn} رسالتك" }
    },

    onStart: async function({ message, event, args, api }) {
        try {
            const senderId = String(event.senderID);
            const senderName = event.senderName || "المشرف";

            // 🔐 السماح فقط للمشرف
            const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
            if (!isAdmin) {
                return message.reply("❌ هذا الأمر مخصص للمشرف فقط 🛡️");
            }

            // 📝 نص الرسالة
            const content = args.join(" ").trim();
            if (!content)
                return message.reply("⚠️ استخدم:\nإذاعة + الرسالة");

            // ⏰ التاريخ
            const now = new Date();
            const dateStr = now.toLocaleString("ar-EG", { hour12: true });

            const finalMsg =
`----إذاعة----
${content}

${dateStr}
${senderName}`;

            // 🗂 جميع القروبات من قاعدة البيانات
            const allThreads = global.db.allThreadData || [];

            const groupThreads = allThreads.filter(t => t?.isGroup && t?.threadID);

            let sent = 0;

            for (const t of groupThreads) {
                try {
                    await api.sendMessage(finalMsg, t.threadID);
                    sent++;
                } catch {}
            }

            return message.reply(`✅ تمت الإذاعة إلى ${sent} مجموعة 🎀`);

        } catch (e) {
            console.error(e);
            return message.reply("❌ حدث خطأ أثناء الإذاعة 😭");
        }
    }
};