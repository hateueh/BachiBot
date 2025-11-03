const axios = require("axios");

module.exports = {
    config: {
        name: "عبارة",
        aliases: ["اقتباس", "عبارة", "قول", "كلمة"],
        version: "1.0",
        author: "باتشيرا الانا & ",
        countDown: 5,
        role: 0,
        shortDescription: { ar: "جلب اقتباس عشوائي من Kalimat API" },
        longDescription: { ar: "يعرض اقتباسًا أو عبارة ملهمة من موقع Kalimat API" },
        category: "ترفيه",
        guide: { ar: "{pn}" }
    },

    langs: {
        ar: {
            fetching: "⏳ جاري جلب عبارة عشوائية...",
            error: "⚠️ حدث خطأ أثناء جلب العبارة، حاول لاحقًا 😢",
        }
    },

    onStart: async function({ api, event, getLang }) {
        const API_TOKEN = "20|Z4DU8pRTEqlWvQ1jqrFicbtSP4uQYuHyqZGmB1iSf0d9fd3c";

        const url = "https://kalimatapi.com/api/v1/quotes";
        const headers = {
            "Authorization": `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json"
        };

        try {
            // 🕐 إرسال رسالة مؤقتة للمستخدم
            const fetchingMsg = await api.sendMessage(getLang("fetching"), event.threadID);

            // 🌐 طلب API
            const response = await axios.get(url, { headers });

            if (response.status === 200) {
                const data = response.data;

                let quote;
                if (Array.isArray(data.data)) {
                    // إذا كان فيه أكثر من اقتباس، نختار واحد عشوائي
                    quote = data.data[Math.floor(Math.random() * data.data.length)];
                } else {
                    quote = data.data;
                }

                const text = quote.tashkeel_text || quote.text || "✨ لم يتم العثور على نص مناسب ✨";

                // ✨ إرسال الاقتباس للمجموعة
                await api.sendMessage(`🌿✨ اقتباس اليوم ✨🌿\n\n${text}`, event.threadID);

            } else {
                await api.sendMessage(`${getLang("error")}\nالكود: ${response.status}`, event.threadID);
            }

            // 🧼 حذف رسالة "جاري جلب..."
            api.unsendMessage(fetchingMsg.messageID);

        } catch (error) {
            console.error("Quote command error:", error);
            await api.sendMessage(getLang("error"), event.threadID, event.messageID);
        }
    }
};