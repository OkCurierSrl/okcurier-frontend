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
  googleMapsApiKey: 'AIzaSyCO77ldStnRCjfZ3EThONj8F8X6d3EVWvI',
  stripe: {
    publicKey: 'pk_test_51QUZAiCtGSZI6BdqgOh2KPCcCmIO0cozyLC6EjUGDmTIrobdq3uUyPv0SHCudkatbWUudLIukYeClf12KyfnOyUk00C3elrOe6',
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
