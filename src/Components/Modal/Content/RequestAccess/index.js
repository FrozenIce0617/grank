// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import RequestAccessForm from './RequestAccessForm';
import { t } from 'Utilities/i18n';

type Props = {
  hideModal: Function,
  refresh: Function,
};

class RequestAccess extends Component<Props> {
  static defaultProps = {
    refresh: () => {},
  };

  render() {
    const requestAccessInitialValues = {
      sendCopyToSelf: true,
      subject: t('Request for access to your AccuRanker account'),
    };
    return (
      <ModalBorder
        className="request-access"
        title={t('Request Access')}
        onClose={this.props.hideModal}
      >
        <RequestAccessForm
          initialValues={requestAccessInitialValues}
          onClose={this.props.hideModal}
          refresh={this.props.refresh}
        />
      </ModalBorder>
    );
  }
}

export default compose(
  connect(
    null,
    { hideModal },
  ),
)(RequestAccess);
