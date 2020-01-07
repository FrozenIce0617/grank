// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Field, reduxForm } from 'redux-form';
import { TextField } from 'Components/Forms/Fields';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import Validator from 'Utilities/validation';
import FormErrors from 'Components/Forms/FormErrors';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';

type Props = {
  hideModal: Function,
  handleSubmit: Function,
  organizationId: number,
  invoiceId: string,
};

class SalesRefund extends Component<Props> {
  handleSubmit = ({ reason }) => {
    const input = {
      organizationId: this.props.organizationId,
      reason,
    };

    if (this.props.invoiceId) {
      input.invoiceId = this.props.invoiceId;
    }

    return this.props
      .refundMutation({
        variables: {
          input,
        },
      })
      .then(({ data: { refund: { errors } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        } else {
          Toast.success(t('Organization refunded'));
          this.props.hideModal();
        }
      }, throwNetworkError);
  };

  render() {
    const { handleSubmit, invalid, submitting } = this.props;

    return (
      <ModalBorder className="edit-group" title={t('Refund')} onClose={this.props.hideModal}>
        <form onSubmit={handleSubmit(this.handleSubmit)}>
          <FormErrors />
          <div className="form-label required">{t('Reason for the refund')}</div>
          <Field
            name="reason"
            placeholder={t('What is the reason for this refund?')}
            component={TextField}
            validate={[Validator.required]}
          />

          <div className="footer">
            <Button theme="orange" submit disabled={invalid || submitting}>
              {t('Refund')}
            </Button>
          </div>
        </form>
      </ModalBorder>
    );
  }
}

const refundMutation = gql`
  mutation($input: RefundInput!) {
    refund(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const SalesRefundForm = reduxForm({
  form: 'SalesRefundForm',
})(SalesRefund);

export default compose(
  graphql(refundMutation, { name: 'refundMutation' }),
  connect(
    null,
    { hideModal },
  ),
)(SalesRefundForm);
