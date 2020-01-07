// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n';

type OrganizationPlan = {
  id: any,
  name: any,
};

type PaymentInfo = {
  //transaction
  billysbillingInvoiceId: any,
  amount: any,
  amountBeforeVat: any,
  couponCode: any,
  //item
  organizationPlan: OrganizationPlan,
};

type Props = {
  paymentInfo: PaymentInfo,
};

class PaymentSuccess extends Component<Props> {
  render() {
    return (
      <div className="modal-content-container">
        <div className="modal-content-inner">
          <h2 className="modal-title">{t('Payment confirmed')}</h2>
          <p className="modal-main-text">
            {t('Thank you for your order! Your payment was successful.')}
          </p>
          <a href={'/app/account/billing'} className="btn btn-brand-green btn-rounded">
            {t('Go to the billing overview')}
          </a>
        </div>
      </div>
    );
  }
}

export default PaymentSuccess;
