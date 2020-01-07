// @flow
import config from 'config';
import React, { Component } from 'react';
import { Container, Col } from 'reactstrap';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import { t } from 'Utilities/i18n/index';
import Button from 'Components/Forms/Button';
import { connect } from 'react-redux';
import { showModal } from 'Actions/ModalAction';
import './welcome.scss';
import { hotjar } from 'react-hotjar';
import { withGTM } from 'react-tag-manager';
import { compose } from 'react-apollo';
import ReactGA from 'react-ga';

type Props = {
  showModal: Function,
  user: Object,
};

class Welcome extends Component<Props> {
  componentDidMount() {
    hotjar.initialize(config.hotjarId, 6);

    const { GTM, user } = this.props;

    GTM.api.trigger({
      event: 'register',
    });

    ReactGA.plugin.require('ecommerce');
    ReactGA.plugin.execute('ecommerce', 'addItem', {
      id: `user-${user.id}`,
      name: 'Register',
      sku: '--',
      price: 0,
      category: 'AccuRanker',
      quantity: 1,
    });
    ReactGA.plugin.execute('ecommerce', 'addTransaction', {
      id: `user-${user.id}`,
      revenue: 0,
    });
    ReactGA.plugin.execute('ecommerce', 'send');
  }

  handleOpenHubspot = () => {
    const { user } = this.props;
    const newWin = window.open(user.organization.salesManager.meetingLink, '_blank');
    newWin.focus();
  };

  handleAddDomain = () => {
    this.props.showModal({
      modalType: 'AddDomain',
      modalTheme: 'light',
      modalProps: {
        refresh: () => {},
      },
    });
  };

  render() {
    const { user } = this.props;
    const showHubspot =
      user.organization &&
      user.organization.salesManager &&
      user.organization.salesManager.meetingLink;

    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu hidePeriodFilter menuFor="welcome" />
        <Container className="generic-page welcome" fluid>
          <Col lg={5}>
            <p>{t('Welcome to AccuRanker!')}</p>

            <p>
              {t(
                'Thanks for signing up to AccuRanker. We hope you´ll enjoy every second of using AccuRanker.',
              )}
            </p>

            <p>
              {t(
                'We´ve provided some demo domains for you, so you can get a sense of how AccuRanker looks with historic data, feel free to delete these anytime you want.',
              )}
            </p>

            <p>{t('To get familiar with our tool, we recommend you watch the video below.')}</p>

            <iframe
              src="https://www.youtube.com/embed/E6dYPZlir_U"
              width="560"
              height="315"
              frameBorder="0"
              allowFullScreen
            />

            <p>
              {t(
                'If you have any questions or feedback, feel free to reach out to our customer success team, using the chat icon in the bottom right corner.',
              )}
            </p>

            <p>
              {t('You can also seek guidance in our help center:')}&nbsp;<a href="https://www.accuranker.com/help">
                www.accuranker.com/help
              </a>
            </p>

            <p>
              {t(
                'If you prefer a more a personal approach, we will be happy to provide a 30 minute best practice session where we can show you how to get the most out of AccuRanker (Don´t worry, it´s completely free!).',
              )}
            </p>

            <hr />

            <div className="welcome-actions">
              <Button theme="orange" onClick={this.handleAddDomain}>
                {t('Add domain')}
              </Button>
              {showHubspot && (
                <Button
                  theme="orange"
                  additionalClassName="book-a-demo"
                  onClick={this.handleOpenHubspot}
                >
                  {t('Book a demo')}
                </Button>
              )}
            </div>
          </Col>
        </Container>
      </DashboardTemplate>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

export default compose(
  withGTM,
  connect(
    mapStateToProps,
    { showModal },
  ),
)(Welcome);
