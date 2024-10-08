// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
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
  production: false,
  auth: {
    domain,
    clientId,
    authorizationParams: {
      ...(audience && audience !== 'https://okcurier-staging.eu.auth0.com/api/v2/' ? {audience} : null),
      redirect_uri: 'http://localhost:4200/',
    },
    errorPath,
  },
  httpInterceptor: {
    allowedList: [`${apiUri}/*`],
  },
  apiUrl: 'http://localhost:8080'
};
