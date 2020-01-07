// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Col, FormGroup } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

// actions
import { hideModal } from 'Actions/ModalAction';

// components
import Button from 'Components/Forms/Button';
import Toast from 'Components/Toast';
import { TextAreaField } from 'Components/Forms/Fields';
import Skeleton from 'Components/Skeleton';
import LoadingSpinner from 'Components/LoadingSpinner';
import FormErrors from 'Components/Forms/FormErrors';

// utils
import { t, tn } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import { graphqlOK } from 'Utilities/underdash';
import { throwNetworkError, throwSubmitErrors } from 'Utilities/errors';

import './add-voucher-form.scss';

type Props = {
  handleSubmit: Function,
  invalid: boolean,
  submitting: boolean,
  addVoucher: Function,
};

class AddVoucherForm extends Component<Props> {
  handleSubmit = ({ vouchers }) => {
    const vouchersArr = vouchers.split('\n').map(el => el.trim());
    return this.props
      .addVoucher({
        variables: {
          input: {
            vouchers: vouchersArr,
          },
        },
      })
      .then(({ data: { addPrepaidVoucher: { errors } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        }
        Toast.success(tn('Voucher added', 'Vouchers added', vouchersArr.length));
        this.props.hideModal();
      }, throwNetworkError);
  };

  renderSkeleton() {
    return (
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '30%' } },
          { type: 'text' },
          { type: 'button', options: { width: '45%', alignment: 'center' } },
        ]}
      />
    );
  }

  renderForm() {
    const { handleSubmit, invalid, submitting } = this.props;
    const loadingSpinner = submitting ? <LoadingSpinner /> : '';
    return (
      <form className="add-voucher-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <FormErrors />
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Vouchers')}</div>
            <Field
              name="vouchers"
              placeholder={t('Enter vouchers one per line')}
              component={TextAreaField}
              validate={[Validator.required]}
            />
          </Col>
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="confirmation-button-wrapper text-right">
            {loadingSpinner}
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Add vouchers')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }

  render() {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }

    return this.renderForm();
  }
}

const addPrepaidVoucherMutation = gql`
  mutation addVoucherForm_addPrepaidVoucher($input: AddPrepaidVoucherInput!) {
    addPrepaidVoucher(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { hideModal },
  ),
  graphql(addPrepaidVoucherMutation, { name: 'addVoucher' }),
)(reduxForm({ form: 'AddVoucherForm', enableReinitialize: true })(AddVoucherForm));
