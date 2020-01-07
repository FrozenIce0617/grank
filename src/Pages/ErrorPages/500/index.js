/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import Raven from 'raven-js';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import { withRouter } from 'react-router';
import { t } from 'Utilities/i18n';
import Icon from 'icons/500.svg';
import Button from 'Components/Forms/Button';
import { initLanguage } from 'Utilities/i18n';
import { store } from 'Store';
import '../error-page.scss';

class SystemError extends Component {
  constructor(props) {
    super(props);
    initLanguage();

    this.state = {
      userReceived: false,
    };
  }

  componentDidMount() {
    store.subscribe(() => {
      const { user } = store.getState();
      if (!this.state.userReceived && user.email) {
        const {
          match: { params },
        } = this.props;
        const eventId = params ? params.eventId : null;
        Raven.showReportDialog({
          eventId,
          user: !user.isImpersonating
            ? {
                email: user.email,
                name: user.fullName,
              }
            : {},
        });
        this.setState({
          userReceived: true,
        });
      }
    });
  }

  render() {
    return (
      <Container className="error-page">
        <img src={Icon} />
        <h1 className="title">{t('Internal Server Error')}</h1>
        <p className="description">
          {t(
            'Unfortunately, the requested page could not be reached. Please, try again later, or return to dashboard.',
          )}
        </p>
        <Button tag={Link} to="/">
          {t('Go to dashboard')}
        </Button>
      </Container>
    );
  }
}

export default withRouter(SystemError);
