// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import CopyIcon from 'icons/copy.svg?inline';
import copy from 'copy-to-clipboard';
import { UncontrolledTooltip } from 'reactstrap';
import { graphqlError, graphqlLoading } from 'Utilities/underdash';

import './public-report-options.scss';
import Button from 'Components/Forms/Button';

const publicReportType = 4;
const publicReportButtonId = 'copy-to-clipboard-public-report';

type Props = {
  reportType: Object,
  domainId?: string,
  domainPublicUrlData: Object,
  requestDomainPublicUrl: Function,
  groupId?: string,
  clientPublicUrlData: Object,
  requestClientPublicUrl: Function,
};

type State = {
  publicUrl: string,
};

class PublicReportOptions extends Component<Props, State> {
  input: ?HTMLInputElement;
  state = {
    publicUrl: '',
  };

  componentDidMount() {
    this.getStateFromProps();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.getStateFromProps(nextProps);
  }

  getStateFromProps(nextProps) {
    if (this.state.publicUrl) return;
    const props = nextProps || this.props;
    if (graphqlError({ ...props }) || graphqlLoading({ ...props })) return t('Loading URL...');
    const { domainId, domainPublicUrlData, groupId, clientPublicUrlData } = props;
    let publicUrl = '';
    if (domainId) publicUrl = domainPublicUrlData.domain.publicUrl;
    if (groupId) publicUrl = clientPublicUrlData.client.publicUrl;
    this.setState(() => ({
      publicUrl,
    }));
  }

  handleCopy = () => {
    const value = this.input ? this.input.value : '';
    copy(value);
  };

  handleReset = () => {
    const { domainId, requestDomainPublicUrl, groupId, requestClientPublicUrl } = this.props;
    if (domainId) {
      requestDomainPublicUrl({
        variables: {
          id: domainId,
        },
      }).then(({ data: { resetViewkeyDomain: { domain: { publicUrl } } } }) => {
        this.setState(() => ({
          publicUrl,
        }));
      });
    } else if (groupId) {
      requestClientPublicUrl({
        variables: {
          id: groupId,
        },
      }).then(({ data: { resetViewkeyClient: { client: { publicUrl } } } }) => {
        this.setState(() => ({
          publicUrl,
        }));
      });
    }
  };

  renderLinkInput = () => {
    const url = this.state.publicUrl;
    return <input value={url} disabled ref={ref => (this.input = ref)} />;
  };

  render() {
    const { reportType } = this.props;
    if (!reportType || (reportType && reportType.value !== publicReportType)) return null;
    return (
      <div className="public-report-options">
        <div className="form-label">{t('Public link')}</div>
        <div className="public-report-options__input-container">
          {this.renderLinkInput()}
          <span className="copy-button" onClick={this.handleCopy} id={publicReportButtonId}>
            <CopyIcon />
          </span>
        </div>
        <p>{t('Copy this link and give it to your client.')}</p>
        <Button theme="red" onClick={this.handleReset}>
          {t('Reset public link')}
        </Button>
        <p>
          {t(
            'Click this to reset the public report link. By doing so old links will stop working!',
          )}
        </p>
        <UncontrolledTooltip
          delay={{ show: 0, hide: 0 }}
          placement="top"
          target={publicReportButtonId}
        >
          {t('Copy to clipboard')}
        </UncontrolledTooltip>
      </div>
    );
  }
}

const domainPublicUrlQuery = gql`
  query publicReportOptions_domainPublicUrlQuery($id: ID!) {
    domain(id: $id) {
      id
      publicUrl
    }
  }
`;

const requestDomainPublicUrlMutation = gql`
  mutation publicReportOptions_requestDomainPublicUrlMutation($id: ID!) {
    resetViewkeyDomain(id: $id) {
      domain {
        publicUrl
      }
    }
  }
`;

const clientPublicUrlQuery = gql`
  query publicReportOptions_clientPublicUrlQuery($id: ID!) {
    client(id: $id) {
      id
      publicUrl
    }
  }
`;

const requestClientPublicUrlMutation = gql`
  mutation publicReportOptions_requestClientPublicUrlMutation($id: ID!) {
    resetViewkeyClient(id: $id) {
      client {
        publicUrl
      }
    }
  }
`;

export default compose(
  graphql(domainPublicUrlQuery, {
    name: 'domainPublicUrlData',
    options: props => {
      return {
        fetchPolicy: 'network-only',
        variables: {
          id: props.domainId,
        },
      };
    },
    skip: props => !props.domainId,
  }),
  graphql(requestDomainPublicUrlMutation, { name: 'requestDomainPublicUrl' }),
  graphql(clientPublicUrlQuery, {
    name: 'clientPublicUrlData',
    options: props => {
      return {
        fetchPolicy: 'network-only',
        variables: {
          id: props.groupId,
        },
      };
    },
    skip: props => !props.groupId,
  }),
  graphql(requestClientPublicUrlMutation, { name: 'requestClientPublicUrl' }),
)(PublicReportOptions);
