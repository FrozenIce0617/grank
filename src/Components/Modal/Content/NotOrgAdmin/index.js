// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';

type Props = {
  hideModal: Function,
};

class NotOrgAdmin extends Component<Props> {
  render() {
    return (
      <ModalBorder
        className="not-org-admin"
        title={t('Only admins can upgrade')}
        onClose={this.props.hideModal}
      >
        {t('You need to contact your organization admin to upgrade the account.')}
      </ModalBorder>
    );
  }
}

export default compose(
  connect(
    null,
    { hideModal },
  ),
)(NotOrgAdmin);
