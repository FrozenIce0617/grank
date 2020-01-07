// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import toast from 'Components/Toast';
import { t } from 'Utilities/i18n';
import { graphqlOK } from 'Utilities/underdash';
import { withRouter } from 'react-router-dom';

// actions
import { hideModal } from 'Actions/ModalAction';

// steps
import SelectGoogleAccount from '../Common/GoogleAccounts/SelectGoogleAccount';
import ConnectOAuthAccount from '../Common/ConnectOAuthAccount';
import SaveGoogleAccount from '../Common/GoogleAccounts/SaveGoogleAccount';
import GSCWebsite from './GSCWebsite';

import AccountWizard, { STEPS, withProps } from 'Components/Modal/Wizard/Base/Account';

import { linkToImportGSCWithDomains } from 'Components/Filters/LinkToDomain';
import { IntegrationOAuthProviders } from 'Types/Integration';

type Props = {
  domainId: string,
  refresh?: Function,
  oAuthResult?: Object,

  // automatic
  history: Object,
  domainData: Object,
  hideModal: Function,
  removeAccount: Function,
};

const GSC_WEBSITE = 'selectGSCWebsite';

class ConnectToGSC extends Component<Props> {
  handleRemoveAccount = () => {
    const { domainId, refresh } = this.props;
    this.props.removeAccount({ variables: { input: { domainId } } }).then(
      () => {
        toast.success(t('Account removed'));
        this.props.hideModal();
        refresh && refresh();
      },
      () => {
        toast.error(t('Failed to remove account'));
      },
    );
  };

  handleSelectWebsite = () => {
    const { domainId, refresh, domainData } = this.props;
    const country =
      domainData && domainData.domain ? domainData.domain.defaultCountrylocale.region : '';
    this.props.hideModal();
    refresh && refresh();
    this.props.history.push(linkToImportGSCWithDomains(domainId, { country }));
  };

  getConnectionId = data => {
    const source = data[STEPS.SELECT] || data[STEPS.SAVE];
    return source ? source.connectionId : null;
  };

  getGSCSteps = () => [
    {
      name: GSC_WEBSITE,
      title: t('Connect to Search Console'),
      component: ({ stepTo, data }) => (
        <GSCWebsite
          onBack={() => stepTo(STEPS.SELECT)}
          domainId={this.props.domainId}
          connectionId={this.getConnectionId(data) || ''} // TODO why do we need empty string when no connection?
          onSubmit={this.handleSelectWebsite}
        />
      ),
    },
  ];

  render() {
    if (!graphqlOK(this.props, ['oAuthResult'], ['oAuthResult'])) {
      return null;
    }

    const {
      domainId,
      oAuthResult,
      domainData: {
        domain: { googleOauthConnectionGsc: account },
      },
    } = this.props;
    return (
      <AccountWizard
        className="connect-to-gsc"
        step={!oAuthResult ? STEPS.SELECT : STEPS.SAVE}
        selectStep={{
          title: t('Select Google account'),
          component: ({ stepTo }) => (
            <SelectGoogleAccount
              account={account && account.id}
              onAdd={() => stepTo(STEPS.CONNECT)}
              onRemove={this.handleRemoveAccount}
              onSubmit={withProps(stepTo, GSC_WEBSITE)}
              onCancel={this.props.hideModal}
            />
          ),
        }}
        connectStep={{
          title: t('Add Google connection'),
          component: () => (
            <ConnectOAuthAccount
              modalParams={{
                modalType: 'ConnectToGSC',
                modalTheme: 'light',
                modalProps: {
                  domainId,
                  integration: IntegrationOAuthProviders.GOOGLE_ACCOUNT,
                },
              }}
              onCancel={this.props.hideModal}
            />
          ),
        }}
        saveStep={{
          title: t('Add Google connection'),
          component: ({ stepTo }) => (
            <SaveGoogleAccount
              onSubmit={withProps(stepTo, GSC_WEBSITE)}
              onCancel={withProps(stepTo, STEPS.CONNECT)}
              oAuthResult={oAuthResult}
            />
          ),
        }}
        postSteps={this.getGSCSteps()}
      />
    );
  }
}

const removeAccountQuery = gql`
  mutation connectToGSC_removeGoogleSearchConsoleAccount(
    $input: RemoveGoogleSearchConsoleAccountInput!
  ) {
    removeGoogleSearchConsoleAccount(input: $input) {
      domain {
        id
      }
    }
  }
`;

const domainQuery = gql`
  query connectToGSC_domain($id: ID!) {
    domain(id: $id) {
      id
      defaultCountrylocale {
        region
      }
      googleOauthConnectionGsc {
        id
      }
    }
  }
`;

export default compose(
  withRouter,
  connect(
    null,
    { hideModal },
  ),
  graphql(removeAccountQuery, { name: 'removeAccount' }),
  graphql(domainQuery, {
    name: 'domainData',
    options: props => ({
      variables: {
        id: props.domainId,
      },
    }),
  }),
)(ConnectToGSC);
