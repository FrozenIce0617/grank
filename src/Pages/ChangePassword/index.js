// @flow
import React, { Component, type Element } from 'react';
import { Field, reduxForm } from 'redux-form';
import { noop } from 'lodash';
import { Container, Col, FormGroup } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import { TextField } from 'Components/Forms/Fields';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import FormErrors from 'Components/Forms/FormErrors';

import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import { throwNetworkError, throwSubmitErrors } from 'Utilities/errors';

type Props = {
  handleSubmit: Function,
  invalid: Boolean,
  onError: Function,
  onSuccess: Function,
  performUpdatePassword: Function,
  submitting: Boolean,
};

type State = {};

class ChangePasswordForm extends Component<Props, State> {
  static defaultProps = {
    onError: noop,
  };

  renderField: Object => Element<string>;

  getPasswordElement(field) {
    const {
      meta: { touched, error },
      showCheckmark,
    } = field;
    const hasCheckmark = showCheckmark && field.type === 'password' && touched && !error;
    return (
      <input
        className={`form-control custom-form-control ${
          hasCheckmark ? 'password-confirm-padding' : ''
        }`}
        type={field.type}
        placeholder={field.placeholder}
        {...field.input}
      />
    );
  }

  handleSubmit = ({ oldPassword, password }) => {
    const updatePasswordInput = {
      oldPassword,
      password,
    };

    return this.props
      .performUpdatePassword({
        variables: {
          updatePasswordInput,
        },
      })
      .then(({ data: { updateMyUserPassword: { errors } } }) => {
        if (errors && errors.length) {
          this.props.onError(errors);
          throwSubmitErrors(errors);
        } else {
          Toast.success(t('Password changed'));
          this.props.onSuccess();
        }
      }, throwNetworkError);
  };

  render() {
    const { handleSubmit, invalid, submitting } = this.props;

    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="profile_change_password" />
        <Container className="generic-page" fluid>
          <Col lg={4}>
            <form onSubmit={handleSubmit(this.handleSubmit)}>
              <FormErrors />
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('Old password')}</div>
                  <Field
                    name="oldPassword"
                    type="password"
                    placeholder={t('Enter your password')}
                    component={TextField}
                    validate={Validator.password}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('New password')}</div>
                  <Field
                    showCheckmark
                    name="password"
                    type="password"
                    placeholder={t('Enter your password')}
                    component={TextField}
                    validate={Validator.password}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('Confirm new password')}</div>
                  <Field
                    showCheckmark
                    name="passwordConfirmation"
                    type="password"
                    placeholder={t('Enter your password')}
                    component={TextField}
                    validate={Validator.passwordConfirmation}
                  />
                </Col>
              </FormGroup>
              <FormGroup className="indented-form-group">
                <hr />
                <div className="confirmation-button-wrapper text-right">
                  <Button disabled={invalid || submitting} submit theme="orange">
                    {t('Update')}
                  </Button>
                </div>
              </FormGroup>
            </form>
          </Col>
        </Container>
      </DashboardTemplate>
    );
  }
}

const performUpdatePasswordQuery = gql`
  mutation changePasswordForm_updateMyUserPassword(
    $updatePasswordInput: UpdateMyUserPasswordInput!
  ) {
    updateMyUserPassword(input: $updatePasswordInput) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(graphql(performUpdatePasswordQuery, { name: 'performUpdatePassword' }))(
  reduxForm({ form: 'ChangePasswordForm' })(ChangePasswordForm),
);
