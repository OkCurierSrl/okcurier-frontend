import config from '../../auth_config.json';

const {domain, clientId, authorizationParams: {audience}, apiUri, errorPath} = config as {
  domain: string;
  clientId: string;
  authorizationParams: {
    audience?: string;
  },
  apiUri: string;
  errorPath: string;
};

export const environment = {
  production: true,
  stripe: {
    publicKey: 'pk_test_51QMzzsBfqM9rVg7vvmRsH4gy7MnFExElwYhqfpZZVBAtQhVQuW6eZnV6Oxk3waYchJXHhdpFWw1iMCPbdLDcPZCG00pv3csnSB',
  },
  auth: {
    domain,
    clientId,
    authorizationParams: {
      ...(audience && audience !== 'https://okcurier-staging.eu.auth0.com/api/v2/' ? {audience} : null),
      redirect_uri: 'https://test.okcurier.ro/',
    },
    errorPath,
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`],
  },
  apiUrl: 'https://okcurier-backend-0f6dc5b97bfd.herokuapp.com'  // Heroku deployed backend URL
};
