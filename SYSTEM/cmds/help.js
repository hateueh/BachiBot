const { getPrefix } = global.utils;
const { commands, aliases } = global.NeroBot;
const doNotDelete = "[ 🩷 | Bachi ]";

module.exports = {
  config: {
    name: "اوامر",
    version: "1.20",
    author: "باتشيرا الانا 🎀",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "قائمة أوامر أنيقة ومبسطة 🎀",
    },
    longDescription: {
      ar: "تعرض كل أوامر البوت بتصميم مريح وكيوت 💫",
    },
    category: "النظام",
    guide: {
      ar: "{pn} أو {pn} اسم_الأمر لعرض التفاصيل 🌸",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    // عرض كل الأوامر بدون تفاصيل
    if (args.length === 0) {
      const categories = {};
      let msg = `🎀✨ قائمة أوامر باتشي 💞\n━━━━━━━━━━━━━━━\n\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "غير مصنف";
        categories[category] = categories[category] || [];
        categories[category].push(name);
      }

      for (const [category, cmds] of Object.entries(categories)) {
        msg += `∆${category}∆\n`;
        msg += cmds.map(cmd => `•${cmd}`).join("  ");
        msg += "\n\n";
      }

      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `✨ المجموع: ${commands.size} أمر 💖\n`;
      msg += `🩵 استخدم: ${prefix} اوامر [اسم_الأمر] لعرض التفاصيل.\n`;
      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `🌷 بتوقيع: باتشيرا الانا 🎀`;

      return message.reply(msg);
    } 

    // عرض تفاصيل أمر واحد
    else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command)
        return message.reply(`❓ ما في أمر اسمه "${commandName}" يا لطيف 😭`);

      const c = command.config;
      const roleText = roleToText(c.role);
      const author = c.author || "غير معروف";
      const desc = c.longDescription?.ar || "مافي وصف 😿";
      const guide = c.guide?.ar || "مافي شرح 😅";
      const usage = guide.replace(/{p}/g, prefix).replace(/{n}/g, c.name);

      const response = `
🌸✨〘 معلومات الأمر 〙✨🌸
━━━━━━━━━━━━━━━
💖 الاسم: ${c.name}
🌼 الوصف: ${desc}
💫 أسماء أخرى: ${c.aliases?.join(", ") || "مافي"}
🧠 الإصدار: ${c.version || "1.0"}
🔒 الصلاحية: ${roleText}
⏰ الانتظار: ${c.countDown || 1} ث
👑 المؤلف: ${author}
━━━━━━━━━━━━━━━
📘 الاستخدام:
${usage}
━━━━━━━━━━━━━━━
🎀 من باتشي بالحب 💞
`;

      return message.reply(response);
    }
  },
};

function roleToText(role) {
  switch (role) {
    case 0:
      return "👤 الكل";
    case 1:
      return "🛠️ المشرفين";
    case 2:
      return "👑 المطور";
    default:
      return "مجهول 😿";
  }
}