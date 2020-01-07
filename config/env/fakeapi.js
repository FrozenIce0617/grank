// Remember to edit production.js as well!
const config = {
  graphqlEndpoint: 'http://localhost:9002/graphql',
  graphqlWebSocketEndpoint: 'ws://localhost:9002/graphql-ws',
  baseUrl: 'http://localhost:8080',
  baseRootUrl: 'localhost.dk',
  publicPath: 'http://localhost:8080/',
  basename: '/app',
  services: {
    sentry: 'https://a95bc572b3bb47018ec4ec57aca462b5@servers.sentry.accuranker.com/11',
  },
  intercomAppId: 'ramhfweh',
  recaptchaSitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  analyticsTrackingId: 'UA-47515230-2',
  analyticsDebug: true,
  gtmId: 'GTM-1',
  trialId: '3648ae7e-ef15-4cf3-be05-04f211f4a133',
  hotjarId: 12747,
  pipeDriveUrl: 'https://accuranker-sandbox-799348.pipedrive.com',
};

module.exports = config;
