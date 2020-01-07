//@flow
export type IntegrationOAuthProvider = {
  type: string,
  name: string,
};

export type IntegrationSimpleProvider = {
  type: string,
  name: string,
};

export const IntegrationOAuthProviders = ({
  GOOGLE_ACCOUNT: {
    type: '1',
    name: 'Google',
  },
  GOOGLE_DRIVE: {
    type: '2',
    name: 'Google Drive',
  },
  HUBSPOT: {
    type: '3',
    name: 'HubSpot',
  },
}: { [id: string]: IntegrationOAuthProvider });

export type Integration = IntegrationOAuthProvider | IntegrationSimpleProvider;

export const Integrations = ({
  ...IntegrationOAuthProviders,
  ADOBE: {
    type: 'adobe',
    name: 'Adobe',
  },
}: { [id: string]: IntegrationOAuthProvider | IntegrationSimpleProvider });
