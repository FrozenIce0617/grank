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
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';

type Props = {
  hideModal: Function,
  handleSubmit: Function,
  organizationId: number,
};

class SalesDemoContent extends Component<Props> {
  handleSubmit = ({ organizations }) => {
    const input = {
      organizationId: this.props.organizationId,
      organizations: organizations.map(org => org.value),
    };

    return this.props
      .addDemoContentMutation({
        variables: {
          input,
        },
      })
      .then(({ data: { addDemoContent: { errors } } }) => {
        if (errors.length > 0) {
          throwSubmitErrors(errors);
        } else {
          Toast.success(t('Content added'));
          this.props.hideModal();
        }
      }, throwNetworkError);
  };

  render() {
    const { invalid, submitting } = this.props;

    const organizationOptions = [
      {
        label: 'Ecommerce Demo',
        value: 18140,
      },
      {
        label: 'Brand Demo',
        value: 18139,
      },
    ];

    return (
      <ModalBorder
        className="edit-group"
        title={t('Add Demo Organizations')}
        onClose={this.props.hideModal}
      >
        <form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
          <div className="form-label required">{t('Organizations')}</div>
          <Field
            multi
            defaultBehaviour
            name="organizations"
            component={Select}
            validate={[Validator.required]}
            options={organizationOptions}
          />

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

const addDemoContentMutation = gql`
  mutation($input: AddDemoContentInput!) {
    addDemoContent(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const SalesDemoContentForm = reduxForm({
  form: 'SalesDemoContentForm',
})(SalesDemoContent);

export default compose(
  graphql(addDemoContentMutation, { name: 'addDemoContentMutation' }),
  connect(
    null,
    { hideModal },
  ),
)(SalesDemoContentForm);
