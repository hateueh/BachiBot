const config = require("../../config.json"); // عدّل المسار حسب مكان ملف config.json في مشروعك

module.exports = {
  config: {
    name: "اخرج",
    aliases: ["اطلع", "خرج", "leave"],
    version: "1.0",
    author: "عبودي 🎀",
    shortDescription: "خلي البوت يطلع من القروب (للمديرين فقط)",
    category: "ادارة",
    guide: "{pn}"
  },

  onStart: async function({ api, event, message }) {
    try {
      const senderId = String(event.senderID);
      const threadID = event.threadID;

      // التحقق من صلاحيات الأدمن
      if (!Array.isArray(config.adminBot) || !config.adminBot.includes(senderId)) {
        return message.reply("❌ ما عندك صلاحية يا حبيبي 😅\nالموظيفة دي للأدمن بس.");
      }

      // رسالة تأكيد لطيفة قبل الخروج
      await message.reply("حاضر يا قلبو 💔🎀... بطلب مني وأطلع الحين.");

      // ننتظر شوية كنشر للّطف 😌
      setTimeout(async () => {
        // نحاول استخدام الدالة المناسبة على حسب المكتبة اللي تستخدمها
        // بعض مكتبات ماسنجر توفر api.leaveThread(threadID, cb)
        // وبعضها توفر api.removeUserFromGroup(userID, threadID, cb)
        // سنجرب عدة احتمالات داخل try/catch

        try {
          // خيار 1: لو فيه leaveThread
          if (typeof api.leaveThread === "function") {
            return api.leaveThread(threadID, (err) => {
              if (err) return message.reply("حاولت أطلع بس صار خطأ عند الخروج 😢");
            });
          }

          // خيار 2: لو فيه removeUserFromGroup(userID, threadID, cb)
          if (typeof api.removeUserFromGroup === "function") {
            // نحاول حذف البوت نفسه من القروب - نستخدم event.botID أو نطلب من api معرف الحساب الحالي
            const botId = (api.getCurrentUserID && typeof api.getCurrentUserID === "function")
              ? String(api.getCurrentUserID())
              : null;

            // بعض الـ libs تستبدل ترتيب المعطيات، لذلك نجرّب الشكل الشائع:
            if (botId) {
              return api.removeUserFromGroup(botId, threadID, (err) => {
                if (err) return message.reply("حصل خطأ وقت الخروج 😿");
              });
            } else {
              // محاولة بديلة (هناك مكتبات تضع threadID أول ثم userID)
              return api.removeUserFromGroup(threadID, botId, (err) => {
                if (err) return message.reply("حصل خطأ وقت الخروج 😿");
              });
            }
          }

          // لو ما لقينا دوال للخروج، نعلم الأدمن كيف يعدّل الكود
          return message.reply(
            "ما لقيت دالة خروج تلقائية في الـ API عندي 😅\nمحتاج تغير السطر اللي فيه `api.leaveThread` أو `api.removeUserFromGroup` حسب مكتبتك."
          );

        } catch (errInner) {
          console.error("خطأ وقت محاولة الخروج:", errInner);
          return message.reply("حاولت أطلع لكن صار خطأ غير متوقع 😭");
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      return message.reply("صار خطأ عند تنفيذ الأمر. راجع السجلات يا بطل.");
    }
  }
};