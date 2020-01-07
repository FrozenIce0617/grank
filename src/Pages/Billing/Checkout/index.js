// @flow
import React, { Component } from 'react';
import { submit } from 'redux-form';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Container, Row, Col } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import ReactGA from 'react-ga';

import { setVatStatus } from 'Actions/OrderPlanAction';
import { startLoading, finishLoading } from 'Actions/LoadingAction';
import { showModal } from 'Actions/ModalAction';
import LocaleSelector from 'Selectors/LocaleSelector';

import Button from 'Components/Forms/Button';
import { StickyContainer, Sticky } from 'react-sticky';
import CompanyInfoWidget from 'Pages/Billing/CompanyInfoWidget';
import PaymentWidget from 'Pages/Billing/PaymentWidget';
import CheckoutInfoWidget from 'Pages/Billing/InfoWidget';
import OrderPlanWidget from 'Pages/Billing/OrderPlanWidget';
import TemplateNavTop from 'Pages/Layout/TemplateNavTop';
import SpecialOfferTimer from 'Pages/Billing/SpecialOfferTimer';
import SpecialOfferMessage from 'Pages/Billing/SpecialOfferMessage';
import SupportWidget from 'Components/SupportWidget';

import { t } from 'Utilities/i18n/index';

import './checkout-form.scss';

type Props = {
  data: Object,
  dispatch: Function,
  companyInfoError: any,
  countriesError: any,
  match: Object,
  startLoading: Function,
  showModal: Function,
  performPayment: Function,
  finishLoading: Function,
};

type State = {
  showVatFields: boolean,
  braintreeUniqueId: any,
  formSubmitting: boolean,
  braintreeInstance: any,
  companyInfoWidgetValid: boolean,
};

const NEW_PAYMENT = 'A_1';

class CheckoutForm extends Component<Props, State> {
  createBraintreeInstance: Function;
  handleCountrySelectOnChange: Function;
  handleSelectOnBlur: Function;
  handleSubmit: Function;
  setCompanyInfoWidgetValidStatus: Function;

  constructor(props) {
    super(props);
    this.state = {
      showVatFields: true,
      braintreeUniqueId: +new Date(),
      formSubmitting: false,
      braintreeInstance: false,
      companyInfoWidgetValid: true,
    };
  }

  componentDidUpdate() {
    if (this.props.data.error || this.props.companyInfoError || this.props.countriesError) {
      this.props.showModal({
        modalType: 'SelectPlan',
        modalProps: {
          errorMessage: t(
            'Something went wrong with the plan you selected. Select another plan or contact us if you have any questions.',
          ),
        },
      });
    }
  }

  setCompanyInfoWidgetValidStatus = valid => {
    this.setState({
      companyInfoWidgetValid: valid,
    });
  };

  handleSubmit = ({
    companyName,
    street,
    zipcode,
    city,
    state,
    country: { countryCode },
    vatPrefix,
    vatNumber,
    emailInvoiceTo,
  }) => {
    this.props.startLoading({ loadingText: t('Processing payment') });
    this.state.braintreeInstance.requestPaymentMethod((braintreeError, payload) => {
      if (braintreeError) {
        this.props.finishLoading();
        this.setState({
          braintreeUniqueId: +new Date(),
          formSubmitting: false,
        });
        this.props.showModal({
          modalType: 'PaymentFailed',
          modalProps: { errorType: braintreeError.message },
        });
        return;
      }
      const { id, cycle, coupon } = this.props.match.params;

      this.setState({
        formSubmitting: true,
      });

      const paymentDetails = {
        variables: {
          planId: id,
          billingCycleId: cycle,
          paymentNonce: payload.nonce,
          companyName,
          street,
          zipcode,
          city,
          state,
          countryIso: countryCode,
          vatPrefix: vatPrefix ? vatPrefix.vatCode : null,
          vatNumber: vatNumber ? vatNumber.trim() : null,
          emailInvoiceTo,
          coupon,
        },
      };
      this.props.performPayment(paymentDetails).then(res => {
        const {
          data: {
            setPaymentContact: { error, success, payment },
          },
        } = res;
        this.props.finishLoading();
        if (!success) {
          this.setState({
            braintreeUniqueId: +new Date(),
            formSubmitting: false,
          });
          this.props.showModal({
            modalType: 'PaymentFailed',
            modalProps: { errorType: error },
          });
          return;
        }

        if (payment.paymentType === NEW_PAYMENT) {
          // Google Analytics
          ReactGA.plugin.require('ecommerce');

          ReactGA.plugin.execute('ecommerce', 'addItem', {
            id: `payment-${payment.id}`,
            name: payment.organizationPlan.category,
            sku: payment.organizationPlan.maxKeywords,
            price: payment.amountBeforeVat,
            category: 'Sale',
            quantity: 1,
          });

          ReactGA.plugin.execute('ecommerce', 'addTransaction', {
            id: `payment-${payment.id}`,
            revenue: payment.amountBeforeVat,
          });

          ReactGA.plugin.execute('ecommerce', 'send');

          // Facebook
          /* eslint-disable */
          if (typeof fbq !== 'undefined') {
            fbq('track', 'Purchase', {
              value: payment.amountBeforeVat,
              currency: 'USD',
            });
          }
          /* eslint-enable */

          // TODO add GTM.api.trigger
        }

        this.props.showModal({
          modalType: 'PaymentSuccess',
          modalProps: { paymentInfo: payment },
        });
      });
    });
  };

