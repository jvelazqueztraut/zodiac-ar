const fs = require("fs");
const path = require("path");

module.exports = function (answers) {
  const { strapi_uploader_service_account_key_json } = answers;

  fs.writeFileSync(
    path.join(__dirname, "../cms/.uploader-service-account-key.json"),
    strapi_uploader_service_account_key_json
  );
};
