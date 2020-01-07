// @flow
import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';
import { t, tct } from 'Utilities/i18n';
import { graphqlOK } from 'Utilities/underdash';

// actions
import { showModal, hideModal } from 'Actions/ModalAction';
import { updateUserGoogleConnections } from 'Actions/UserAction';

// components
import AccountWizard, { STEPS, withProps } from 'Components/Modal/Wizard/Base/Account';
import Button from 'Components/Forms/Button';

// steps
import ConnectOAuthAccount from '../Common/ConnectOAuthAccount';
import SaveGoogleAccount from '../Common/GoogleAccounts/SaveGoogleAccount';
import ConnectedAccount from '../Common/ConnectedAccount';

import { IntegrationOAuthProviders } from 'Types/Integration';

type Props = {
  domainId: string,
  refresh?: Function,
  lastState: Object,
  nextModalType: boolean,
  oAuthResult: Object,
  message: string, // message that connect to drive is required for some actions (like generating reports)

  // automatic
  featureAdvancedMetrics: boolean,
  showModal: Function,
  hideModal: Function,
  updateUserGoogleConnections: Function,
};

class ConnectToDrive extends Component<Props> {
  handleSelectAccount = (stepTo, { connectionId }) => {
    const { refresh, domainId, nextModalType, lastState } = this.props;
    refresh && refresh();

    this.props.updateUserGoogleConnections([
      {
        id: connectionId,
      },
    ]);

    if (nextModalType) {
      this.props.showModal({
        modalType: nextModalType,
        modalTheme: 'light',
        modalProps: {
          lastState,
          domainId,
          submitOnInit: true,
        },
      });
    } else if (!lastState) {
      stepTo(STEPS.CONNECTED);
    } else {
      this.props.hideModal();
    }
  };

  wrapContent = content => {
    const { message, featureAdvancedMetrics } = this.props;
    return (
      <Fragment>
        {message && <p className="alert alert-info">{message}</p>}

        {featureAdvancedMetrics ? (
          content
        ) : (
          <div>
            <p className="alert alert-warning">
              {tct(
                'This feature is part of the [link1:Professional], [link2:Expert] and [link3:Enterprise] plans.',
                {
                  link1: <Link to={'/billing/package/select'} />,
                  link2: <Link to={'/billing/package/select'} />,
                  link3: <Link to={'/billing/package/select'} />,
                },
              )}
            </p>

            <div className="form-actions">
              <Button theme="orange" onClick={this.props.hideModal}>
                {t('Close')}
              </Button>
            </div>
          </div>
        )}
      </Fragment>
    );
  };

  render() {
    if (!graphqlOK(this.props, ['oAuthResult'], ['oAuthResult'])) {
      return null;
    }

    const { domainId, oAuthResult, lastState, nextModalType } = this.props;
    return (
      <AccountWizard
        className="connect-to-drive"
        step={!oAuthResult ? STEPS.CONNECT : STEPS.SAVE}
        contentWrapper={this.wrapContent}
        connectStep={{
          title: t('Add Google Drive Account'),
          component: () => (
            <ConnectOAuthAccount
              modalParams={{
                modalType: 'ConnectToDrive',
                modalTheme: 'light',
                modalProps: {
                  domainId,
                  integration: IntegrationOAuthProviders.GOOGLE_DRIVE,
                  lastState,
                  nextModalType,
                },
              }}
              onCancel={this.props.hideModal}
              passedState={!nextModalType ? lastState : null}
              initialValues={{
                description: 'Drive Account',
              }}
            />
          ),
        }}
        saveStep={{
          title: t('Add Google Drive Account'),
          component: ({ stepTo }) => (
            <SaveGoogleAccount
              onSubmit={props => this.handleSelectAccount(stepTo, props)}
              onCancel={withProps(stepTo, STEPS.CONNECT)}
              oAuthResult={oAuthResult}
            />
          ),
        }}
        connectedStep={{
          title: t('Connected Google Drive Account'),
          component: () => (
            <ConnectedAccount
              onSubmit={this.props.hideModal}
              message={t(
                'Your Google Drive account has been connected, you can now create reports that are directly saved in Google Drive.',
              )}
            />
          ),
        }}
      />
    );
  }
}

const mapStateToProps = state => ({
  featureAdvancedMetrics: state.user.organization.activePlan.featureAdvancedMetrics,
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    { showModal, hideModal, updateUserGoogleConnections },
  ),
)(ConnectToDrive);
