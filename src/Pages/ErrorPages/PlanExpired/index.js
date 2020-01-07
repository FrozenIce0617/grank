// @flow
import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { t, tct } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import underdash from 'Utilities/underdash';
import FormatNumber from 'Components/FormatNumber';
import TopNavbar from 'Pages/Layout/DashboardTemplate/TopNavbar';
import '../error-page.scss';
import { isEmpty } from 'lodash';
import { showModal } from 'Actions/ModalAction';

type Props = {
  billingQuery: Object,
  retryMutation: Function,
  user: Object,
  showModal: Function,
};

type State = {
  error: string,
  isLoading: boolean,
};

class PlanExpired extends Component<Props, State> {
  state = {
    error: '',
    isLoading: false,
  };

  handleRetry = () => {
    this.setState({ isLoading: true });

    const unexpectedErrorMessage = t(
      'We were unable to re-active your plan. Please contact support.',
    );

    return this.props.retryMutation().then(
      ({ data, errors }) => {
        if (!isEmpty(errors)) {
          this.setState({
            error: unexpectedErrorMessage,
            isLoading: false,
          });
          return;
        }

        if (data.reactivate.success) {
          window.location = '/';
        } else {
          this.setState({
            error: data.reactivate.error || unexpectedErrorMessage,
            isLoading: false,
          });
        }
      },
      () =>
        this.setState({
          error: unexpectedErrorMessage,
          isLoading: false,
        }),
    );
  };

  handleOpenHubspot = () => {
    const { user } = this.props;
    const newWin = window.open(user.organization.salesManager.meetingLink, '_blank');
    newWin.focus();
  };

  handleShowInvoices = () => {
    const { organization } = this.props.billingQuery.user;
    this.props.showModal({
      modalType: 'Invoices',
      modalProps: {
        organizationId: organization.id,
      },
    });
  };

  render() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return null;
    }

    const { isLoading } = this.state;
    const organization = this.props.billingQuery.user.organization;

    const { user } = this.props;
    const showHubspot =
      user.organization &&
      user.organization.salesManager &&
      user.organization.salesManager.meetingLink;

    return (
      <div>
        <TopNavbar />
        <Container className="error-page">
          <h1 className="title">{t('Your Current Plan Has Expired')}</h1>

          <div className="error-box">
            {this.state.error != '' && (
              <p className="alert alert-danger">
                <strong>{t('Payment failed')}</strong>
                <br />
                {this.state.error}
              </p>
            )}
            {isLoading && (
              <p className="alert alert-info">{t('Performing payment, please wait...')}</p>
            )}
            <p className="alert alert-warning">
              {t('Your %s plan has expired.', organization.previousPlan.name)}
            </p>

            <p>
              {tct(
                'You can either re-active your plan at the current rate ([price] every [months] months), or choose a new plan using the options below. ',
                {
                  price: (
                    <FormatNumber currency={organization.previousPlan.currency}>
                      {organization.previousPlan.calculatePrice}
                    </FormatNumber>
                  ),
                  months: organization.previousPlan.billingCycleInMonths,
                },
              )}
              {tct(
                'Also you can update your payment details [paymentMethodLink:here] or billing info [billingInfoLink:here].',
                {
                  billingInfoLink: <Link to="/billing/paymentinfo" />,
                  paymentMethodLink: <Link to="/billing/paymentmethod" />,
                },
              )}
            </p>
            <p>
              {t(
                'If you have any questions or want to discuss your plan please contact us via our support function.',
              )}
            </p>

            <hr />

            <Button
              additionalClassName="mr-2"
              onClick={() => (window.location = '/app/billing/package/select')}
              disabled={isLoading}
            >
              {t('Choose a new plan')}
            </Button>
            {showHubspot && (
              <Button
                additionalClassName="mr-2"
                onClick={this.handleOpenHubspot}
                disabled={isLoading}
              >
                {t('Book a demo')}
              </Button>
            )}

            <Button
              additionalClassName="mr-2"
              onClick={this.handleShowInvoices}
              disabled={isLoading}
            >
              {t('Show invoices')}
            </Button>

            <div className="float-right">
              <Button onClick={this.handleRetry} disabled={isLoading}>
                {t('Re-activate plan')}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

const billingQuery = gql`
  query planExpired_previousPlan {
    user {
      id
      organization {
        id
        previousPlan {
          id
          name
          canManualReActivate
          calculatePrice
          currency
          billingCycleInMonths
        }
      }
    }
  }
`;

const reActivateMutation = gql`
  mutation planExpired_reActivate {
    reactivate {
      error
      success
    }
  }
`;

const mapStateToProps = state => ({
  user: state.user,
});

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(billingQuery, { name: 'billingQuery' }),
  graphql(reActivateMutation, { name: 'retryMutation' }),
)(PlanExpired);
