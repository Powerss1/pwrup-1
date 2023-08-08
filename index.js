const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { Strategy } = require("passport-discord");
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const INTENTS = Object.values(GatewayIntentBits);
const client = new Client({ intents: [INTENTS] });
const bodyParser = require('body-parser');
const db = require("croxydb")
const config = require("./config");

const axios = require('axios');

async function pingURL(url) {
  try {
    await axios.get(url)
      .then(tst => {
        console.log(`Pinged ${url} successfully!`);
      })
      .catch(err => {
        console.error(`Error pinging ${url}: ${err.message}`);
      })
    // Additional handling or logging can be done with the response data
  } catch (error) {
    console.error(`Error pinging ${url}: ${error.message}`);
  }
}
const app = express();
const port = 3000;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/ekle', async (req, res) => {
	let link = req.body.add;
	let kId = req.body.userId;
	const guildxd = client.guilds.cache.get(config.guildId)
	const logchannel = guildxd.channels.cache.get(config.logkanalId)
	const jsonData = fs.readFileSync('croxydb/croxydb.json');
	const data = JSON.parse(jsonData);
	const uptimeData = data.uptime;
	const allUptimeValues = uptimeData.filter(value => typeof value === 'string');
	if (db.has("uptimeu" + kId)){
		if (db.fetch("uptimeu" + kId).length > 4) {
			res.render("hata", { islem: "Maksimum 5 adet linki uptime edebilirsin.", user: req.user })
		} else {
			if (!allUptimeValues.includes(link)) {
				if (!link.startsWith('https://')) {
					res.render("hata", { islem: "Güvenlik amacıyla HTTPS desteklemeyen linkler uptime edilemezler.", user: req.user })
				} else {
					await axios.get(link)
						.then(prsp => {
							db.push("uptime", link);
							if (db.has("uptimeu" + kId)) {
								db.push("uptimeu" + kId, link);
							} else {
								db.set("uptimeu" + kId, link);
								db.push("uptimeu" + kId, link);
							}
							const add = new ButtonBuilder()
								.setLabel('Siteye Git')
								.setStyle(ButtonStyle.Link)
								.setURL(config.callbackUrl);
							const row = new ActionRowBuilder()
								.addComponents(add);
							const falseembed = new EmbedBuilder()
								.setColor(0xFF0000)
								.setTitle('Link Eklendi')
								.setFooter({ text: `${kId} ID'li kişi tarafından istendi.`})
								.setDescription(`Uptime sistemine ${link} linki eklendi! Ekleyen kişinin toplamda ${db.fetch("uptimeu" + kId).length} adet linki oldu!`)
							logchannel.send({
								embeds: [falseembed],
								components: [row],
							})
							res.render("başarılı", { islem: "Başarıyla " + link + " linki uptime listesine eklendi!", user: req.user })
						})
						.catch(err => {
							res.render("hata", { islem: "Lütfen geçerli bir URL giriniz!", user: req.user })
						})
				}
			} else {
				res.render("hata", { islem: link + " linki zaten uptime listesinde bulunuyor!", user: req.user })
			}
		}
	} else {
		if (!allUptimeValues.includes(link)) {
			if (!link.startsWith('https://')) {
				res.render("hata", { islem: "Güvenlik amacıyla HTTPS desteklemeyen linkler uptime edilemezler.", user: req.user })
			} else {
				await axios.get(link)
					.then(prsp => {
						db.push("uptime", link);
						if (db.has("uptimeu" + kId)) {
							db.push("uptimeu" + kId, link);
						} else {
							db.set("uptimeu" + kId, link);
							db.push("uptimeu" + kId, link);
						}
						const add = new ButtonBuilder()
							.setLabel('Siteye Git')
							.setStyle(ButtonStyle.Link)
							.setURL(config.callbackUrl);
						const row = new ActionRowBuilder()
							.addComponents(add);
						const falseembed = new EmbedBuilder()
							.setColor(0xFF0000)
							.setTitle('Link Eklendi')
							.setFooter({ text: `${kId} ID'li kişi tarafından istendi.`})
							.setDescription(`Uptime sistemine ${link} linki eklendi! Ekleyen kişinin toplamda ${db.fetch("uptimeu" + kId).length} adet linki oldu!`)
						logchannel.send({
							embeds: [falseembed],
							components: [row],
						})
						res.render("başarılı", { islem: "Başarıyla " + link + " linki uptime listesine eklendi!", user: req.user })
					})
					.catch(err => {
						res.render("hata", { islem: "Lütfen geçerli bir URL giriniz!", user: req.user })
					})
			}
		} else {
			res.render("hata", { islem: link + " linki zaten uptime listesinde bulunuyor!", user: req.user })
		}
	}
})

