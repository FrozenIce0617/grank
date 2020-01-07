// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import { noop } from 'lodash';

import FeedbackForm from './FeedbackForm';

import './feedback.scss';

type Props = {
  hideModal: Function,
  answerId: string,
  onAnswer: Function,
  onClose: Function,
};

class Feedback extends Component<Props> {
  static defaultProps = {
    onAnswer: noop,
  };

  handleClose = () => {
    const { onClose } = this.props;
    onClose();
    this.props.hideModal();
  };

  handleAnswer = () => {
    const { onAnswer } = this.props;
    onAnswer();
    this.props.hideModal();
  };

  render() {
    const { answerId } = this.props;
    return (
      <ModalBorder className="feedback" title={t('Share your feedback')} onClose={this.handleClose}>
        <FeedbackForm onAnswer={this.handleAnswer} answerId={answerId} />
      </ModalBorder>
    );
  }
}

export default compose(
  connect(
    null,
    { hideModal },
  ),
)(Feedback);
