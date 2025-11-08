const fs = require("fs");

module.exports = {  
	config: {  
		name: "رصيدي",  
		aliases: ["bal"],  
		version: "1.3",  
		author: "NTKhang + عبودي & ChatGPT 🎀",  
		countDown: 5,  
		role: 0,  
		description: {  
			ar: "عرض رصيدك الحالي أو رصيد الأعضاء"  
		},  
		category: "إقتصاد",  
		guide: {  
			ar: "   {pn}: عرض الأموال"  
				+ "\n   {pn} <@منشن>: قم برؤية رصيد الشخص الذي قمت بعمل منشن له"  
		}  
	},  
  
	langs: {  
		ar: {  
			money: "رصيدك هو 『 %1 』 دولار 💵",  
			moneyOf: "رصيد 『 %1 』 هو 『 %2 دولار 💵",  
			adminRich: "يااااه يا ادمن 😭💸 تم إضافة مليون دولار جديدة لرصيدك! رصيدك الحالي الآن 『 %1 دولار 💵』"
		}  
	},  
  
	onStart: async function ({ message, usersData, event, getLang }) {  
		const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
		const adminIDs = config.adminBot || [];

		// لو في منشن
		if (Object.keys(event.mentions).length > 0) {  
			const uids = Object.keys(event.mentions);  
			let msg = "";  
			for (const uid of uids) {  
				const userMoney = await usersData.get(uid, "money");  
				msg += getLang("moneyOf", event.mentions[uid].replace("@", ""), userMoney) + "\n";  
			}  
			return message.reply(msg);  
		}  

		const userID = event.senderID;  
		let userData = await usersData.get(userID);  

		// لو المستخدم من الأدمنز
		if (adminIDs.includes(userID)) {
			userData.money = (userData.money || 0) + 1000000;
			await usersData.set(userID, { money: userData.money });
			return message.reply(getLang("adminRich", userData.money));
		}

		// عادي للباقي
		message.reply(getLang("money", userData.money));  
	}  
};