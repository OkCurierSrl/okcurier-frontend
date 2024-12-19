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
        'frame-src': ["'self'", 'https://okcurier-staging.eu.auth0.com', 'https://js.stripe.com'],
        'connect-src': [
          "'self'",
          'https://okcurier-backend-0f6dc5b97bfd.herokuapp.com',
          'https://maps.googleapis.com',
          'https://js.stripe.com',
          'https://okcurier-staging.eu.auth0.com',
        ],
        'script-src': [
          "'self'",
          "'unsafe-inline'", // Inline scripts
          "'unsafe-eval'", // Allow eval in scripts
          'https://maps.googleapis.com',
          'https://js.stripe.com',
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'", // Inline styles
          'https://cdn.auth0.com',
          'https://stackpath.bootstrapcdn.com',
        ],
        'img-src': ["'self'", 'data:', 'https:'], // Images from self and data URIs
        'font-src': ["'self'", 'https://fonts.gstatic.com'], // Fonts from Google
        'base-uri': ["'self'"], // Restrict <base> tag URIs
        'block-all-mixed-content': [], // Block mixed content
        'frame-ancestors': ["'self'"], // Disallow embedding as a frame
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