  createBraintreeInstance = instance => {
    this.setState({
      braintreeInstance: instance,
    });
  };

  render() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    const { formSubmitting, braintreeInstance, companyInfoWidgetValid } = this.state;
    return (
      <TemplateNavTop>
        <main role="main" className="checkout-container">
          <Container>
            <h1>{t('Your Order Details')}</h1>
            <form className="row">
              <Col md={12} lg={8}>
                <Row>
                  <Col xs={12}>
                    <SpecialOfferTimer planId={params.id} billingCycleId={params.cycle} />
                  </Col>
                  <Col xs={12}>
                    <SpecialOfferMessage planId={params.id} billingCycleId={params.cycle} />
                  </Col>
                  <Col xs={12} className="hidden-md-down">
                    <CheckoutInfoWidget planId={params.id} billingCycleId={params.cycle} />
                  </Col>
                  <Col md={12}>
                    <strong className="form-title">{t('Company Details')}</strong>
                    <CompanyInfoWidget
                      onSubmit={this.handleSubmit}
                      setFormValidStatus={this.setCompanyInfoWidgetValidStatus}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <strong className="form-title">{t('Payment Details')}</strong>
                    <PaymentWidget
                      onCreate={this.createBraintreeInstance}
                      uniqueid={this.state.braintreeUniqueId}
                    />
                  </Col>
                </Row>
              </Col>
              <Col xs={4} className="hidden-md-down">
                <StickyContainer style={{ height: '100%' }}>
                  <Sticky>
                    {({ style }) => (
                      <OrderPlanWidget
                        basepath="checkout"
                        isSticky
                        style={style}
                        planId={params.id}
                        billingCycleId={params.cycle}
                        coupon={params.coupon}
                      />
                    )}
                  </Sticky>
                </StickyContainer>
              </Col>
              <Col xs={12}>
                <strong className="form-title">{t('Place Order')}</strong>
                <Row>
                  <Col xs={12} className="hidden-lg-up">
                    <CheckoutInfoWidget planId={params.id} billingCycleId={params.cycle} />
                  </Col>
                  <Col xs={12} className="hidden-lg-up">
                    <OrderPlanWidget
                      planId={params.id}
                      billingCycleId={params.cycle}
                      coupon={params.coupon}
                    />
                  </Col>
                  <Col xs={12}>
                    <div className="text-center confirmation-button-wrapper">
                      <Button
                        disabled={formSubmitting || !braintreeInstance || !companyInfoWidgetValid}
                        theme="green"
                        rounded
                        block
                        onClick={() => dispatch(submit('CompanyInfoForm'))}
                      >
                        {t('Confirm')}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Col>
            </form>
          </Container>
        </main>
        <SupportWidget />
      </TemplateNavTop>
    );
  }
}

const mapStateToProps = state => ({
  fullLocale: LocaleSelector(state),
});

const pricingPlanQuery = gql`
  query checkoutForm_getPricingPlan($id: ID!) {
    pricingPlan(id: $id) {
      id
      name
    }
  }
`;

const performPaymentMutation = gql`
  mutation checkoutForm_performPayment(
    $planId: String
    $billingCycleId: Int
    $companyName: String!
    $street: String!
    $city: String!
    $zipcode: String!
    $countryIso: String!
    $state: String
    $vatPrefix: String
    $vatNumber: String
    $paymentNonce: String
    $emailInvoiceTo: String
    $coupon: String
  ) {
    setPaymentContact(
      planId: $planId
      billingCycleId: $billingCycleId
      companyName: $companyName
      street: $street
      city: $city
      zipcode: $zipcode
      countryIso: $countryIso
      state: $state
      vatPrefix: $vatPrefix
      vatNumber: $vatNumber
      paymentNonce: $paymentNonce
      emailInvoiceTo: $emailInvoiceTo
      coupon: $coupon
    ) {
      success
      error
      payment {
        id
        billysbillingInvoiceId
        amount
        amountBeforeVat
        couponCode
        paymentType
        organizationPlan {
          id
          category
          maxKeywords
        }
      }
    }
  }
`;

export default withRouter(
  compose(
    graphql(performPaymentMutation, {
      name: 'performPayment',
    }),
    graphql(pricingPlanQuery, {
      options: ({ match }) => ({
        variables: {
          id: match.params.id,
        },
      }),
    }),
    connect(
      mapStateToProps,
      dispatch => ({
        ...bindActionCreators({ setVatStatus, startLoading, finishLoading, showModal }, dispatch),
        dispatch,
      }),
    ),
  )(CheckoutForm),
);
