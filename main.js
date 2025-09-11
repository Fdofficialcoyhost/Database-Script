const {

  default: makeWASocket,

  useMultiFileAuthState,

  fetchLatestBaileysVersion,

  DisconnectReason,

  Browsers,

  makeCacheableSignalKeyStore,

} = require("@whiskeysockets/baileys");

const P = require("pino");

const readline = require("readline");

const fs = require("fs");

const clc = require("cli-color");

const path = require("path");

const setup = require("./setup");

const owner = require("./owner");

// memory anti flood

const userCooldown = new Map();

let globalCount = 0;

let globalReset = Date.now() + setup.GLOBAL_LIMIT_WINDOW_MS;

// loader plugin

function loadPlugins() {

  if (!fs.existsSync(setup.PLUGIN_DIR)) fs.mkdirSync(setup.PLUGIN_DIR);

  const plugins = {};

  const files = fs.readdirSync(setup.PLUGIN_DIR).filter((f) => f.endsWith(".js"));

  for (const file of files) {

    try {

      plugins[file] = require(path.join(setup.PLUGIN_DIR, file));

      console.log(clc.green(`✔ Loaded plugin: ${file}`));

    } catch (err) {

      console.log(clc.red(`❌ Gagal load plugin ${file}: ${err.message}`));

    }

  }

  return plugins;

}

let plugins = loadPlugins();

async function connectToWhatsApp(number = null) {

  const { state, saveCreds } = await useMultiFileAuthState(setup.SESSIONS_DIR);

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({

    version,

    logger: P({ level: "silent" }),

    printQRInTerminal: false,

    auth: {

      creds: state.creds,

      keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" })),

    },

    browser: setup.BROWSER,

  });

  sock.ev.on("creds.update", saveCreds);

  let promoStarted = false;

  sock.ev.on("connection.update", async (update) => {

    const { connection, lastDisconnect, qr } = update;

    if (connection === "close") {

      let reason = new DisconnectReason(lastDisconnect?.error?.output?.statusCode);

      if (reason === DisconnectReason.loggedOut) {

        console.log(clc.red("⛔ Logout. Hapus folder sesi dan scan ulang."));

      } else {

        console.log(clc.yellow(`❌ Koneksi terputus, alasan: ${reason.reason}. Mencoba menyambung kembali...`));

        connectToWhatsApp(number);

      }

    } else if (connection === "open") {

      console.log(clc.green(`✅ ${setup.BOT_NAME} terhubung!`));

      if (!promoStarted) {

        const setup = require("./setup");

        if (

          setup.AUTO_PROMO_ENABLED &&

          plugins["autopromosi.js"] &&

          plugins["autopromosi.js"].startAutoPromo

        ) {

          plugins["autopromosi.js"].startAutoPromo(

            sock,

            setup.PROMO_TEXT_DEFAULT,

            setup.PROMO_INTERVAL_MINUTES * 60 * 1000

          );

        }

        promoStarted = true;

      }

    }

  });

  if (number && !sock.authState.creds.registered) {

      console.log(clc.blue("⏳ Meminta kode pairing..."));

      await new Promise(r => setTimeout(r, 2000));

      try {

        const code = await sock.requestPairingCode(number.trim());

        const formatted = code.match(/.{1,4}/g)?.join("-") || code;

        console.log(clc.green(`🔑 Pairing Code: ${formatted}`));

      } catch (err) {

        console.error(clc.red("❌ Gagal request pairing code:"), err.message);

      }

  }

  sock.ev.on("messages.upsert", async ({ messages }) => {

    const m = messages[0];

    if (!m.message) return;

    const from = m.key.remoteJid;

    const sender =

      (m.key.participant || m.key.remoteJid || "").split("@")[0] || "unknown";

    const text =

      m.message.conversation ||

      m.message.extendedTextMessage?.text ||

      m.message.imageMessage?.caption ||

      "";

    if (!text) return;

    const now = Date.now();

    if (userCooldown.has(sender) && now - userCooldown.get(sender) < setup.USER_COOLDOWN_MS) {

      console.log(clc.yellow(`⏳ Cooldown ${sender}`));

      return;

    }

    userCooldown.set(sender, now);

    if (now > globalReset) {

      globalCount = 0;

      globalReset = now + setup.GLOBAL_LIMIT_WINDOW_MS;

    }

    if (globalCount++ > setup.GLOBAL_LIMIT_COUNT) {

      console.log(clc.red("🚫 Global limit exceeded, ignoring message"));

      return;

    }

    for (const name in plugins) {

      try {

        if (typeof plugins[name] === 'function') {

            await plugins[name](sock, m, from, text, sender);

        } else if (typeof plugins[name] === 'object' && plugins[name].default) {

            await plugins[name].default(sock, m, from, text, sender);

        }

      } catch (e) {

        console.log(clc.red(`⚠ Error in plugin ${name}: ${e.message}`));

      }

    }

  });

}

const rl = readline.createInterface({

  input: process.stdin,

  output: process.stdout

});

(async () => {

    const sessionExists = fs.existsSync(setup.SESSIONS_DIR) && fs.readdirSync(setup.SESSIONS_DIR).length > 0;

    if (sessionExists) {

        console.log(clc.green("✅ Sesi ditemukan. Mencoba terhubung..."));

        connectToWhatsApp();

        rl.close();

    } else {

        console.log("Masukan Nomor Ponsel");

        rl.question("Contoh: 6281234567890\n> ", (num) => {

            connectToWhatsApp(num);

            rl.close();

        });

    }

})();

