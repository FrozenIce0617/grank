import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { t } from 'Utilities/i18n';
import Icon from 'icons/404.svg';
import Button from 'Components/Forms/Button';
import { Link } from 'react-router-dom';
import { initLanguage } from 'Utilities/i18n';
import '../error-page.scss';

class NotFound extends Component {
  constructor() {
    super();
    initLanguage();
  }

  render() {
    return (
      <Container className="error-page">
        <img src={Icon} />
        <h1 className="title">{t('Error')}</h1>
        <p className="description">
          {t(
            'Unfortunately, the requested page could not be found. Please, try another URL, or return to dashboard.',
          )}
        </p>
        <Button tag={Link} to="/">
          {t('Go to dashboard')}
        </Button>
      </Container>
    );
  }
}

export default NotFound;
