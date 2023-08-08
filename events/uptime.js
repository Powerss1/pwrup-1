const { Events, GatewayIntentBits, Client } = require('discord.js');
const fs = require('fs');
const axios = require('axios');

const jsonData = fs.readFileSync('croxydb/croxydb.json');
const data = JSON.parse(jsonData);
const INTENTS = Object.values(GatewayIntentBits);
const client = new Client({ intents: [INTENTS] });

const uptimeData = data.uptime;
const allUptimeValues = uptimeData.filter(value => typeof value === 'string');

async function pingURL(url) {
  try {
    await axios.get(url);
    console.log(`Pinged ${url} successfully!`);
  } catch (error) {
    console.error(`Error pinging ${url}: ${error.message}`);
  }
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute() {
    console.log("Bota giriş yapıldı!");
    if (allUptimeValues && Array.isArray(allUptimeValues)) {
      for (const url of allUptimeValues) {
        await pingURL(url);
      }
    }
    setInterval(async () => {
      if (allUptimeValues && Array.isArray(allUptimeValues)) {
        for (const url of allUptimeValues) {
          await pingURL(url);
        }
      }
    }, 270000);
  },
};
