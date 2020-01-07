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
import SelectAdobeAccount from './SelectAdobeAccount';
import ConnectAdobeAccount from './ConnectAdobeAccount';
import Suite from './Suite';
import AddAdobeMarketingAccount from './AddAdobeMarketingAccount';

import AccountWizard, { STEPS, withProps } from 'Components/Modal/Wizard/Base/Account';

type Props = {
  domainId: string,
  refresh?: Function,
  isAdding?: boolean,

  // automatic
  domainData: Object,
  hideModal: Function,
  removeAccount: Function,
};

const ADOBE_SUITE = 'selectAdobeSuite';
const ADD_ADOBE_ACCOUNT = 'addAdobeAccount';

class ConnectToAdobe extends Component<Props> {
  handleAddAdobeAccount = () => {
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
    const source = data[STEPS.SELECT] || data[STEPS.CONNECT];
    return source ? source.connectionId : null;
  };

  getGASteps = () => [
    {
      name: ADOBE_SUITE,
      title: t('Select Adobe suite'),
      component: ({ stepTo, data }) => (
        <Suite
          connectionId={this.getConnectionId(data)}
          onSubmit={withProps(stepTo, ADD_ADOBE_ACCOUNT)}
          onBack={() => stepTo(STEPS.SELECT)}
        />
      ),
    },
    {
      name: ADD_ADOBE_ACCOUNT,
      title: t('Add Adobe Analytics account'),
      component: ({
        data,
        data: {
          [ADOBE_SUITE]: { suiteId },
        },
      }) => (
        <AddAdobeMarketingAccount
          domainId={this.props.domainId}
          connectionId={this.getConnectionId(data)}
          suiteId={suiteId}
          onSubmit={this.handleAddAdobeAccount}
          onCancel={this.props.hideModal}
        />
      ),
    },
  ];

  render() {
    if (!graphqlOK(this.props)) {
      return null;
    }

    const { isAdding, domainData } = this.props;

    const account =
      domainData && domainData.domain ? domainData.domain.adobeMarketingConnection : null;

    return (
      <AccountWizard
        className="connect-to-adobe"
        step={!isAdding ? STEPS.SELECT : STEPS.CONNECT}
        selectStep={{
          title: t('Select Adobe account'),
          component: ({ stepTo }) => (
            <SelectAdobeAccount
              accountId={account && account.id}
              onAdd={() => stepTo(STEPS.CONNECT)}
              onRemove={this.handleRemoveAccount}
              onSubmit={withProps(stepTo, ADOBE_SUITE)}
              onCancel={this.props.hideModal}
            />
          ),
        }}
        connectStep={{
          title: t('Add Adobe connection'),
          component: ({ stepTo }) => (
            <ConnectAdobeAccount
              onSubmit={!isAdding ? withProps(stepTo, ADOBE_SUITE) : this.handleAddAdobeAccount}
              onCancel={this.props.hideModal}
            />
          ),
        }}
        postSteps={this.getGASteps()}
      />
    );
  }
}

const removeAccountQuery = gql`
  mutation connectToAdobe_removeAdobeAnalyticsAccount($input: RemoveAdobeMarketingAccountInput!) {
    removeAdobeMarketingAccount(input: $input) {
      domain {
        id
      }
    }
  }
`;

const domainQuery = gql`
  query connectToAdobe_domain($id: ID!) {
    domain(id: $id) {
      id
      adobeMarketingConnection {
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
)(ConnectToAdobe);
