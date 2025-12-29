const fs = require("fs");
const path = require("path");

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
        version: "3.0",
        author: "باتشيرا الانا 🎀",
        countDown: 0,
        role: 0,
        shortDescription: { 
            ar: "إرسال رسالة لجميع القروبات (للمطور فقط) 📢" 
        },
        longDescription: { 
            ar: "أمر متطور لإرسال رسائل مزخرفة لجميع القروبات مع نظام دفعات ذكي وتأخير آمن" 
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
            step: 1,
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
                        userState.attachment = event.messageReply.attachments[0];
                        userState.step = 3;
                    } else if (event.attachments && event.attachments.length > 0 && event.attachments[0].type === "photo") {
                        userState.attachment = event.attachments[0];
                        userState.step = 3;
                    } else {
                        return message.reply("📎 يرجى إرسال صورة أو كتابة 'تخطي' أو 'إلغاء'");
                    }
                    
                    // عرض المعاينة
                    const preview = createBroadcastMessage(userState.message, userState.senderName);
                    
                    if (userState.attachment) {
                        await message.reply({
                            body: `🖼️ **تم إضافة الصورة!** ✅\n\n📋 **معاينة الرسالة:**\n━━━━━━━━━━━━━━━━━━\n${preview}\n━━━━━━━━━━━━━━━━━━\n\n📊 **الخطوة 3/3:**\nهل تريد بدء الإرسال لجميع القروبات؟\n\n✏️ **رد بـ:**\n• "نعم" للبدء\n• "لا" للإلغاء`,
                            attachment: userState.attachment.url
                        });
                    } else {
                        await message.reply(`📋 **معاينة الرسالة:**\n━━━━━━━━━━━━━━━━━━\n${preview}\n━━━━━━━━━━━━━━━━━━\n\n📊 **الخطوة 3/3:**\nهل تريد بدء الإرسال لجميع القروبات؟\n\n✏️ **رد بـ:**\n• "نعم" للبدء\n• "لا" للإلغاء`);
                    }
                    
                    global.broadcastState[senderId] = userState;
                    break;
                    
                case 3: // انتظار التأكيد
                    if (msg.toLowerCase() === "نعم") {
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

// 🔧 دالة مساعدة: جلب قائمة القروبات بأمان
async function getSafeThreadList(api, limit = 50) {
    try {
        // محاولة جلب القروبات بطرق مختلفة
        const methods = [
            () => api.getThreadList(limit, null, ['INBOX']),
            () => api.getThreadList(limit, null, ['GROUP']),
            () => api.getThreadList(limit, null, ['SUBSCRIBED'])
        ];
        
        for (const method of methods) {
            try {
                const threads = await method();
                if (threads && threads.length > 0) {
                    console.log(`✅ تم جلب ${threads.length} قروب بنجاح`);
                    return threads;
                }
            } catch (err) {
                console.log(`⚠️ طريقة فشلت:`, err.message);
                continue;
            }
        }
        
        return [];
    } catch (err) {
        console.error("❌ فشل جميع محاولات جلب القروبات:", err);
        return [];
    }
}

// 🔧 دالة مساعدة: تصفية القروبات الصالحة
function filterValidGroups(groups, excludeThreadID) {
    return groups.filter(group => {
        try {
            // شروط صرامة للقروب الصالح
            if (!group || typeof group !== 'object') return false;
            if (!group.threadID || group.threadID === excludeThreadID) return false;
            if (group.isGroup !== true) return false;
            if (!group.name || group.name.trim() === '') return false;
            if (group.isArchived === true) return false;
            if (group.isSubscribed === false) return false;
            
            return true;
        } catch (err) {
            return false;
        }
    });
}

// 🚀 دالة الإرسال الرئيسية
async function startBroadcast(api, message, userState, event) {
    try {
        // 🔍 المرحلة 1: جلب القروبات بأمان
        await message.reply("🔄 **جاري جلب قائمة القروبات...**");
        
        const allThreads = await getSafeThreadList(api, 80);
        if (allThreads.length === 0) {
            return message.reply("❌ لم يتم العثور على أي قروبات صالحة!");
        }
        
        // تصفية القروبات الصالحة
        const validGroups = filterValidGroups(allThreads, userState.threadID);
        
        if (validGroups.length === 0) {
            return message.reply(`❌ من بين ${allThreads.length} قروب، لم يجد أي قروب صالح للإرسال!`);
        }
        
        // 📊 المرحلة 2: عرض المعلومات
        const broadcastText = createBroadcastMessage(userState.message, userState.senderName);
        const startMsg = await message.reply(
            `🚀 **بدء عملية الإذاعة...**\n\n` +
            `📊 **المعلومات:**\n` +
            `• عدد القروبات الصالحة: ${validGroups.length}\n` +
            `• مع صورة: ${userState.attachment ? '✅ نعم' : '❌ لا'}\n` +
            `• النظام: دفعات صغيرة (5 قروبات/دفعة)\n` +
            `• التأخير: 2 ثانية بين الدفعات\n\n` +
            `⏳ **جاري البدء...**`
        );
        
        // 📦 المرحلة 3: تقسيم القروبات لدفعات صغيرة
        const BATCH_SIZE = 5;
        const batches = [];
        
        for (let i = 0; i < validGroups.length; i += BATCH_SIZE) {
            batches.push(validGroups.slice(i, i + BATCH_SIZE));
        }
        
        let successCount = 0;
        let failCount = 0;
        const failedGroups = [];
        
        // 🔄 المرحلة 4: الإرسال بالدفعات
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            const batchStart = batchIndex * BATCH_SIZE + 1;
            const batchEnd = Math.min((batchIndex + 1) * BATCH_SIZE, validGroups.length);
            
            // تحديث حالة التقدم
            await message.reply(
                `📤 **جاري الإرسال - الدفعة ${batchIndex + 1}/${batches.length}**\n` +
                `📊 القروبات: ${batchStart}-${batchEnd} من ${validGroups.length}\n` +
                `✅ نجح: ${successCount} | ❌ فشل: ${failCount}`
            );
            
            // إرسال الدفعة الحالية
            for (const group of batch) {
                try {
                    if (userState.attachment && userState.attachment.url) {
                        await api.sendMessage({
                            body: broadcastText,
                            attachment: userState.attachment.url
                        }, group.threadID);
                    } else {
                        await api.sendMessage({
                            body: broadcastText
                        }, group.threadID);
                    }
                    
                    successCount++;
                    
                } catch (err) {
                    console.error(`❌ فشل الإرسال لـ ${group.name || group.threadID}:`, err.message);
                    failCount++;
                    failedGroups.push({
                        name: group.name || `القروب ${group.threadID}`,
                        error: err.message || "خطأ غير معروف",
                        threadID: group.threadID
                    });
                }
                
                // تأخير قصير بين القروبات داخل الدفعة
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // تأخير أطول بين الدفعات (إلا إذا كانت الدفعة الأخيرة)
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        // 📝 المرحلة 5: التسجيل والتقرير
        logBroadcast({
            senderId: userState.senderID,
            senderName: userState.senderName,
            message: userState.message,
            hasAttachment: !!userState.attachment,
            totalGroups: validGroups.length,
            successCount,
            failCount,
            failedGroups: failedGroups.slice(0, 10)
        });
        
        // 📄 المرحلة 6: إرسال التقرير النهائي
        let report = `✅ **اكتملت عملية الإذاعة!** 🎉\n\n`;
        report += `📊 **التقرير النهائي:**\n`;
        report += `• 📁 القروبات الصالحة: ${validGroups.length}\n`;
        report += `• ✅ نجحت: ${successCount}\n`;
        report += `• ❌ فشلت: ${failCount}\n`;
        report += `• 🎯 نسبة النجاح: ${Math.round((successCount / validGroups.length) * 100)}%\n`;
        report += `• ⏰ الوقت التقريبي: ${Math.round(validGroups.length * 0.5 / 60)} دقيقة\n\n`;
        
        if (failCount > 0) {
            report += `📝 **ملاحظات:**\n`;
            if (failCount <= 3) {
                failedGroups.forEach((g, idx) => {
                    report += `${idx + 1}. ${g.name} - ${g.error}\n`;
                });
            } else {
                report += `• فشل الإرسال لـ ${failCount} قروب\n`;
                report += `• أهم أسباب الفشل: ${failedGroups.slice(0, 3).map(g => g.error.split(':')[0]).join(', ')}\n`;
            }
        }
        
        report += `\n✨ **تم تسجيل الإذاعة في الأرشيف بنجاح.**\n`;
        report += `📁 يمكنك مراجعة السجل في: broadcast_log.json`;
        
        await message.reply(report);
        
        // 💾 المرحلة 7: حفظ تقرير مفصل (اختياري)
        if (failCount > 0) {
            const detailedReport = {
                timestamp: new Date().toISOString(),
                total: validGroups.length,
                success: successCount,
                failed: failCount,
                failedDetails: failedGroups
            };
            
            // يمكن حفظه في ملف منفصل إذا أردت
            console.log("📋 تقرير مفصل:", JSON.stringify(detailedReport, null, 2));
        }
        
    } catch (err) {
        console.error("❌ خطأ جسيم في الإذاعة:", err);
        
        let errorMsg = `❌ **فشلت عملية الإذاعة:**\n\n`;
        errorMsg += `🔧 **السبب:** ${err.message || "خطأ غير معروف"}\n\n`;
        errorMsg += `💡 **الحلول المقترحة:**\n`;
        errorMsg += `1. تأكد من صلاحيات البوت في القروبات\n`;
        errorMsg += `2. قلل عدد القروبات في الإعدادات\n`;
        errorMsg += `3. حاول في وقت لاحق\n`;
        errorMsg += `4. راجع سجلات البوت للتفاصيل`;
        
        await message.reply(errorMsg);
    }
}