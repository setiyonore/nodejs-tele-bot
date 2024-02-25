require("dotenv").config()
const TelegramBot = require("node-telegram-bot-api")

const token = process.env.TELEGRAM_TOKEN
console.log("Bot Ok")
const options = {
  polling: true
}
const bot = new TelegramBot(token,options)
const prefix = "."
const gempa = new RegExp(`^${prefix}gempa$`)
const news = new RegExp(`^${prefix}news$`)

bot.onText(gempa, async (callback) => {
  const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";

  try {
    const response = await fetch(BMKG_ENDPOINT+"autogempa.json");
    const gempaData = await response.json();
    const image = BMKG_ENDPOINT+gempaData.Infogempa.gempa.Shakemap
    const message = `
      Gempa Terkini:
      Tanggal: ${gempaData.Infogempa.gempa.Tanggal}
      Kekuatan: ${gempaData.Infogempa.gempa.Magnitude} SR
      Kedalaman: ${gempaData.Infogempa.gempa.Kedalaman} Km
      Wilayah: ${gempaData.Infogempa.gempa.Wilayah}
      Potensi Tsunami: ${gempaData.Infogempa.gempa.Potensi}
    `;

    bot.sendPhoto(callback.from.id, image, {
      caption :message
    });
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    bot.sendMessage(callback.from.id, "Gagal mengambil data gempa. Coba lagi nanti.");
  }
});

bot.onText(/news/, async (callback) => {
  const newsEndpoint = "https://jakpost.vercel.app/api/category/indonesia";

  try {
      bot.sendMessage(callback.from.id, "Fetching news...");

      const apiCall = await fetch(newsEndpoint);
      const response = await apiCall.json();
      const maxNews = 2;

      for (let i = 0; i < maxNews; i++) {
          const news = response.posts[i];
          const { title, image, headline } = news;

          await bot.sendPhoto(callback.from.id, image, { caption: `Judul: ${title} \n\nHeadline: ${headline}` });
      }
  } catch (error) {
      console.error("Error fetching news:", error);
      bot.sendMessage(callback.from.id, "Gagal mengambil data berita. Coba lagi nanti.");
  }
});
