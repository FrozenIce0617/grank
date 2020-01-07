// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Field, reduxForm } from 'redux-form';
import { Select } from 'Components/Forms/Fields';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import Validator from 'Utilities/validation';
import { throwNetworkError } from 'Utilities/errors';

type Props = {
  hideModal: Function,
  handleSubmit: Function,
  organizationId: number,
};

class MakeAffiliate extends Component<Props> {
  handleSubmit = () => {
    const input = {
      organizationId: this.props.organizationId,
    };

    return this.props
      .addAffiliateMutation({
        variables: {
          input,
        },
      })
      .then(({ data: { addAffiliate: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Affiliate could not be created.'));
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('Affiliate created.'));
          this.props.hideModal();
        }
      }, throwNetworkError);
  };

  render() {
    const { invalid, submitting } = this.props;

    return (
      <ModalBorder
        className="edit-group"
        title={t('Make Organization Affiliate')}
        onClose={this.props.hideModal}
      >
        <form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
          <div className="footer">
            <Button theme="orange" submit disabled={invalid || submitting}>
              {t('Save')}
            </Button>
          </div>
        </form>
      </ModalBorder>
    );
  }
}

const addAffiliateMutation = gql`
  mutation($input: AddAffiliateInput!) {
    addAffiliate(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const SalesMakeAffiliateForm = reduxForm({
  form: 'SalesMakeAffiliateForm',
})(MakeAffiliate);

export default compose(
  graphql(addAffiliateMutation, { name: 'addAffiliateMutation' }),
  connect(
    null,
    { hideModal },
  ),
)(SalesMakeAffiliateForm);
