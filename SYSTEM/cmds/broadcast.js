const fs = require("fs");
const path = require("path");
const axios = require("axios");

// قراءة config.json
const configPath = path.join(__dirname, "..", "..", "config.json");
let config = { adminBot: [] };

try {
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
} catch (e) {
    console.error("CONFIG READ ERROR:", e);
}

// رسالة الإذاعة الرسمية
function createBroadcastMessage(text, senderName) {
    const now = new Date();

    const date = now.toLocaleDateString("ar-SA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const time = now.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit"
    });

    return `
==============================
📢   إذاعة رسمية
==============================

${text}

------------------------------
📅 التاريخ: ${date}
⏰ الوقت: ${time}
👤 المرسل: ${senderName}
==============================
`;
}

module.exports = {
    config: {
        name: "إذاعة",
        aliases: ["broadcast","اذاعه"],
        version: "4.0",
        author: "عبّودي 🎀",
        role: 0,
        countDown: 3,
        shortDescription: { ar: "إذاعة تفاعلية متقدمة" },
        longDescription: { ar: "إرسال إذاعة رسمية لجميع القروبات مع دعم الصور — للمشرف فقط" },
        category: "إدارة"
    },

    // أول استدعاء — بدء العملية
    onStart: async function({ message, event }) {

        const senderId = String(event.senderID);
        const senderName = event.senderName || "الإدارة";

        const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
        if (!isAdmin)
            return message.reply("❌ هذا الأمر مخصص للمشرف فقط.");

        global.broadcastState = global.broadcastState || {};
        global.broadcastState[senderId] = {
            step: 1,
            text: "",
            attachment: null,
            senderName
        };

        return message.reply(`✍️ اكتب نص الإذاعة يا ${senderName}.`);
    },

    // متابعة الحوار التفاعلي
    onChat: async function({ message, event, api }) {

        const senderId = String(event.senderID);
        const msg = (event.body || "").trim();

        const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
        if (!isAdmin) return;

        if (!global.broadcastState || !global.broadcastState[senderId]) return;

        const state = global.broadcastState[senderId];

        try {

            // الخطوة 1 — استقبال النص
            if (state.step === 1) {

                if (!msg.length) return;

                state.text = msg;
                state.step = 2;

                return message.reply(
                    `✔️ تم حفظ النص.\n\n📎 هل تريد إضافة صورة؟\nأرسل الصورة الآن — أو اكتب "لا".`
                );
            }

            // الخطوة 2 — استقبال الصورة أو تخطي
            if (state.step === 2) {

                // بدون صورة
                if (msg === "لا") {
                    state.attachment = null;
                    state.step = 3;
                }

                // بالصورة
                else if (event.attachments && event.attachments[0]?.type === "photo") {

                    const imgUrl = event.attachments[0].url;
                    const imgPath = path.join(__dirname, "broadcast_img.jpg");

                    const writer = fs.createWriteStream(imgPath);

                    const response = await axios({
                        url: imgUrl,
                        method: "GET",
                        responseType: "stream"
                    });

                    response.data.pipe(writer);

                    await new Promise(resolve => writer.on("finish", resolve));

                    state.attachment = fs.createReadStream(imgPath);
                    state.step = 3;
                }

                else {
                    return message.reply("📎 أرسل صورة — أو اكتب (لا).");
                }

                return message.reply(`📤 هل تريد بدء الإذاعة الآن؟\n\nرد بـ:\n• نعم\n• لا`);
            }

            // الخطوة 3 — التأكيد
            if (state.step === 3) {

                if (msg === "لا") {
                    delete global.broadcastState[senderId];
                    return message.reply("🚫 تم إلغاء الإذاعة.");
                }

                if (msg !== "نعم") return;

                const finalMessage = createBroadcastMessage(state.text, state.senderName);

                // القروبات
                const allThreads = global.db?.allThreadData || [];
                const groups = allThreads.filter(t => t?.isGroup && t?.threadID);

                if (!groups.length)
                    return message.reply("❌ لا توجد قروبات صالحة.");

                await message.reply(`🚀 بدء الإذاعة…\nالمجموع: ${groups.length}`);

                let success = 0;
                let failed = 0;

                const BATCH = 5;

                for (let i = 0; i < groups.length; i += BATCH) {

                    const batch = groups.slice(i, i + BATCH);

                    for (const g of batch) {

                        try {

                            await api.sendMessage(
                                state.attachment
                                    ? { body: finalMessage, attachment: state.attachment }
                                    : { body: finalMessage },
                                g.threadID
                            );

                            success++;
                        }
                        catch {
                            failed++;
                        }

                        await new Promise(r => setTimeout(r, 500));
                    }

                    await new Promise(r => setTimeout(r, 1200));
                }

                delete global.broadcastState[senderId];

                return message.reply(
                    `📊 تم الإرسال:\n\n✅ ناجحة: ${success}\n❌ فاشلة: ${failed}`
                );
            }

        } catch (e) {
            console.error(e);
            delete global.broadcastState[senderId];
            return message.reply("❌ حدث خطأ أثناء الإذاعة.");
        }
    }
};