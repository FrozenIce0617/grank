// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export type DomainInfo = {
  id: string,
  domain: string,
  firstRefreshAt: Date,
  lastRefreshAt: Date,
  lastManualRefreshAt: Date,
  canRefresh: boolean,
  canUpdate: boolean,
  isGAConnected: boolean,
  isGCConnected: boolean,
  isAdobeMarketingConnected: boolean,
  shareOfVoicePercentage: any,
};

const domainQuery = gql`
  query generic_domainInfo($id: ID!) {
    domain(id: $id) {
      id
      domain
      canRefresh
      canUpdate
      lastRefreshAt
      lastManualRefreshAt
      firstRefreshAt
      shareOfVoicePercentage
      googleOauthConnectionGa {
        id
      }
      googleOauthConnectionGsc {
        id
      }
      adobeMarketingConnection {
        id
      }
    }
  }
`;

const queryDomainInfo = () => {
  const optionsParser = props => ({
    variables: {
      id: props.domainId,
    },
  });
  return graphql(domainQuery, {
    options: optionsParser,
    props: ({ ownProps, data }) => {
      const { domain, refetch } = data;
      let domainInfo: DomainInfo;
      if (domain) {
        const firstRefreshAt = new Date(domain.firstRefreshAt);
        const lastRefreshAt = new Date(domain.lastRefreshAt);
        const lastManualRefreshAt = new Date(domain.lastManualRefreshAt);
        domainInfo = {
          id: domain.id,
          domain: domain.domain,
          firstRefreshAt,
          lastRefreshAt,
          lastManualRefreshAt,
          canRefresh: domain.canRefresh,
          canUpdate: domain.canUpdate,
          isAdobeMarketingConnected:
            domain.adobeMarketingConnection && domain.adobeMarketingConnection.id,
          isGAConnected: domain.googleOauthConnectionGa && domain.googleOauthConnectionGa.id,
          isGCConnected: domain.googleOauthConnectionGsc && domain.googleOauthConnectionGsc.id,
          shareOfVoicePercentage: domain.shareOfVoicePercentage,
        };
      }
      return {
        ...ownProps,
        domainInfo,
        refetchDomainInfo: refetch,
        domainData: data,
      };
    },
    skip: props => !props.domainId,
  });
};

export default queryDomainInfo;
