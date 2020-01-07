// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n';
import './report-public-link.scss';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

type Settings = {
  text: { value: string },
};

type Group = {
  id: string,
};

type Domain = {
  id: string,
};

type Props = {
  onLoad: Function,
  settings: Settings,
  isGroupReport: boolean,
  group?: Group,
  domain?: Domain,
  url: string,
  loading: boolean,
};

class LinkToReport extends React.Component<Props> {
  render() {
    const {
      loading,
      onLoad,
      url,
      settings: {
        text: { value },
      },
    } = this.props;
    if (loading) {
      return null;
    }
    onLoad();
    return (
      <div className="report-public-link">
        {t('Public report link:')}{' '}
        <a href={url} target="_blank">
          {value}
        </a>
      </div>
    );
  }
}

const linkForDomainQuery = gql`
  query linkToReport_linkForDomain($id: ID!) {
    domain(id: $id) {
      publicUrl
    }
  }
`;

const linkForGroupQuery = gql`
  query linkToReport_linkForGroup($id: ID!) {
    client(id: $id) {
      publicUrl
    }
  }
`;

export default compose(
  graphql(linkForDomainQuery, {
    skip: (props: Props) => props.isGroupReport,
    options: (props: Props) => {
      const { domain } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          id: domain && domain.id,
        },
      };
    },
    props: ({ ownProps, data: { loading, domain } }) => ({
      ...ownProps,
      loading,
      url: domain ? domain.publicUrl : '',
    }),
  }),
  graphql(linkForGroupQuery, {
    skip: (props: Props) => !props.isGroupReport,
    options: (props: Props) => {
      const { group } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          id: group && group.id,
        },
      };
    },
    props: ({ ownProps, data: { loading, client } }) => ({
      ...ownProps,
      loading,
      url: client ? client.publicUrl : '',
    }),
  }),
)(LinkToReport);
