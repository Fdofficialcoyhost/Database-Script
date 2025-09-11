const path = require("path");

module.exports = {

  // === INFORMASI BOT ===

  BOT_NAME: "Jpm Fyxzpedia",

  // Variabel untuk tampilan menu

  global: {

    thumbnail: "https://telegra.ph/file/17397b97c0f4f9f257179.jpg", // Ganti dengan URL gambar Anda

    namaOwner: "JPM_FYXZPEDIA", // Ganti dengan nama Anda

    idChannel: "120363236353906359@newsletter", // Ganti dengan ID channel WhatsApp Anda

  },

  // === KONFIGURASI SESI ===

  SESSIONS_DIR: path.join(__dirname, "sessions"),

  // === KONFIGURASI BROWSER ===

  BROWSER: ["Cipbot", "Safari", "1.0"],

  // === KONFIGURASI ANTI-FLOOD ===

  USER_COOLDOWN_MS: 3000, 

  GLOBAL_LIMIT_COUNT: 20,

  GLOBAL_LIMIT_WINDOW_MS: 5000,

  // === KONFIGURASI PLUGINS ===

  PLUGIN_DIR: path.join(__dirname, "plugins"),

  // === FITUR AUTO-PROMO ===

  AUTO_PROMO_ENABLED: false, 

  PROMO_TEXT_DEFAULT: "Halo, ini pesan promosi dari bot saya!",

  PROMO_INTERVAL_MINUTES: 60,

  // === FITUR AUTO-JOIN GRUP ===

  AUTO_JOIN_GROUPS_ENABLED: true,

};

