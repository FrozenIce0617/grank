// Remember to edit production.js as well!
const config = {
  graphqlEndpoint: 'http://localhost.dk:8000/graphql',
  graphqlWebSocketEndpoint: 'ws://localhost.dk:8000/graphql-ws',
  baseUrl: 'http://localhost.dk:8000',
  baseRootUrl: 'localhost.dk',
  publicPath: 'http://localhost.dk:8080/',
  basename: '/app',
  services: {
    sentry: 'https://a95bc572b3bb47018ec4ec57aca462b5@servers.sentry.accuranker.com/11',
  },
  intercomAppId: 'ramhfweh',
  recaptchaSitekey: '6LerFzYUAAAAAPxjK6A4lvnQU679X4_5eY59VXrH',
  analyticsTrackingId: 'UA-47515230-2',
  analyticsDebug: true,
  gtmId: 'GTM-1',
  trialId: '29af4faa-2c58-43b4-bda1-245807969221',
  hotjarId: 12747,
  pipeDriveUrl: 'https://accuranker-sandbox-799348.pipedrive.com',
};

module.exports = config;
