// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';

type Props = {
  title: string,
  content: any,
  // Auto
  hideModal: Function,
};

class Integration extends Component<Props> {
  render() {
    return (
      <ModalBorder className="integration" title={this.props.title} onClose={this.props.hideModal}>
        {this.props.content}
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(Integration);
