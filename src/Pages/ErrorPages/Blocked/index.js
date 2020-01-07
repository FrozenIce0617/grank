/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import { withRouter } from 'react-router';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import { initLanguage } from 'Utilities/i18n';
import '../error-page.scss';
import { connect } from 'react-redux';
import { showModal } from '../../../Actions/ModalAction';

class BlockedError extends Component {
  constructor(props) {
    super(props);
    initLanguage();
  }

  render() {
    const {
      user: {
        organization: {
          accountBlockedReason: { title, message },
        },
      },
    } = this.props;
    return (
      <Container className="error-page">
        <h1 className="title">{title}</h1>
        <p className="description">{message}</p>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

export default withRouter(
  connect(
    mapStateToProps,
    null,
  )(BlockedError),
);
