const devName = process.env.DEV_NAME;

console.log(`Building dev-local for ${devName}`);

const config = {
  graphqlEndpoint: `http://dev.${devName}.accuranker.com/graphql`,
  graphqlWebSocketEndpoint: `ws://dev.${devName}.accuranker.com/graphql-ws`,
  baseUrl: `http://dev.${devName}.accuranker.com`,
  publicPath: `http://localhost:8080/`,
  basename: '/app',
  credentials: 'include',
  services: {
    sentry: 'http://a95bc572b3bb47018ec4ec57aca462b5@servers.sentry.accuranker.com/11',
  },
  intercomAppId: 'ramhfweh',
  recaptchaSitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  analyticsTrackingId: 'UA-47515230-2',
  analyticsDebug: true,
  gtmId: 'GTM-1',
  trialId: '28f4c5f6-bd3e-4968-a604-af1e1c680382',
  hotjarId: 12747,
  pipeDriveUrl: 'https://accuranker-sandbox-799348.pipedrive.com',
};

module.exports = config;
