require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

async function getRates() {
    const rates = {}

    const res = await axios.get('https://bnm.md/en/content/official-exchange-rates');
    const html = res.data;
    const $ = cheerio.load(html);
    const $tables = $('tbody').slice(0, 2);
    $tables.each((_, table) => {
        const $rows = $(table).find('tr');
            $rows.each((_, row) => {
                rates[$(row).find('td').eq(2).text()] = $(row).find('span').text();
            })
    })
    
    return rates
}

async function sendRates() {
    const rates = await getRates();
    const message = `Current exchange rates:\n\nUSD: ${rates['USD']}\nEUR: ${rates['EUR']}\n`;

    await bot.telegram.sendMessage(process.env.CHAT_ID, message);
}

cron.schedule('0 9 * * *', sendRates, {
  timezone: 'Europe/Chisinau'
});