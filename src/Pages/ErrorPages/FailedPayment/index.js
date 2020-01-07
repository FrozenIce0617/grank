// @flow
import React, { Component, Fragment } from 'react';
import { Container } from 'reactstrap';
import { t, tct } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import underdash from 'Utilities/underdash';
import FormatNumber from 'Components/FormatNumber';
import TopNavbar from 'Pages/Layout/DashboardTemplate/TopNavbar';
import { isEmpty } from 'lodash';
import UpdatePaymentMethodWidget from 'Pages/Billing/UpdatePaymentMethod/UpdatePaymentMethodWidget';
import { Link } from 'react-router-dom';

import '../error-page.scss';
import './failed-payment.scss';

type Props = {
  billingQuery: Object,
  retryMutation: Function,
};

type State = {
  error: string,
  isLoading: boolean,
};

class FailedPayment extends Component<Props, State> {
  state = {
    error: '',
    isLoading: false,
  };

  handleRetry = () => {
    this.setState({ isLoading: true });
    const unexpectedErrorMessage = t(
      'We were unable to retry your payment. Please contact support.',
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

        if (data.retryPayment.success) {
          window.location = '/';
        } else {
          this.props.billingQuery.refetch();
          this.setState({
            error: data.retryPayment.error || unexpectedErrorMessage,
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

  renderInfoBox() {
    const {
      user: {
        organization: {
          activePlan: { failedPayment },
        },
      },
    } = this.props.billingQuery;

    if (!failedPayment) {
      return;
    }

    let className = `alert alert-${this.state.error === '' ? 'info' : 'danger'}`;
    return (
      <p className={className}>
        <p>
          <strong>{t('Payment Failed - Read For Info')}</strong>
        </p>
        <p>
          {tct('Your payment failed with error: [strong]', {
            strong: <strong>{failedPayment.reason}</strong>,
          })}
        </p>
        <p>
          <strong>{t('Why did this happen:')}</strong>{' '}
          {this.renderErrorWhy(failedPayment.reasonCode)}
        </p>
        <p>
          <strong>{t('How can you fix this:')}</strong>{' '}
          {this.renderErrorHow(failedPayment.reasonCode)}
        </p>
        <hr />
        {failedPayment.reasonType === 'hard_declined' && (
          <p>
            <strong>
              {tct(
                'This error in unrecoverable, which means that you WILL NEED to [link:update your payment method.]',
                {
                  link: <Link to="/billing/paymentmethod" />,
                },
              )}
            </strong>
          </p>
        )}
        {failedPayment.reasonType === 'soft_declined' && (
          <p>
            {tct(
              'This error might resolve itself, we do however recommend that you [link:update your payment method] or contact your bank to get the issue resolved right away.',
              {
                link: <Link to="/billing/paymentmethod" />,
              },
            )}
          </p>
        )}
      </p>
    );
  }

  renderErrorWhy(errorCode) {
    let message = null;

    console.log('error:', errorCode);

    switch (errorCode) {
      case 2000: // Do Not Honor
        message = t(
          'Your bank declined the transaction without returning a proper reason. For more info you will need to contact your bank.',
        );
        break;
      case 2001: // Insufficient Funds
        message = t(
          'The account did not have sufficient funds to cover the transaction amount at the time of the transaction.',
        );
        break;
      case 2002: // Limit Exceeded
      case 2003: // Cardholder's Activity Limit Exceeded
        message = t('The attempted transaction exceeds the activity limit of the account.');
        break;
      case 2004: // Expired Card
        message = t('Your credit card has expired.');
        break;
      case 2007: // No Account
        message = t('Your credit card number is not on file with the card-issuing bank.');
        break;
      case 2015: // Transaction Not Allowed
        message = t(
          'Your bank is declining the transaction for unspecified reason, possibly due to an issue with the card itself.',
        );
        break;
      case 2044: // Declined - Call Issuer
      case 2046: // Declined
        message = t('Your bank is unwilling to accept the transaction.');
        break;
      case 2047: // Call Issuer. Pick Up Card
        message = t('Your credit card has been reported lost or stolen.');
        break;
      case 2057: // Issuer or Cardholder has put a restriction on the card
        message = t('There is a restriction on your credit card.');
        break;
      case 2070: // PayPal Buyer Revoked Pre-Approved Payment Authorization
        message = t(
          'The pre-approved payment authorization that you have previously agreed to between AccuRanker and PayPal has been revoked.',
        );
        break;
      case 2074: // Funding Instrument In The PayPal Account Was Declined By The Processor Or Bank, Or It Can't Be Used For This Payment
        message = t('The payment method associated with your PayPal account was declined.');
        break;
      case 2075: // Payer Account Is Locked Or Closed
        message = t('Your PayPal account cannot be used for transactions at this time.');
        break;
      case 2076: // Payer Cannot Pay For This Transaction With PayPal
        message = t('PayPal did not accept the transaction.');
        break;
      default:
        message = t('We are not sure.');
    }

    return message;
  }

  renderErrorHow(errorCode) {
    let message = null;

    console.log('error:', errorCode);

    switch (errorCode) {
      case 2000: // Do Not Honor
        message = t(
          'Entering the same credit card will very often result in a successful transaction because the bank will re-approve the subscription. If that does not work you must contact your bank or update your payment method.',
        );
        break;
      case 2001: // Insufficient Funds
        message = t(
          'Please check your bank account to make sure the amount is available or update your payment method.',
        );
        break;
      case 2002: // Limit Exceeded
      case 2003: // Cardholder's Activity Limit Exceeded
        message = t(
          'You can either contact your bank to get the limit raised or use a different payment method.',
        );
        break;
      case 2004: // Expired Card
        message = t('You must update your payment method.');
        break;
      case 2007: // No Account
        message = t('You must contact your bank or use a different payment method.');
        break;
      case 2015: // Transaction Not Allowed
        message = t('You must contact your bank or use a different payment method.');
        break;
      case 2044: // Declined - Call Issuer
      case 2046: // Declined
        message = t(
          'You will need to contact your bank for more info. If you are using PayPal, you must contact them instead.',
        );
        break;
      case 2047: // Call Issuer. Pick Up Card
        message = t('Change your payment method to a working credit card.');
        break;
      case 2057: // Issuer or Cardholder has put a restriction on the card
        message = t('You must contact your bank to get the restriction lifted.');
        break;
      case 2070: // PayPal Buyer Revoked Pre-Approved Payment Authorization
        message = t(
          'To re-approve you will need to update your payment method and add your PayPal account again.',
        );
        break;
      case 2074: // Funding Instrument In The PayPal Account Was Declined By The Processor Or Bank, Or It Can't Be Used For This Payment
        message = t('You need to update your payment method in either PayPal or here.');
        break;
      case 2075: // Payer Account Is Locked Or Closed
        message = t('Please contact PayPal or use a different payment method.');
        break;
      case 2076: // Payer Cannot Pay For This Transaction With PayPal
        message = t('You must contact PayPal for more information about why this happened.');
        break;
      default:
        message = t('Please contact support so we can work together to resolve this.');
    }

    return message;
  }

  renderFailedPaymentContent() {
    const {
      user: { organization },
    } = this.props.billingQuery;

    const { isLoading } = this.state;

    return (
      <Fragment>
        {isLoading && <p className="alert alert-info">{t('Performing payment, please wait...')}</p>}

        {this.state.error !== '' && (
          <p className="alert alert-danger">
            <strong>{t('Payment failed')}</strong>
            <br />
            {this.state.error}
          </p>
        )}

        {this.renderInfoBox()}

        <p className="alert alert-warning">
          {t('We have tried collecting')}{' '}
          <FormatNumber currency="USD">{organization.activePlan.calculatePrice}</FormatNumber>{' '}
          {t('a total of %s times.', organization.activePlan.billingRetries + 1)}
        </p>

        <p>
          {tct(
            'In order to continue with your plan please verify (and update) your [link:payment method] and click "Retry Payment".',
            {
              link: <Link to="/billing/paymentmethod" />,
            },
          )}
        </p>
        <p>{t('We will try again on %s.', organization.activePlan.billingRetryDate)}</p>
        <p>
          {t('Failure to update your payment details will result in your account being suspended.')}
        </p>
        <p>
          {t(
            'If you have any questions or want to discuss your plan please contact us via our support function.',
          )}
        </p>

        <p>
          {tct(
            'You can update your payment details [paymentMethodLink:here] or billing info [billingInfoLink:here].',
            {
              billingInfoLink: <Link to="/billing/paymentinfo" />,
              paymentMethodLink: <Link to="/billing/paymentmethod" />,
            },
          )}
        </p>

        <hr />

        <div className="float-right">
          {organization.activePlan.failedPayment &&
          organization.activePlan.failedPayment.reasonType === 'soft_declined' ? (
            <Button onClick={this.handleRetry} disabled={isLoading}>
              {t('Retry payment')}
            </Button>
          ) : (
            <Link to="/billing/paymentmethod" className="btn btn-brand-orange">
              {t('Update payment method')}
            </Link>
          )}
        </div>
      </Fragment>
    );
  }

  render() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return null;
    }

    return (
      <div>
        <TopNavbar />
        <Container className="error-page">
          <h1 className="title">{t('Payment Failed - Avoid data loss')}</h1>

          <div className="error-box">{this.renderFailedPaymentContent()}</div>
        </Container>
      </div>
    );
  }
}

const billingQuery = gql`
  query failedPayment_activePlan {
    user {
      id
      isOrgAdmin
      organization {
        id
        activePlan {
          id
          billingRetryDate
          billingRetries
          canManualRetryPayment
          calculatePrice
          failedPayment {
            reason
            reasonCode
            reasonType
          }
        }
      }
    }
  }
`;

const retryMutation = gql`
  mutation failedPayment_retryPayment {
    retryPayment {
      error
      success
    }
  }
`;

export default compose(
  graphql(billingQuery, { name: 'billingQuery' }),
  graphql(retryMutation, { name: 'retryMutation' }),
)(FailedPayment);
