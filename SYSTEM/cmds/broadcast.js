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

module.exports = {
    config: {
        name: "إذاعة",
        aliases: ["broadcast", "اذاعه"],
        version: "1.1",
        author: "عبّودي 🎀",
        countDown: 5,
        role: 0,
        shortDescription: { ar: "إرسال رسالة إذاعية لكل القروبات" },
        longDescription: { ar: "يسمح للمشرف بإرسال رسالة عامة لجميع القروبات" },
        category: "إدارة",
        guide: { ar: "{pn} رسالتك" }
    },

    onStart: async function({ message, event, args, api }) {
        try {
            const senderId = String(event.senderID);
            const senderName = event.senderName || "المشرف";

            // 🔐 تحقق المشرف
            const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
            if (!isAdmin) {
                return message.reply("❌ هذا الأمر مخصص للمشرف فقط 🛡️");
            }

            // 📝 نص الرسالة
            const content = args.join(" ").trim();
            if (!content)
                return message.reply("⚠️ استخدم:\nإذاعة + الرسالة");

            // ⏰ التاريخ العربي
            const now = new Date();
            const dateStr = now.toLocaleString("ar-EG", { hour12: true });

            const finalMsg =
`----إذاعة----
${content}

${dateStr}
${senderName}`;

            // 📬 جميع القروبات
            const threads = await api.getThreadList(100, null, ["INBOX"]);
            const groups = threads.filter(t => t.isGroup);

            let ok = 0;
            for (const g of groups) {
                try {
                    await api.sendMessage(finalMsg, g.threadID);
                    ok++;
                } catch {}
            }

            return message.reply(`✅ تم إرسال الإذاعة إلى ${ok} مجموعة 🎀`);

        } catch (e) {
            console.error(e);
            return message.reply("❌ حدث خطأ أثناء الإذاعة 😭");
        }
    }
};