app.post('/sil', async (req, res) => {
	const guildxd = client.guilds.cache.get(config.guildId)
	const logchannel = guildxd.channels.cache.get(config.logkanalId)
	let link = req.body.del;
	let kId = req.body.userId;
	const jsonData = fs.readFileSync('croxydb/croxydb.json');
	const data = JSON.parse(jsonData);
	const uptimeData = data.uptime;
	const allUptimeValues = uptimeData.filter(value => typeof value === 'string');
	if (allUptimeValues.includes(link)) {
		if (db.fetch("uptimeu" + kId).includes(link)) {
			db.unpush("uptime", link);
			db.unpush("uptimeu" + kId, link);
			const add = new ButtonBuilder()
				.setLabel('Siteye Git')
				.setStyle(ButtonStyle.Link)
				.setURL(config.callbackUrl);
			const row = new ActionRowBuilder()
				.addComponents(add);
			const falseembed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('Link Silindi')
				.setFooter({ text: `${kId} ID'li kişi tarafından istendi.`})
				.setDescription(`Uptime sisteminden ${link} linki silindi. Ekleyen kişinin toplamda ${db.fetch("uptimeu" + kId).length} adet linki oldu.`)
			logchannel.send({
				embeds: [falseembed],
				components: [row],
			})
			res.render("başarılı", { islem: link + " linki başarıyla uptime listenden silindi! Artık sistemimiz bu linki uptime etmeyecektir.", user: req.user })
		} else {
			res.render("hata", { islem: link + " linki uptime listende bulunmuyor!", user: req.user })
		}
	} else {
		if (db.fetch("uptimeu" + kId) == link) {
			db.unpush("uptimeu" + kId, link)
			const add = new ButtonBuilder()
				.setLabel('Siteye Git')
				.setStyle(ButtonStyle.Link)
				.setURL(config.callbackUrl);
			const row = new ActionRowBuilder()
				.addComponents(add);
			const falseembed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('Link Silindi')
				.setFooter({ text: `${kId} ID'li kişi tarafından istendi.`})
				.setDescription(`Uptime sisteminden ${link} linki silindi. Ekleyen kişinin toplamda ${db.fetch("uptimeu" + kId).length} adet linki oldu. Yalnız bu link daha önceden bir yetkili tarafından uptime listesinden silinmiş, yani uptime edilemiyormuş.`)
			logchannel.send({
				embeds: [falseembed],
				components: [row],
			})
			res.render("başarılı", { islem: link + " linki başarıyla uptime listenden silindi! Yalnız bu link daha önceden bir yetkili tarafından silinmiş. Yani uptime edilemez duruma gelmiş.", user: req.user })
		} else {
			res.render("hata", { islem: link + " linki uptime listende bulunmuyor!", user: req.user })
		}
	}
})

app.post('/adminsil', async (req, res) => {
	const guildxd = client.guilds.cache.get(config.guildId)
	const logchannel = guildxd.channels.cache.get(config.logkanalId)
	let link = req.body.del;
	let kId = req.body.userId;
	const jsonData = fs.readFileSync('croxydb/croxydb.json');
	const data = JSON.parse(jsonData);
	const uptimeData = data.uptime;
	const member = guildxd.members.cache.get(kId);
	const allUptimeValues = uptimeData.filter(value => typeof value === 'string');
	if (allUptimeValues.includes(link)) {
		if (member.roles.cache.has(config.adminRole)) {
			db.unpush("uptime", link);
			const add = new ButtonBuilder()
				.setLabel('Siteye Git')
				.setStyle(ButtonStyle.Link)
				.setURL(config.callbackUrl);
			const row = new ActionRowBuilder()
				.addComponents(add);
			const falseembed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('Link Silindi')
				.setFooter({ text: `${kId} ID'li kişi tarafından istendi.`})
				.setDescription(`Uptime sisteminden ${link} linki bir yetkili tarafından silindi.`)
			logchannel.send({
				embeds: [falseembed],
				components: [row],
			})
			res.render("başarılı", { islem: link + " linki başarıyla uptime listesinden silindi! Artık bu link uptime edilmeyecektir.", user: req.user })
		} else {
			res.render("hata", { islem: link + " linkini silmek için yeterli yetkin bulunmuyor!", user: req.user })
		}
	} else {
		res.render("hata", { islem: link + " linki uptime listesinde bulunmuyor!", user: req.user })
	}
})

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.set('view engine' , 'ejs');

