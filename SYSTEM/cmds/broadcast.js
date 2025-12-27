const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 📁 قراءة ملف config.json
const configPath = path.join(__dirname, "..", "..", "config.json");
let config = { adminBot: [], broadcastPassword: "باتشي123" };

try {
    if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
        config = { ...config, ...configData };
    }
} catch (err) {
    console.error("❌ خطأ في قراءة config.json:", err);
}

// 🗂️ ملف لتسجيل الإذاعات
const broadcastLogPath = path.join(__dirname, "..", "..", "broadcast_log.json");

// 📝 دالة لتسجيل الإذاعات
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

module.exports = {
    config: {
        name: "اذاعة",
        aliases: ["broadcast", "نشر", "إذاعة"],
        version: "2.0",
        author: "باتشيرا الانا 🎀",
        countDown: 0,
        role: 0,
        shortDescription: { 
            ar: "إرسال رسالة لجميع القروبات (للمطور فقط) 📢" 
        },
        longDescription: { 
            ar: "أمر متطور لإرسال رسائل مزخرفة لجميع القروبات التي يوجد بها البوت مع إمكانية إرفاق صور وتأخير ذكي بين الرسائل" 
        },
        category: "النظام",
        guide: { 
            ar: "اذاعة [كلمة_السر]\nثم اتبع الخطوات التفاعلية" 
        }
    },

    onStart: async function ({ api, event, message, args }) {
        const senderId = String(event.senderID);
        const threadID = event.threadID;
        
        // التحقق من هوية المطور
        const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
        
        if (!isAdmin) {
            return message.reply("❌ هذا الأمر مخصص فقط للمطور الرئيسي! 🛡️");
        }

        // التحقق من كلمة السر
        const password = config.broadcastPassword || "باتشي123";
        
        if (args.length === 0 || args[0] !== password) {
            return message.reply(`🔐 يرجى استخدام كلمة السر الصحيحة:\n\n📝 الاستخدام:\nاذاعة ${password}\n\n✨ مثال:\nاذاعة باتشي123`);
        }

        // بدء العملية التفاعلية
        const userState = {
            step: 1, // 1: انتظار النص، 2: انتظار الصورة، 3: التأكيد
            message: "",
            attachment: null,
            threadID: threadID,
            senderID: senderId,
            senderName: event.senderName || "المطور"
        };

        // حفظ حالة المستخدم
        global.broadcastState = global.broadcastState || {};
        global.broadcastState[senderId] = userState;

        return message.reply(`🎤 **مرحباً يا مطوري العزيز!** 🥰\n\n🚀 **بدء عملية الإذاعة:**\n\n✨ **الخطوة 1/3:**\nأرسل نص الرسالة التي تريد نشرها لجميع القروبات.\n\n📝 **ملاحظة:**\n• سيتم تزيين النص تلقائياً\n• يمكنك استخدام ~ للسطر الجديد\n• مثال: "مرحباً بالجميع~يومكم سعيد"`);
    },

    onChat: async function({ api, event, message }) {
        const senderId = String(event.senderID);
        
        // التحقق من هوية المطور
        const isAdmin = Array.isArray(config.adminBot) && config.adminBot.includes(senderId);
        if (!isAdmin) return;
        
        // التحقق إذا كان المستخدم في وضع الإذاعة
        if (!global.broadcastState || !global.broadcastState[senderId]) return;
        
        const userState = global.broadcastState[senderId];
        const msg = event.body?.trim() || "";
        
        try {
            switch (userState.step) {
                case 1: // انتظار نص الرسالة
                    if (msg.length === 0) return;
                    
                    userState.message = msg.replace(/~/g, '\n');
                    userState.step = 2;
                    
                    await message.reply(`✅ **تم حفظ نص الرسالة!** ✨\n\n📊 **الخطوة 2/3:**\nهل تريد إضافة صورة مع الرسالة؟\n\n📎 **خيارات:**\n1. أرسل الصورة الآن\n2. اكتب "تخطي" للاستمرار بدون صورة\n3. اكتب "إلغاء" لإلغاء العملية`);
                    
                    global.broadcastState[senderId] = userState;
                    break;
                    
                case 2: // انتظار الصورة أو تخطي
                    if (msg.toLowerCase() === "تخطي") {
                        userState.attachment = null;
                        userState.step = 3;
                    } else if (msg.toLowerCase() === "إلغاء") {
                        delete global.broadcastState[senderId];
                        return message.reply("❌ **تم إلغاء عملية الإذاعة.**");
                    } else if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
                        // إذا تم الرد على صورة
                        userState.attachment = event.messageReply.attachments[0];
                        userState.step = 3;
                    } else if (event.attachments && event.attachments.length > 0 && event.attachments[0].type === "photo") {
                        // إذا تم إرسال صورة مباشرة
                        userState.attachment = event.attachments[0];
                        userState.step = 3;
                    } else {
                        return message.reply("📎 يرجى إرسال صورة أو كتابة 'تخطي' أو 'إلغاء'");
                    }
                    
                    // عرض المعاينة
                    const preview = createBroadcastMessage(userState.message, userState.senderName);
                    
                    if (userState.attachment) {
                        // استخدم الرابط مباشرة دون تحميل
                        await message.reply({
                            body: `🖼️ **تم إضافة الصورة!** ✅\n\n📋 **معاينة الرسالة:**\n━━━━━━━━━━━━━━━━━━\n${preview}\n━━━━━━━━━━━━━━━━━━\n\n📊 **الخطوة 3/3:**\nهل تريد بدء الإرسال لجميع القروبات؟\n\n✏️ **رد بـ:**\n• "نعم" للبدء\n• "لا" للإلغاء`,
                            attachment: userState.attachment.url // استخدام الرابط مباشرة
                        });
                    } else {
                        await message.reply(`📋 **معاينة الرسالة:**\n━━━━━━━━━━━━━━━━━━\n${preview}\n━━━━━━━━━━━━━━━━━━\n\n📊 **الخطوة 3/3:**\nهل تريد بدء الإرسال لجميع القروبات؟\n\n✏️ **رد بـ:**\n• "نعم" للبدء\n• "لا" للإلغاء`);
                    }
                    
                    global.broadcastState[senderId] = userState;
                    break;
                    
                case 3: // انتظار التأكيد
                    if (msg.toLowerCase() === "نعم") {
                        // بدء عملية الإرسال
                        await startBroadcast(api, message, userState, event);
                        delete global.broadcastState[senderId];
                    } else if (msg.toLowerCase() === "لا") {
                        delete global.broadcastState[senderId];
                        await message.reply("❌ **تم إلغاء عملية الإرسال.**");
                    } else {
                        await message.reply("✏️ يرجى الرد بـ 'نعم' أو 'لا' فقط");
                    }
                    break;
            }
        } catch (err) {
            console.error("❌ خطأ في عملية الإذاعة:", err);
            delete global.broadcastState[senderId];
            await message.reply("❌ حدث خطأ غير متوقع، تم إلغاء العملية.");
        }
    }
};

