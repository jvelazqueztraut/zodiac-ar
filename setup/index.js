const inquirer = require('inquirer');

const setupDockerCompose = require('./docker-compose');
const setupEcosystemConfig = require('./ecosystem-config');
const setupStrapiUploaderServiceAccountKey = require('./strapi-uploader-service-account-key');
const setupPixi = require('./setup-pixi');

console.log(`
Welcome to Base Web project setup.
Please provide values from Terraform provisioning run:
`);

inquirer
  .prompt([
    {
      type: 'input',
      name: 'gcp_project_id',
      message: 'Enter the gcp_project_id',
      validate: function(text) {
        if (text.length < 1) {
          return 'Value needs to be provided';
        }
        return true;
      }
    },
    {
      type: 'editor',
      name: 'strapi_uploader_service_account_key_json',
      message: 'Enter the strapi_uploader_service_account_key_json',
      validate: function(text) {
        try {
          const json = JSON.parse(text);
        } catch (e) {
          return 'Must be a valid JSON';
        }

        return true;
      }
    },
    {
      type: 'confirm',
      name: 'is_pixi_project',
      message: 'Does the project use Pixi.js?',
    },
  ])
  .then(answers => {
    console.log('Setting up...');
    setupDockerCompose(answers);
    setupEcosystemConfig(answers);
    setupStrapiUploaderServiceAccountKey(answers);
    setupPixi(answers);

    console.log('Setup complete');
  })
  .catch(error => {
    if(error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
      console.error('An error ocurred with your TTY environment');
    } else {
      // Something else when wrong
      console.error('Something went wrong');
    }

    console.error(error);
  });
