const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
module.exports = {
  mongoURL: process.env.DATABASE_URL,
  SECRET_OR_KEY: process.env.SECRET_OR_KEY,

  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,

  MYSQL_HOST_fs9: process.env.MYSQL_HOST_fs9,
  MYSQL_USER_fs9: process.env.MYSQL_USER_fs9,
  MYSQL_PASSWORD_fs9: process.env.MYSQL_PASSWORD_fs9,
  MYSQL_DATABASE_fs9: process.env.MYSQL_DATABASE_fs9,

  MYSQL_DELETED_USER: process.env.MYSQL_DELETED_USER,
  MYSQL_DELETED_USER_PASSWORD: process.env.MYSQL_DELETED_USER_PASSWORD,

  FLIPSHOPE_MYSQL_HOST: process.env.FLIPSHOPE_MYSQL_HOST,
  FLIPSHOPE_MYSQL_USER: process.env.FLIPSHOPE_MYSQL_USER,
  FLIPSHOPE_MYSQL_PASSWORD: process.env.FLIPSHOPE_MYSQL_PASSWORD,
  FLIPSHOPE_MYSQL_DATABASE: process.env.FLIPSHOPE_MYSQL_DATABASE,

  SES_CONFIG: {
    credentials: {
      accessKeyId: process.env.SES_CONFIG_accessKeyId,
      secretAccessKey: process.env.SES_CONFIG_secretAccessKey,
    },
    region: process.env.SES_CONFIG_region,
  },
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  MOENGAGE_USERNAME: process.env.MOENGAGE_USERNAME,
  MOENGAGE_PASSWORD: process.env.MOENGAGE_PASSWORD,
  TELEGRAM_BOT_KEY: process.env.TELEGRAM_BOT_KEY,
  TELEGRAM_BOT1_KEY: process.env.TELEGRAM_BOT1_KEY,
  TELEGRAM_BOT2_KEY: process.env.TELEGRAM_BOT2_KEY,
  TELEGRAM_BOT3_KEY: process.env.TELEGRAM_BOT3_KEY,
  TELEGRAM_BOT4_KEY: process.env.TELEGRAM_BOT4_KEY,
  TELEGRAM_BOT5_KEY: process.env.TELEGRAM_BOT5_KEY,
  TELEGRAM_BOT6_KEY: process.env.TELEGRAM_BOT6_KEY,
  TELEGRAM_BOT7_KEY: process.env.TELEGRAM_BOT7_KEY,
  TELEGRAM_BOT8_KEY: process.env.TELEGRAM_BOT8_KEY,
  TELEGRAM_BOT9_KEY: process.env.TELEGRAM_BOT9_KEY,
  TELEGRAM_POSTING_BOT_KEY: process.env.TELEGRAM_POSTING_BOT_KEY,
  TELEGRAM_AUTOFORWARD_BOT_KEY: process.env.TELEGRAM_AUTOFORWARD_BOT_KEY,

  VERIFY_TOKEN: process.env.VERIFY_TOKEN,
  INSTA_CLIENT_ID: process.env.INSTA_CLIENT_ID,
  INSTA_CLIENT_SECRET: process.env.INSTA_CLIENT_SECRET,
  INSTA_REDIRECT_URL: process.env.INSTA_REDIRECT_URL,
  WEBSITE_URL: process.env.WEBSITE_URL,
  ADMIN_PANEL_URL: process.env.ADMIN_PANEL_URL,
  X_API_KEY: process.env.X_API_KEY,
  X_API_SECRET: process.env.X_API_SECRET
};
// console.log(process.env.NODE_ENV,'env');
// if (process.env.NODE_ENV === "production"){
//   console.log('production');
//   module.exports = require("../config/keys.prod");
// }
// else {
//   console.log('dev');
//   module.exports = require("../config/keys.dev");
// }
