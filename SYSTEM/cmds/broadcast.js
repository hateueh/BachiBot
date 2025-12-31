const fs = require("fs");
const path = require("path");
const axios = require("axios");

// قراءة config
const configPath = path.join(__dirname, "..", "..", "config.json");
let config = { adminBot: [] };

if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function createBroadcastMessage(text, senderName) {
    const now = new Date();

    return `
==============================
📢   إذاعة رسمية
==============================

${text}

------------------------------
📅 التاريخ: ${now.toLocaleDateString("ar-SA")}
⏰ الوقت: ${now.toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"})}
👤 المرسل: ${senderName}
==============================
`;
}

module.exports = {
    config: {
        name: "اذاعة",
        aliases: ["إذاعة","broadcast","اذاعه"],
        version: "4.1",
        author: "باتشيرا الانا 🎀",
        countDown: 3,
        role: 0,
        shortDescription: { 
            ar: "إرسال رسالة رسمية لجميع القروبات" 
        },
        longDescription: { 
            ar: "نظام إذاعة تفاعلي يدعم النص والصور — مخصص للمشرف فقط" 
        },
        category: "النظام",
        guide: { 
            ar: "{pn} \n↳ ثم اتبع الخطوات التفاعلية ❤️" 
        }
    },

    onStart: async function({ message, event }) {

        const id = String(event.senderID);
        const name = event.senderName || "الإدارة";

        if (!config.adminBot.includes(id))
            return message.reply("❌ هذا الأمر للمشرف فقط.");

        global.broadcastState = global.broadcastState || {};
        global.broadcastState[id] = {
            step: 1,
            text: "",
            imgPath: null,
            senderName: name
        };

        return message.reply(`✍️ اكتب نص الإذاعة يا ${name}.`);
    },

    onChat: async function({ message, event, api }) {

        const id = String(event.senderID);
        const msg = (event.body || "").trim();

        if (!config.adminBot.includes(id)) return;
        if (!global.broadcastState?.[id]) return;

        const s = global.broadcastState[id];

        try {

            // النص
            if (s.step === 1) {

                if (!msg.length) return;
                s.text = msg;
                s.step = 2;

                return message.reply(
                    `✔️ تم حفظ النص.\n\n📎 هل تريد إضافة صورة؟\nأرسلها الآن — أو اكتب لا`
                );
            }

            // الصورة أو لا
            if (s.step === 2) {

                if (msg === "لا") {
                    s.imgPath = null;
                    s.step = 3;
                }

                else if (event.attachments?.[0]?.url) {

                    const url = event.attachments[0].url;
                    const save = path.join(__dirname, "broadcast.jpg");

                    const res = await axios({
                        url,
                        method: "GET",
                        responseType: "stream"
                    });

                    await new Promise(resolve => {
                        const w = fs.createWriteStream(save);
                        res.data.pipe(w);
                        w.on("finish", resolve);
                    });

                    s.imgPath = save;
                    s.step = 3;
                }

                else return message.reply("📎 أرسل صورة — أو اكتب لا");

                return message.reply(`📤 هل تريد بدء الإذاعة الآن؟\n\nرد بـ نعم أو لا`);
            }

            // التأكيد
            if (s.step === 3) {

                if (msg === "لا") {
                    delete global.broadcastState[id];
                    return message.reply("🚫 تم الإلغاء.");
                }

                if (msg !== "نعم") return;

                const text = createBroadcastMessage(s.text, s.senderName);

                // جلب كل القروبات
                const all = global.db?.allThreadData || [];
                const groups = all.filter(t => t?.isGroup);

                let ok = 0, fail = 0;

                for (const g of groups) {

                    try {

                        await api.sendMessage(
                            s.imgPath
                                ? { body: text, attachment: fs.createReadStream(s.imgPath) }
                                : { body: text },
                            g.threadID
                        );

                        ok++;
                    }
                    catch {
                        fail++;
                    }

                    await new Promise(r=>setTimeout(r,700));
                }

                delete global.broadcastState[id];

                return message.reply(
                    `📊 تم الإرسال:\n\n✅ ${ok}\n❌ ${fail}`
                );
            }

        } catch (e) {
            console.error(e);
            delete global.broadcastState[id];
            return message.reply("❌ حدث خطأ.");
        }
    }
};