require('dotenv').config();
const fs = require('fs');

function replaceEnvVars() {
  const envVars = [
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_AUDIENCE',
    'API_URI',
    'APP_URI'
  ];

  let config = fs.readFileSync('auth_config.json', 'utf-8');

  envVars.forEach((key) => {
    const value = process.env[key];
    if (value) {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      config = config.replace(regex, value);
    } else {
      console.error(`Missing environment variable: ${key}`);
    }
  });

  fs.writeFileSync('auth_config.json', config);
}

replaceEnvVars();
