// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Backdrop from '../Backdrop';
import ModalContentTypes from './Content';
import './modal.scss';

type Props = {
  config: Object,
};

class Modal extends Component<Props> {
  renderModalContent() {
    const { modalType, modalProps } = this.props.config;
    if (!modalType) return null;
    const SpecificModal = ModalContentTypes[modalType];
    return <SpecificModal {...modalProps} />;
  }

  render() {
    const { modalTheme } = this.props.config;
    const modalContent = this.renderModalContent();

    // never show the logo
    return (
      <Backdrop
        showLogo={false}
        shown={!!modalContent}
        className="modal-container"
        theme={modalTheme}
      >
        {modalContent}
      </Backdrop>
    );
  }
}

const mapStateToProps = state => ({
  config: state.modal,
});

export default connect(
  mapStateToProps,
  {},
)(Modal);
