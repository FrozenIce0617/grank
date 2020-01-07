// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Button from 'Components/Forms/Button';
import { showModal } from 'Actions/ModalAction';
import PaymentWidget from '../../PaymentWidget/index';
import { t } from 'Utilities/i18n';

import LoadingSpinner from 'Components/LoadingSpinner';

type Props = {
  className?: string,

  updatePaymentMethod: Function,
  showModal: Function,
  onBack?: Function,
  onUpdate?: Function,
  buttonText?: string,
};

type State = {
  braintreeUniqueId: any,
  formSubmitting: boolean,
  braintreeInstance: any,
};

class UpdatePaymentMethodWidget extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      showVatFields: true,
      formSubmitting: false,
      braintreeUniqueId: +new Date(),
      braintreeInstance: false,
    };
  }

  createBraintreeInstance = instance => {
    this.setState({
      braintreeInstance: instance,
    });
  };

  handleSubmit = () => {
    const { onUpdate } = this.props;
    this.state.braintreeInstance.requestPaymentMethod((braintreeError, payload) => {
      if (braintreeError) {
        return;
      }
      this.setState({
        formSubmitting: true,
      });

      this.props
        .updatePaymentMethod({
          variables: {
            paymentNonce: payload.nonce,
          },
        })
        .then(({ data: { setPaymentMethod: { error, success } } }) => {
          if (!success) {
            this.setState({
              formSubmitting: false,
            });
            this.props.showModal({
              modalType: 'GeneralError',
              modalProps: {
                title: t('We could not update your payment information'),
                errorType: error,
                link: '/billing/',
              },
            });
            return;
          }
          onUpdate && onUpdate();
        });
    });
  };

  handleBack = () => {
    const { onBack } = this.props;
    onBack && onBack();
  };

  render() {
    const { onBack, className } = this.props;
    const { formSubmitting, braintreeInstance } = this.state;
    const loadingSpinner = formSubmitting ? <LoadingSpinner /> : '';
    return (
      <form className={className}>
        <strong className="form-title not-numbered">{t('Payment Details')}</strong>
        <PaymentWidget
          standalone
          onCreate={this.createBraintreeInstance}
          uniqueid={this.state.braintreeUniqueId}
        />
        <div className="text-right confirmation-button-wrapper">
          {loadingSpinner}
          {onBack && (
            <Button
              additionalClassName="back-button"
              theme="grey"
              onClick={this.handleBack}
              disabled={formSubmitting}
            >
              {t('Back')}
            </Button>
          )}
          <Button
            disabled={formSubmitting || !braintreeInstance}
            theme="orange"
            onClick={this.handleSubmit}
          >
            {this.props.buttonText ? this.props.buttonText : t('Update')}
          </Button>
        </div>
      </form>
    );
  }
}

const updatePaymentMethodMutation = gql`
  mutation updatePaymentMethodWidget_updatePaymentMethod($paymentNonce: String!) {
    setPaymentMethod(paymentNonce: $paymentNonce) {
      success
      error
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal },
  ),
  graphql(updatePaymentMethodMutation, { name: 'updatePaymentMethod' }),
)(UpdatePaymentMethodWidget);