const strategy = new Strategy(
	{
		clientID: config.clientId,
		clientSecret: process.env["secret"],
		callbackURL: config.callbackUrl,
		scope: ["identify", "guilds"],
	},
	(_access_token, _refresh_token, user, done) =>
		process.nextTick(() => done(null, user)),
);

passport.use(strategy);

app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: false,
	}),
);

app.use(passport.session());
app.use(passport.initialize());

app.get(
	"/giris",
	passport.authenticate("discord", {
		scope: ["identify", "guilds"],
	}),
);

app.get("/logout", (req, res) => {
	req.session.destroy();
	return res.redirect("/");
});

app.get("/linklerim", (req, res) => {
	try {
		const user = req.user;
		const usernick = req.user.username;
		if (db.has("uptimeu" + req.user.id)){
			const benimlinklerim = db.fetch("uptimeu" + req.user.id).join(', ')
			if (benimlinklerim.length > 0) {
				res.render("linklerim", { user: user, linkler: benimlinklerim, kullanici: req.user.id })
			} else {
				res.render("linklerim", { user: user, linkler: "Hiçbir link eklememişsin!", kullanici: req.user.id })
			}
		} else {
			res.render("hata", { islem: "Sisteme eskiden beri hiçbir link eklememişsin! Bu sayfaya erişebilmen için sisteme minimum 1 link eklemen gerek.", user: req.user })
		}

	} catch (err) {
		res.redirect('/callback');
	}
});

app.get("/admin", (req, res) => {
	try {
		const user = req.user;
		const usernick = req.user.username;
		const guildmd = client.guilds.cache.get(config.guildId)
		const member = guildmd.members.cache.get(req.user.id);
		if (member.roles.cache.has(config.adminRole)) {
			const benimlinklerim = db.fetch("uptime").join(', ')
			if (benimlinklerim.length > 0) {
				res.render("admin", { user: user, linkler: benimlinklerim, kullanici: req.user.id, linkUzunlugu: db.fetch("uptime").length })
			} else {
				res.render("admin", { user: user, linkler: "Hiçbir link eklenmemiş!", kullanici: req.user.id, linkUzunlugu: db.fetch("uptime").length })
			}
		} else {
			res.send("Bunu sayfaya girebilmek için gerekli yetkiye sahip değilsin.")
		}
	} catch (err) {
		res.redirect('/callback');
	}
});

app.get("/ekle", (req, res) => {
	try {
		const user = req.user;
		const usernick = req.user.username;
		res.render("ekle", { user: user, kullanici: req.user.id })
	} catch (err) {
		res.redirect('/callback');
	}
});


app.get("/callback",
	passport.authenticate("discord", {
		failureRedirect: "/hata",
	}),
	(_req, res) => res.redirect("/"),
);

app.get("/", (req, res) => {
	try {
		const user = req.user;
		const usernick = req.user.username;
		res.render("index", { user: req.user, name: "Hoşgeldin, " + req.user.username + "!" })
	} catch (err) {
		res.render("index", { user: req.user, name: "Hoşgeldin!" })
	}
});

app.get("/iletisim", (req, res) => {
	res.render("iletisim", { user: req.user })
});

app.get("/nedenbiz", (req, res) => {
	res.render("nedenbiz", { user: req.user, name: "${req.user.username}" })
});

app.get("/sss", (req, res) => {
	res.render("sss", { user: req.user })
});

const listener = app.listen(port, "0.0.0.0", () => {
	console.log(`Site ${listener.address().port} portunda hazır!`);
});


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env["token"])