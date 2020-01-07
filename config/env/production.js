// Remember to edit development.js as well!
const config = {
  graphqlEndpoint: 'https://app.accuranker.com/graphql',
  graphqlWebSocketEndpoint: 'wss://app.accuranker.com/graphql-ws',
  baseUrl: 'https://app.accuranker.com',
  baseRootUrl: 'app.accuranker.com',
  publicPath: 'https://static.accuranker.com/app/dist/',
  basename: '/app',
  services: {
    sentry: 'https://2f8f594602a24270ada7a03982c46433@servers.sentry.accuranker.com/13',
  },
  intercomAppId: 'e0db10a7c5db6863136cef9e2b9fd077e1bb33f6',
  recaptchaSitekey: '6LcMpCQUAAAAAGoLDMwH1zGJoCrGhjuvazPVFyAz',
  analyticsTrackingId: 'UA-47515230-1',
  analyticsDebug: false,
  gtmId: 'GTM-K9GLDXR',
  trialId: '8ad49c7d-c55a-49b3-bb5d-0915bce4ec26',
  hotjarId: 12747,
  pipeDriveUrl: 'https://accuranker-db8d68.pipedrive.com',
};

module.exports = config;
