// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import { t } from 'Utilities/i18n';
import { graphqlOK } from 'Utilities/underdash';
import { withRouter } from 'react-router-dom';
import { sortBy } from 'lodash';

// actions
import { hideModal, showModal } from 'Actions/ModalAction';

// filters
import linkWithFilters from 'Components/Filters/linkWithFilters';
import { FilterAttribute, FilterValueType, FilterComparison } from 'Types/Filter';
import { IMPORT_UNIVERSAL_FILTER_SET } from 'Types/FilterSet';

// steps
import SelectOAuthProvider from 'Components/Modal/Content/AddAccount/SelectProvider';
import SelectOAuthAccount from './SelectOAuthAccount';
import ConnectOAuthAccount from '../Common/ConnectOAuthAccount';
import SaveGoogleAccount from '../Common/GoogleAccounts/SaveGoogleAccount';
import ManualProvidersList from './ManualProvidersList';

import AccountWizard, { STEPS, withProps } from 'Components/Modal/Wizard/Base/Account';

import type { IntegrationOAuthProvider } from 'Types/Integration';
import { IntegrationOAuthProviders } from 'Types/Integration';
import thirdPartyImport from 'Components/Modal/Content/AddKeywords/Import/ProvidersList/providersConfig';

type Props = {
  refresh?: Function,
  oAuthResult?: Object,
  integration: IntegrationOAuthProvider,
  isAdding: boolean,

  // automatic
  history: Object,
  hideModal: Function,
  showModal: Function,
};

const SELECT_PROVIDER = 'selectOAuthProviderStep';

class ConnectToOAuth extends Component<Props> {
  handleManualProviderSelect = provider => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalTheme: 'light',
      modalProps: {
        title: `Select ${provider.party} provider`,
        lockDuration: 0,
        description: `Please, contact support for importing from ${provider.party}`,
        showCancelLabel: false,
        confirmLabel: t('OK'),
        action: this.props.hideModal,
      },
    });
  };

  handleSelect = ({ connectionId }) => {
    const { refresh } = this.props;
    this.props.hideModal();
    refresh && refresh();
    this.props.history.push(
      linkWithFilters(
        '/keywords/import/universal',
        [
          {
            attribute: FilterAttribute.CONNECTION,
            type: FilterValueType.STRING,
            comparison: FilterComparison.CONTAINS,
            value: connectionId,
          },
        ],
        IMPORT_UNIVERSAL_FILTER_SET,
      ),
    );
  };

  getProviderSelectionSteps = () => [
    {
      name: SELECT_PROVIDER,
      title: 'Select connection provider',
      component: ({ stepTo }) => {
        return (
          <Fragment>
            <SelectOAuthProvider
              providers={[IntegrationOAuthProviders.HUBSPOT]}
              onSelect={withProps(stepTo, STEPS.SELECT)}
            />
            <ManualProvidersList
              providers={sortBy(thirdPartyImport(), 'party')}
              onSelect={this.handleManualProviderSelect}
            />
          </Fragment>
        );
      },
    },
  ];

  getProvider = (data: Object) => {
    const { integration } = this.props;
    return data[SELECT_PROVIDER] || integration;
  };

  getProviderName = (data: Object) => {
    const provider = this.getProvider(data);
    return provider ? provider.name : '';
  };

  render() {
    if (!graphqlOK(this.props, ['oAuthResult'], ['oAuthResult'])) {
      return null;
    }

    const { oAuthResult, integration, isAdding } = this.props;

    const addingStep = isAdding ? STEPS.CONNECT : STEPS.SELECT;
    const noAuthStep = integration ? addingStep : SELECT_PROVIDER;
    return (
      <AccountWizard
        className="connect-to-oauth"
        step={!oAuthResult ? noAuthStep : STEPS.SAVE}
        preSteps={this.getProviderSelectionSteps()}
        selectStep={{
          title: ({ data }) => t('Select %s account', this.getProviderName(data)),
          component: ({ stepTo, data }) => (
            <SelectOAuthAccount
              integration={this.getProvider(data)}
              onAdd={() => stepTo(STEPS.CONNECT)}
              onSubmit={props => this.handleSelect(props)}
              onCancel={this.props.hideModal}
            />
          ),
        }}
        connectStep={{
          title: ({ data }) => t('Add %s connection', this.getProviderName(data)),
          component: ({ data }) => (
            <ConnectOAuthAccount
              modalParams={{
                modalType: 'ConnectToOAuth',
                modalTheme: 'light',
                modalProps: {
                  isAdding,
                  integration: this.getProvider(data),
                },
              }}
              onCancel={this.props.hideModal}
            />
          ),
        }}
        saveStep={{
          title: ({ data }) => t('Add %s connection', this.getProviderName(data)),
          component: ({ stepTo }) => (
            <SaveGoogleAccount
              onSubmit={data => this.handleSelect(data)}
              onCancel={withProps(stepTo, STEPS.CONNECT)}
              oAuthResult={oAuthResult}
            />
          ),
        }}
      />
    );
  }
}

export default compose(
  withRouter,
  connect(
    null,
    { hideModal, showModal },
  ),
)(ConnectToOAuth);
