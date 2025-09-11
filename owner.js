// owner.js

// File ini digunakan untuk menyimpan nomor owner bot dan fungsi untuk memeriksa owner.

module.exports = {

  // Masukkan nomor WhatsApp owner di sini dalam format internasional (tanpa tanda tambah '+').

  // Jika ada lebih dari satu owner, Anda bisa menambahkannya dalam array.

  OWNERS: ["6281234567890"],

  /**

   * Fungsi untuk memeriksa apakah sebuah nomor adalah owner.

   * @param {string} number Nomor WhatsApp yang akan diperiksa (contoh: '6281234567890').

   * @returns {boolean} True jika nomor adalah owner, False jika bukan.

   */

  isOwner: (number) => {

    // Menghapus '@s.whatsapp.net' jika ada dan memastikan formatnya sesuai

    const cleanedNumber = number.replace(/@s\.whatsapp\.net$/, '');

    return module.exports.OWNERS.includes(cleanedNumber);

  }

};

