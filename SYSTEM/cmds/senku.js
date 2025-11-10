const axios = require("axios");

module.exports = {
	config: {
		name: "سينكو",
		aliases: ["senku", "سينكوو", "sinku", "senco", "senk"],
		version: "1.0",
		author: "باتشيرا الانا",
		countDown: 5,
		role: 0,
		description: {
			ar: "ذكاء اصطناعي متطور يجيب عن الأسئلة بجديّة ومنطقية"
		},
		category: "ذكاء_اصطناعي",
		guide: {
			ar: "{pn} <سؤالك> — لطرح سؤال على سينكو العبقري 🔬"
		}
	},

	langs: {
		ar: {
			missingQuestion: "🧠│من فضلك، اطرح سؤالك بعد الأمر، مثال:\nسينكو ما هي الطاقة النووية؟",
			thinking: "🔬│يفكر سينكو في إجابة علمية دقيقة...",
			noAnswer: "❌│لم أستطع الوصول لإجابة دقيقة حالياً، أعد صياغة سؤالك من فضلك.",
			devInfo: "⚙️│المطور: باتشيرا الانا\n🔗 الحساب: https://www.facebook.com/batshyra.alana"
		}
	},

	// 💬 onStart عشان يظهر في قائمة الأوامر
	onStart: async function ({ message }) {
		message.reply("🔬 سينكو العبقري هنا! اكتب: سينكو + سؤالك 🧠✨");
	},

	onChat: async function ({ message, args, getLang }) {
		const question = args.join(" ");
		if (!question)
			return message.reply(getLang("missingQuestion"));

		const devKeywords = ["من طورك", "مين صنعك", "من صانعك", "المطور", "developer", "creator", "who made you"];
		if (devKeywords.some(k => question.toLowerCase().includes(k)))
			return message.reply(getLang("devInfo"));

		message.reply(getLang("thinking"));

		try {
			const prompt = `أجب بجديّة ومنطقية وعلمية عن السؤال التالي بالعربية:\n${question}`;
			const response = await axios.post(
				"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBJIOdF977s87SfNM2nTQk_O4zgTK1M1II",
				{ contents: [{ parts: [{ text: prompt }] }] }
			);

			const answer =
				response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
				getLang("noAnswer");

			message.reply("🧠│" + answer);
		} catch (error) {
			console.error(error);
			message.reply(getLang("noAnswer"));
		}
	}
};