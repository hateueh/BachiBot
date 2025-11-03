module.exports = {
  config: {
    name: "بيت",
    aliases: ["/بيت"],
    version: "1.0",
    author: "باتشيرا الانا + عبودي المخادع 😈🎀",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "مقلب استخراج معلومات الضحية 😂☠️" },
    longDescription: { ar: "أمر خداعي يرسل معلومات وهمية عن الشخص كأنها حقيقية 🤖😈🎀" },
    category: "ترفيه",
    guide: { ar: "/بيت" }
  },

  onStart: async function ({ api, event }) {
    try {
      // 🧠 إرسال رسالة أولى
      const initialMessage = await api.sendMessage(
        "⏳ جاري استخراج معلومات الضحية... 🤖☠️🎀",
        event.threadID
      );

      // ⏰ بعد 5 ثواني يحذف الرسالة ويرسل الرد المخيف 😈
      setTimeout(async () => {
        api.unsendMessage(initialMessage.messageID);

        // 🇩🇿🇲🇦 اختيار الدولة العشوائية (وزن أعلى للمغرب والجزائر)
        const countries = [
          { name: "المغرب 🇲🇦", weight: 4 },
          { name: "الجزائر 🇩🇿", weight: 4 },
          { name: "مصر 🇪🇬", weight: 2 },
          { name: "السعودية 🇸🇦", weight: 1 },
          { name: "اليمن 🇾🇪", weight: 1 },
          { name: "الأردن 🇯🇴", weight: 1 },
          { name: "الإمارات 🇦🇪", weight: 1 },
          { name: "العراق 🇮🇶", weight: 1 },
          { name: "تونس 🇹🇳", weight: 2 }
        ];

        // اختيار دولة عشوائية بناءً على الوزن
        const totalWeight = countries.reduce((sum, c) => sum + c.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedCountry;
        for (const c of countries) {
          if (random < c.weight) {
            selectedCountry = c.name;
            break;
          }
          random -= c.weight;
        }

        // 🧠 توليد IP وهمي
        const fakeIP = `${Math.floor(Math.random() * 256)}.${Math.floor(
          Math.random() * 256
        )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

        // 📍 GPS وهمي
        const fakeLat = (Math.random() * 180 - 90).toFixed(5);
        const fakeLng = (Math.random() * 360 - 180).toFixed(5);

        // 🧑‍💻 اسم حساب وهمي
        const fakeName = `user_${Math.random().toString(36).substring(2, 8)}`;

        // 🌐 مزود خدمة وهمي
        const providers = ["StarNet", "ArabTelecom", "MaghrebNet", "Falcon ISP", "UltraLine"];
        const fakeProvider = providers[Math.floor(Math.random() * providers.length)];

        // 📝 رسالة الرد الوهمية
        const finalMessage = `
📡 تم الاستخراج بنجاح ✅😈
━━━━━━━━━━━━━━━━━━━
👤 الاسم: ${fakeName}  
🌍 الدولة: ${selectedCountry}  
💻 عنوان IP: ${fakeIP}  
📍 إحداثيات GPS: ${fakeLat}, ${fakeLng}  
🌐 مزود الخدمة: ${fakeProvider}  
📅 آخر تواجد: ${new Date().toLocaleString("ar-EG")}  
━━━━━━━━━━━━━━━━━━━
⚠️ تم إرسال البيانات إلى السرفرات المركزية 🤖☠️
`;

        api.sendMessage(finalMessage, event.threadID);
      }, 5000);

    } catch (error) {
      console.error("خطأ في أمر /بيت:", error);
      api.sendMessage("⚠️ صار خطأ يا قلبي 😭🎀", event.threadID);
    }
  }
};