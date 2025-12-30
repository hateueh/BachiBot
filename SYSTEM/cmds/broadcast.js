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
        version: "1.0",
        author: "عبّودي",
        countDown: 5,
        role: 0,
        shortDescription: { ar: "إرسال رسالة إلى كل القروبات" },
        longDescription: { ar: "هذا الأمر يسمح للمشرف بإرسال رسالة إذاعية لكل القروبات" },
        category: "إدارة",
        guide: { ar: "{pn} رسالتك" }
    },

    onCall: async function({ api, event, args }) {
        try {
            const senderId = String(event.senderID);
            const senderName = event.senderName || "المشرف";

            // 🔐 السماح فقط للمشرف
            const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
            if (!isAdmin) {
                return api.sendMessage("❌ هذا الأمر مخصص للمشرف فقط 🛡️", event.threadID);
            }

            // 📩 نص الرسالة
            const message = args.join(" ").trim();
            if (!message) return api.sendMessage("⚠️ استخدم:\nإذاعة + الرسالة", event.threadID);

            // ⏰ التاريخ
            const now = new Date();
            const formattedDate = now.toLocaleString("ar-EG", { hour12: true });

            const finalMsg =
`----إذاعة----
${message}

${formattedDate}
${senderName}`;

            // 📜 جلب كل القروبات
            const threads = await api.getThreadList(100, null, ["INBOX"]);

            const groupThreads = threads.filter(t => t.isGroup);

            let success = 0;
            for (const thread of groupThreads) {
                try {
                    await api.sendMessage(finalMsg, thread.threadID);
                    success++;
                } catch (e) {}
            }

            return api.sendMessage(
                `✅ تم إرسال الإذاعة إلى ${success} جروب 🎀`,
                event.threadID
            );

        } catch (err) {
            console.error(err);
            return api.sendMessage("❌ حدث خطأ أثناء الإرسال 😢", event.threadID);
        }
    }
};