import config from '../../auth_config.json';

const { domain, clientId, audience, apiUri, errorPath } = config as {
  domain: string;
  clientId: string;
  audience?: string;
  apiUri: string;
  errorPath: string;
};

export const environment = {
  production: true,
  auth: {
    domain,
    clientId,
    audience: audience || "https://okcurier-staging.eu.auth0.com/api/v2/",
    redirectUri: window.location.origin,
    errorPath,
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`],
  },
  apiUrl: 'https://okcurier-backend-0f6dc5b97bfd.herokuapp.com'  // Heroku deployed backend URL
};
