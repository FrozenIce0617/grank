// Remember to edit development.js as well!
const config = {
  graphqlEndpoint: 'https://staging.accuranker.com/graphql',
  graphqlWebSocketEndpoint: 'wss://staging.accuranker.com/graphql-ws',
  baseUrl: 'https://staging.accuranker.com',
  baseRootUrl: 'staging.accuranker.com',
  publicPath: '/static/app/dist/',
  basename: '/app',
  services: {
    sentry: 'https://a95bc572b3bb47018ec4ec57aca462b5@servers.sentry.accuranker.com/11',
  },
  intercomAppId: 'ramhfweh',
  recaptchaSitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  analyticsTrackingId: 'UA-47515230-2',
  analyticsDebug: false,
  gtmId: 'GTM-1',
  trialId: '28f4c5f6-bd3e-4968-a604-af1e1c680382',
  hotjarId: 12747,
  pipeDriveUrl: 'https://accuranker-sandbox-799348.pipedrive.com',
};

module.exports = config;
