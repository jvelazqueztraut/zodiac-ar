const fs = require('fs');
const path = require('path');

module.exports = function (answers) {
  const { gcp_project_id } = answers;

  tpl = fs.readFileSync(path.join(__dirname, '../docker-compose-db.tpl.yml')).toString();
  actual = tpl
    .replace(/{gcp_project_id}/g, gcp_project_id);
  fs.writeFileSync(path.join(__dirname, '../docker-compose-db.yml'), actual);
}
