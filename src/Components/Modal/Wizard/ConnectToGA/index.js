// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import toast from 'Components/Toast';
import { t } from 'Utilities/i18n';
import { graphqlOK } from 'Utilities/underdash';

// actions
import { hideModal } from 'Actions/ModalAction';

// steps
import SelectGoogleAccount from '../Common/GoogleAccounts/SelectGoogleAccount';
import ConnectOAuthAccount from '../Common/ConnectOAuthAccount';
import SaveGoogleAccount from '../Common/GoogleAccounts/SaveGoogleAccount';
import Account from './Account';
import Profile from './Profile';
import Property from './Property';
import AddGAAccount from './AddGAAccount';

import AccountWizard, { STEPS, withProps } from 'Components/Modal/Wizard/Base/Account';

import { IntegrationOAuthProviders } from 'Types/Integration';

type Props = {
  domainId?: string,
  refresh?: Function,
  oAuthResult?: Object,
  isAdding?: boolean,

  // automatic
  domainData: Object,
  hideModal: Function,
  removeAccount: Function,
};

const ACCOUNT = 'selectAccountStep';
const PROPERTY = 'selectPropertyStep';
const PROFILE = 'selectProfileStep';
const ADD_GA = 'addGAAccount';

class ConnectToGA extends Component<Props> {
  handleAddGAAccount = () => {
    const { refresh } = this.props;
    this.props.hideModal();
    refresh && refresh();
  };

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

  getConnectionId = data => {
    const source = data[STEPS.SELECT] || data[STEPS.SAVE];
    return source ? source.connectionId : null;
  };

  getGASteps = () => [
    {
      name: ACCOUNT,
      title: t('Select account'),
      component: ({ stepTo, data }) => (
        <Account
          connectionId={this.getConnectionId(data)}
          onSubmit={withProps(stepTo, PROPERTY)}
          onBack={() => stepTo(STEPS.SELECT)}
        />
      ),
    },
    {
      name: PROPERTY,
      title: t('Select property'),
      component: ({
        stepTo,
        data,
        data: {
          [ACCOUNT]: { accountId },
        },
      }) => (
        <Property
          connectionId={this.getConnectionId(data)}
          accountId={accountId}
          onSubmit={withProps(stepTo, PROFILE)}
          onBack={() => stepTo(ACCOUNT)}
        />
      ),
    },
    {
      name: PROFILE,
      title: t('Select profile'),
      component: ({
        stepTo,
        data,
        data: {
          [ACCOUNT]: { accountId },
          [PROPERTY]: { propertyId },
        },
      }) => (
        <Profile
          connectionId={this.getConnectionId(data)}
          accountId={accountId}
          propertyId={propertyId}
          onSubmit={withProps(stepTo, ADD_GA)}
          onBack={() => stepTo(PROPERTY)}
        />
      ),
    },
    {
      name: ADD_GA,
      title: t('Add Google analytics account'),
      component: ({
        data,
        data: {
          [ACCOUNT]: { accountId },
          [PROPERTY]: { propertyId },
          [PROFILE]: { profileId },
        },
      }) => (
        <AddGAAccount
          domainId={this.props.domainId}
          connectionId={this.getConnectionId(data)}
          accountId={accountId}
          propertyId={propertyId}
          profileId={profileId}
          onSubmit={this.handleAddGAAccount}
          onCancel={this.props.hideModal}
        />
      ),
    },
  ];

  render() {
    if (!graphqlOK(this.props, ['oAuthResult'], ['oAuthResult'])) {
      return null;
    }

    const { domainId, oAuthResult, isAdding, domainData } = this.props;

    const account =
      domainData && domainData.domain ? domainData.domain.googleOauthConnectionGa : null;

    const noOAuthStep = !isAdding ? STEPS.SELECT : STEPS.CONNECT;
    return (
      <AccountWizard
        className="connect-to-ga"
        step={!oAuthResult ? noOAuthStep : STEPS.SAVE}
        selectStep={{
          title: t('Select Google account'),
          component: ({ stepTo }) => (
            <SelectGoogleAccount
              account={account && account.id}
              onAdd={() => stepTo(STEPS.CONNECT)}
              onRemove={this.handleRemoveAccount}
              onSubmit={withProps(stepTo, ACCOUNT)}
              onCancel={this.props.hideModal}
            />
          ),
        }}
        connectStep={{
          title: t('Add Google connection'),
          component: () => (
            <ConnectOAuthAccount
              modalParams={{
                modalType: 'ConnectToGA',
                modalTheme: 'light',
                modalProps: {
                  domainId,
                  integration: IntegrationOAuthProviders.GOOGLE_ACCOUNT,
                  isAdding,
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
              onSubmit={!isAdding ? withProps(stepTo, ACCOUNT) : this.handleAddGAAccount}
              onCancel={withProps(stepTo, STEPS.CONNECT)}
              oAuthResult={oAuthResult}
            />
          ),
        }}
        postSteps={this.getGASteps()}
      />
    );
  }
}

const removeAccountQuery = gql`
  mutation connectToGA_removeGoogleAnalyticsAccount($input: RemoveGoogleAnalyticsAccountInput!) {
    removeGoogleAnalyticsAccount(input: $input) {
      domain {
        id
      }
    }
  }
`;

const domainQuery = gql`
  query connectToGA_domain($id: ID!) {
    domain(id: $id) {
      id
      googleOauthConnectionGa {
        id
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { hideModal },
  ),
  graphql(removeAccountQuery, { name: 'removeAccount' }),
  graphql(domainQuery, {
    name: 'domainData',
    skip: props => !props.domainId,
    options: props => ({
      variables: {
        id: props.domainId,
      },
    }),
  }),
)(ConnectToGA);
