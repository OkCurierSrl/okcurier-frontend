const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const { join } = require('path');
const authConfig = require('./auth_config.json');

const app = express();

// Use the PORT provided by Heroku or default to 4200 for local development
const port = process.env.PORT || 4200;

app.use(morgan('dev'));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'connect-src': ["'self'", 'https://*.auth0.com', authConfig.apiUri, 'https://okcurier-backend-0f6dc5b97bfd.herokuapp.com'],
        'frame-src': ["'self'", 'https://*.auth0.com'],
        'base-uri': ["'self'"],
        'block-all-mixed-content': [],
        'font-src': ["'self'", 'https:', 'data:'],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:', '*.gravatar.com'],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
      },
    },
  })
);

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist/okcurier-frontend')));

// Serve the index.html file on any request
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist/okcurier-frontend/index.html'));
});

app.listen(port, () => console.log(`App server listening on port ${port}`));
