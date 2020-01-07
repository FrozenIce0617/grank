// @flow
import React, { Component } from 'react';
import { Container, Col } from 'reactstrap';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import { t } from 'Utilities/i18n/index';
import Button from 'Components/Forms/Button';
import { connect } from 'react-redux';
import './welcome.scss';
import { compose } from 'react-apollo';

type Props = {};

type State = {};

class Promotion extends Component<Props, State> {
  handleClick = () => {
    window.Intercom('showNewMessage', 'Please upgrade my account to the Orange Friday offer');
  };

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="welcome" />
        <Container className="generic-page welcome" fluid>
          <Col lg={4}>
            <p>
              {t(
                'We are launching AccuRanker Orange Friday Sale to help you track more keywords so you are ready to track organic rankings of your Black Friday campaigns.',
              )}
            </p>

            <p>{t('Upgrade your current plan, for FREE, for up to 3 months!')}</p>

            <p>
              {t(
                'Your upgrade is effective immediately but your pricing stays the same for the the current billing period and the following 2 months!',
              )}
            </p>

            <p>
              {t(
                'After this, continue with your amazing new plan at its usual price, or manually downgrade to return to your old one.',
              )}
            </p>

            <p>
              {t(
                'If you are on an annual plan we will adjust the remainder of the billing cycle accordingly.',
              )}
            </p>
            <p>
              {t(
                'Our current customers can upgrade to the next plan only once within the campaign period. This deal is only available for customers with the current plans ranging from 500 - 10,000 keywords.',
              )}
            </p>

            <p>
              {t(
                'This offer is only available for existing customers, from AccuRanker Orange Friday 9th November through to Black Friday 23rd November.',
              )}
            </p>

            <hr />

            <Button theme="orange" onClick={this.handleClick}>
              {t('Upgrade my account')}
            </Button>
          </Col>
        </Container>
      </DashboardTemplate>
    );
  }
}

export default Promotion;
