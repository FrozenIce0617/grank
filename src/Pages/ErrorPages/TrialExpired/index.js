import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import { Link } from 'react-router-dom';
import TopNavbar from 'Pages/Layout/DashboardTemplate/TopNavbar';

import '../error-page.scss';

class TrialExpired extends Component {
  render() {
    return (
      <div>
        <TopNavbar />
        <Container className="error-page">
          <h1 className="title">{t('Trial Expired')}</h1>
          <p className="description">
            {t('If you would like to continue using AccuRanker, please subscribe to a plan.')}
          </p>
          <Button tag={Link} to="/billing/package/select">
            {t('Select plan')}
          </Button>
        </Container>
      </div>
    );
  }
}

export default TrialExpired;
