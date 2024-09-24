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
  auth: {
    domain,
    clientId,
    authorizationParams: {
      ...(audience && audience !== 'https://okcurier-staging.eu.auth0.com/api/v2/' ? {audience} : null),
      redirect_uri: 'https://okcurier-frontend-d66f2ea5edab.herokuapp.com/',
    },
    errorPath,
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`],
  },
  apiUrl: 'https://okcurier-backend-0f6dc5b97bfd.herokuapp.com'  // Heroku deployed backend URL
};
