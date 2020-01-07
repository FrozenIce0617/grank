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
};

class SalesExtend extends Component<Props> {
  handleSubmit = ({ days }) => {
    const input = {
      organizationId: this.props.organizationId,
      days,
    };

    return this.props
      .extendPlanMutation({
        variables: {
          input,
        },
      })
      .then(({ data: { extendPlan: { errors } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        } else {
          Toast.success(t('Plan extended'));
          this.props.hideModal();
        }
      }, throwNetworkError);
  };

  render() {
    const { handleSubmit, invalid, submitting } = this.props;

    return (
      <ModalBorder className="edit-group" title={t('Extend')} onClose={this.props.hideModal}>
        <form onSubmit={handleSubmit(this.handleSubmit)}>
          <FormErrors />
          <div className="form-label required">{t('Days to extend')}</div>
          <Field
            name="days"
            placeholder={t('Enter the amount of days the plan should be extended.')}
            component={TextField}
            validate={[Validator.required]}
          />

          <p className="alert alert-warning">
            {t(
              'Please note that you will add the above days to when the last plan of the organization end. Meaning that if the last plan ended on 1/1-2018 and you add 20 days the plan will end on 20/1-2018 (it will also re-activate the organization if this new end date is in the future)',
            )}
          </p>
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

const extendPlanMutation = gql`
  mutation($input: ExtendPlanInput!) {
    extendPlan(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const SalesExtendForm = reduxForm({
  form: 'SalesExtendForm',
})(SalesExtend);

export default compose(
  graphql(extendPlanMutation, { name: 'extendPlanMutation' }),
  connect(
    null,
    { hideModal },
  ),
)(SalesExtendForm);
