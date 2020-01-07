// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import CancelPlanForm from './CancelPlanForm';

type Props = {
  hideModal: Function,
};

class CancelPlan extends Component<Props> {
  render() {
    return (
      <ModalBorder
        className="cancel-plan"
        title={t('Cancel my AccuRanker subscription')}
        onClose={this.props.hideModal}
      >
        <CancelPlanForm onClose={this.props.hideModal} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(CancelPlan);
