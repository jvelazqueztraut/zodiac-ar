const fs = require('fs');
const path = require('path');

module.exports = function (answers) {
  const { gcp_project_id } = answers;

  const tpl = fs.readFileSync(path.join(__dirname, '../ecosystem.config.tpl.js')).toString();
  const actual = tpl
    .replace(/{gcp_project_id}/g, gcp_project_id);
  fs.writeFileSync(path.join(__dirname, '../ecosystem.config.js'), actual);
}
