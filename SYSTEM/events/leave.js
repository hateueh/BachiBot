const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "2.1",
    author: "باتشيرا الانا 🎀🍭",
    category: "events"
  },

  langs: {
    ar: {
      session1: "في الصباح",
      session2: "في الظهر",
      session3: "في وقت ما بعد الظهر",
      session4: "في المساء",
      leaveType1: "قد غادر المجموعة",
      leaveType2: "تم طرده من المجموعة",
      defaultLeaveMessage: "{userName} {type} من {threadName}"
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId == api.getCurrentUserID()) return;

    const hours = getTime("HH");
    const threadName = threadData.threadName;
    const userName = await usersData.getName(leftParticipantFbId);
    const authorID = event.author;
    const authorName = (await api.getUserInfo(authorID))[authorID]?.name || "الأدمن";

    const session =
      hours <= 10 ? getLang("session1") :
      hours <= 12 ? getLang("session2") :
      hours <= 18 ? getLang("session3") :
      getLang("session4");

    // تحديد إذا كان غادر أو طُرد
    const isLeave = leftParticipantFbId === authorID;
    const leaveType = isLeave ? getLang("leaveType1") : getLang("leaveType2");

    // الرسالة الديناميكية
    let leaveMessage;
    if (isLeave) {
      leaveMessage = `😔💔 وداعًا ${userName}...\nالمجموعة فقدت ضوءًا من أنوارها 💐\nالكل صامت ${session}... والجو حزين 🕯️\nارجع قريب يا طيب 😭🎀`;
    } else {
      leaveMessage = `😭💔 ياااااااه ${authorName} ليييييه 😭💔\nحرام عليك، ليه طردت ${userName}؟ 😭\nكنا نحبه، كنا نضحك سوا 😭☕💐`;
    }

    // إرسال الرسالة مع الصور إن وجدت
    const form = { body: leaveMessage };

    if (threadData.data?.leaveAttachment) {
      const files = threadData.data.leaveAttachment;
      const attachments = await Promise.allSettled(
        files.map(file => drive.getFile(file, "stream"))
      );
      form.attachment = attachments
        .filter(({ status }) => status === "fulfilled")
        .map(({ value }) => value);
    }

    message.send(form);
  }
};