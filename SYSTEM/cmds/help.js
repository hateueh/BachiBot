const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.NeroBot; // لا تغيّر الاسم لو يعتمد عليه النظام
const doNotDelete = "[ 🩷 | Bachi ]";

module.exports = {
  config: {
    name: "اوامر",
    version: "1.18",
    author: "باتشيرا الانا 🎀",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "قائمة الأوامر الكيوت 💖",
    },
    longDescription: {
      ar: "يعرض كل أوامر البوت بتنسيق أنيق وكيوت 🎀",
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

    if (args.length === 0) {
      const categories = {};
      let msg = "";
      msg += `🌸✨ 〘 قائمة أوامر Bachi 💖 〙 ✨🌸\n\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "غير مصنف";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      for (const [category, data] of Object.entries(categories)) {
        msg += `🍓 ⊹･ﾟ﹕${category.toUpperCase()}﹕･ﾟ⊹ 🍓\n`;
        const sorted = data.commands.sort();
        for (const cmd of sorted) {
          msg += `  💫 • ${cmd}\n`;
        }
        msg += "\n";
      }

      const total = commands.size;
      msg += `━━━━━━━━━━━━━━━━━━━\n`;
      msg += `✨ عدد الأوامر الكلي: ${total}\n`;
      msg += `💬 اكتب: ${prefix} اوامر [اسم_الأمر] لمعرفة التفاصيل.\n`;
      msg += `🌷 صُنع بحب من باتشيرا الانا 🩷`;

      return message.reply(msg);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❓ يا قلبي ما لقيت أمر بهذا الاسم "${commandName}" 😢`);
      }

      const c = command.config;
      const roleText = roleToText(c.role);
      const author = c.author || "غير معروف";
      const desc = c.longDescription?.ar || "مافي وصف متاح 😭";
      const guide = c.guide?.ar || "مافي شرح 😿";
      const usage = guide.replace(/{p}/g, prefix).replace(/{n}/g, c.name);

      const response = `
🌸✨〘 معلومات الأمر 〙✨🌸
━━━━━━━━━━━━━━━━━━━
💖 الاسم: ${c.name}
🌼 الوصف: ${desc}
💫 أسماء أخرى: ${c.aliases?.join(", ") || "مافي"}
🧠 الإصدار: ${c.version || "1.0"}
🔒 الصلاحية: ${roleText}
⏰ وقت الانتظار: ${c.countDown || 1} ثانية
👑 المؤلف: ${author}
━━━━━━━━━━━━━━━━━━━
📘 الاستخدام:
${usage}
━━━━━━━━━━━━━━━━━━━
🎀 ملاحظة:
الكلام داخل < > تقدر تغيّره، وداخل [a|b] تختار واحد منهم 💡
━━━━━━━━━━━━━━━━━━━
✨ من قلب باتشي 💞
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
      return "🛠️ المشرفين فقط";
    case 2:
      return "👑 المطور فقط";
    default:
      return "مجهول 😿";
  }
}