// 🎨 دالة لإنشاء رسالة الإذاعة المزخرفة
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

✨ من: باتشي - ${config.author || "باتشيرا الانا 🎀"}
`;
}

// 🚀 دالة لبدء الإرسال للقروبات
async function startBroadcast(api, message, userState, event) {
    try {
        // الحصول على قائمة القروبات
        const threadList = await api.getThreadList(100, null, ['INBOX']);
        const groups = threadList.filter(t => t.isGroup && t.threadID !== userState.threadID);
        
        if (groups.length === 0) {
            return message.reply("❌ لا يوجد قروبات أخرى للإرسال!");
        }
        
        // إرسال رسالة البدء
        const startMsg = await message.reply(`🚀 **بدء عملية الإذاعة...**\n\n📊 **المعلومات:**\n• عدد القروبات: ${groups.length}\n• مع صورة: ${userState.attachment ? 'نعم' : 'لا'}\n• التأخير: 1.5 ثانية بين كل رسالة\n\n⏳ جاري البدء...`);
        
        let successCount = 0;
        let failCount = 0;
        const failedGroups = [];
        
        // إعداد الرسالة
        const broadcastText = createBroadcastMessage(userState.message, userState.senderName);
        
        // بدء الإرسال مع تأخير
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            
            try {
                // إرسال الرسالة مع أو بدون صورة
                if (userState.attachment && userState.attachment.url) {
                    await api.sendMessage({
                        body: broadcastText,
                        attachment: userState.attachment.url // استخدام الرابط مباشرة
                    }, group.threadID);
                } else {
                    await api.sendMessage({
                        body: broadcastText
                    }, group.threadID);
                }
                
                successCount++;
                
                // تحديث التقدم كل 10 قروبات
                if ((i + 1) % 10 === 0 || i === groups.length - 1) {
                    await message.reply(`📤 **جاري الإرسال...**\n\n✅ تم: ${i + 1}/${groups.length}\n❌ فشل: ${failCount}\n⏳ متبقية: ${groups.length - (i + 1)}`);
                }
                
                // تأخير ذكي بين الرسائل
                const delay = groups.length > 50 ? 2000 : 1500;
                await new Promise(resolve => setTimeout(resolve, delay));
                
            } catch (err) {
                console.error(`❌ فشل الإرسال لـ ${group.name || group.threadID}:`, err.message);
                failCount++;
                failedGroups.push({
                    name: group.name || `القروب ${group.threadID}`,
                    error: err.message || "خطأ غير معروف"
                });
                
                // تأخير أطول عند الفشل
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        // تسجيل الإذاعة
        logBroadcast({
            senderId: userState.senderID,
            senderName: userState.senderName,
            message: userState.message,
            hasAttachment: !!userState.attachment,
            totalGroups: groups.length,
            successCount,
            failCount,
            failedGroups: failedGroups.slice(0, 10) // حفظ أول 10 فقط
        });
        
        // إرسال تقرير النتائج
        let report = `✅ **اكتملت عملية الإذاعة!** 🎉\n\n`;
        report += `📊 **التقرير النهائي:**\n`;
        report += `• ✅ نجحت: ${successCount} قروب\n`;
        report += `• ❌ فشلت: ${failCount} قروب\n`;
        report += `• 📊 الإجمالي: ${groups.length} قروب\n`;
        report += `• ⏰ الوقت التقريبي: ${Math.round(groups.length * 1.5 / 60)} دقيقة\n\n`;
        
        if (failCount > 0 && failedGroups.length > 0) {
            report += `📝 **القروبات التي فشل الإرسال لها:**\n`;
            failedGroups.slice(0, 5).forEach((g, idx) => {
                report += `${idx + 1}. ${g.name}\n`;
            });
            if (failedGroups.length > 5) {
                report += `... و ${failedGroups.length - 5} أخرى\n`;
            }
        }
        
        report += `\n✨ **تم التسجيل في الأرشيف بنجاح.**`;
        
        await message.reply(report);
        
    } catch (err) {
        console.error("❌ خطأ جسيم في الإذاعة:", err);
        await message.reply(`❌ **فشلت عملية الإذاعة:**\n${err.message || "خطأ غير معروف"}`);
    }
}