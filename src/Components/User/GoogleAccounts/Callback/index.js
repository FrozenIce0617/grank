// @flow
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { showModal } from 'Actions/ModalAction';
import { gaSetFromCallback, gaToggleRefetch, gaSetPassedState } from 'Actions/GoogleAccountsAction';

type Props = {
  showModal: Function,
  gaToggleRefetch: Function,
  gaDoFromCallback: Function,
  gaSetPassedState: Function,
} & RouteComponentProps<any>;

class GoogleAccountsCallback extends React.Component<Props> {
  UNSAFE_componentWillMount() {
    const { location } = this.props;
    const queryParams = new URLSearchParams(location.search);
    const oAuthResult = {
      error: queryParams.get('error'),
      code: queryParams.get('code'),
      state: queryParams.get('state'),
    };
    const oAuthData = JSON.parse(sessionStorage.getItem('oAuthData') || '{}');
    const { url: previousUrl, passedState } = oAuthData;

    this.props.gaSetFromCallback(true);

    if (passedState) {
      this.props.gaSetPassedState(passedState);
    }

    this.props.history.replace(previousUrl);

    // Open modal if we had modal before
    if (oAuthData.modalParams.modalType) {
      this.props.showModal({
        ...oAuthData.modalParams,
        modalProps: {
          ...oAuthData.modalParams.modalProps,
          refresh: () => this.props.gaToggleRefetch(),
          onError: () => this.props.gaSetFromCallback(false),
          oAuthResult,
        },
      });
    }
  }

  render() {
    return null;
  }
}

export default connect(
  null,
  { showModal, gaSetFromCallback, gaToggleRefetch, gaSetPassedState },
)(withRouter(GoogleAccountsCallback));
