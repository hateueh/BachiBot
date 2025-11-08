module.exports = {
	config: {
		name: "تحويل",
		aliases: ["transfer", "تحول", "ايداع"],
		version: "1.0",
		author: "عبودي & ChatGPT 🎀",
		countDown: 5,
		role: 0,
		description: {
			ar: "حوّل رصيدًا إلى شخص آخر 💸"
		},
		category: "إقتصاد",
		guide: {
			ar: "{pn} @منشن المبلغ\nمثال: تحويل @عبودي 500"
		}
	},

	langs: {
		ar: {
			noMention: "😕 منشن الشخص الذي تريد تحويل الرصيد له يا لطيف!",
			noAmount: "😅 كم المبلغ الذي تريد تحويله؟",
			invalidAmount: "🚫 المبلغ غير صالح، تأكد أنه رقم موجب.",
			notEnough: "😭 ما عندك رصيد كافي لتحويل %1 دولار! رصيدك الحالي: %2 💵",
			successSender: "✅ تم تحويل %1 دولار إلى 『%2』 بنجاح 💸\nرصيدك الجديد: %3 💵",
			successReceiver: "💰 لقد استلمت %1 دولار من 『%2』! 🎀💵",
			selfTransfer: "🙄 ما ينفع تحول لنفسك يا عبقري 😂"
		}
	},

	onStart: async function ({ message, event, args, usersData, getLang }) {
		const senderID = event.senderID;
		const mentionIDs = Object.keys(event.mentions || {});

		if (mentionIDs.length === 0) return message.reply(getLang("noMention"));
		const receiverID = mentionIDs[0];
		if (receiverID === senderID) return message.reply(getLang("selfTransfer"));

		const amount = parseInt(args[args.length - 1]);
		if (!amount) return message.reply(getLang("noAmount"));
		if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalidAmount"));

		const senderData = await usersData.get(senderID);
		const receiverData = await usersData.get(receiverID);

		const senderMoney = senderData.money || 0;
		if (senderMoney < amount) return message.reply(getLang("notEnough", amount, senderMoney));

		// خصم من المرسل
		await usersData.set(senderID, { money: senderMoney - amount });
		// إضافة للمستلم
		await usersData.set(receiverID, { money: (receiverData.money || 0) + amount });

		// إرسال إشعارات
		message.reply(getLang("successSender", amount, event.mentions[receiverID].replace("@", ""), senderMoney - amount));

		message.send({
			body: getLang("successReceiver", amount, senderData.name || "شخص ما 🎀"),
			mentions: [{ id: receiverID }]
		});
	}
};