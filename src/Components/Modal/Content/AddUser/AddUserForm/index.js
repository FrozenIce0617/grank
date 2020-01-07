// @flow
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Container, Col, FormGroup } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Button from 'Components/Forms/Button';

import Toast from 'Components/Toast';
import LabelWithHelp from 'Components/LabelWithHelp';

import { Checkbox, TextField } from 'Components/Forms/Fields';
import Skeleton from 'Components/Skeleton';
import FormErrors from 'Components/Forms/FormErrors';
import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import underdash from 'Utilities/underdash';

type Props = {
  handleSubmit: Function,
  invalid: Boolean,
  onError: Function,
  onSuccess: Function,
  performCreateUser: Function,
  performEditUser: Function,
  submitting: Boolean,
  reset: Function,
  createUser: Function,

  orgId: number,
  id: number,

  onClose: Function,
  refresh: Function,
};

type State = {};

class AddUserForm extends Component<Props, State> {
  getElement(field: Object) {
    return (
      <field.elementType
        className={'form-control custom-form-control'}
        type={field.type}
        placeholder={field.placeholder}
        {...field.input}
      />
    );
  }

  handleSubmit = ({ fullName, email, isOrgAdmin }) => {
    const { orgId } = this.props;
    const inviteUserInput = {
      fullName,
      email,
      isOrgAdmin: !!isOrgAdmin,
      organization: orgId,
    };

    return this.props
      .createUser({
        variables: {
          inviteUserInput,
        },
      })
      .then(({ data: { inviteUser: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error('Something went wrong');
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('User invited'));
          this.props.refresh();
          this.props.onClose();
        }
      });
  };

  renderSubHeader = () => (
    <p>
      {t('When you add a new user an email will be sent to the new user.')}
      <br />
      {t(
        'To activate the account please make sure that the new user clicks the activate link in the email.',
      )}
    </p>
  );

  renderSkeleton() {
    return (
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'text', options: { width: '45%' } },
          { type: 'text', options: { width: '25%' } },
          { type: 'text', options: { width: '40%' } },
          { type: 'text', options: { width: '25%' } },
          { type: 'button', options: { width: '45%', alignment: 'center' } },
        ]}
      />
    );
  }

  renderForm() {
    const { handleSubmit, invalid, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit(this.handleSubmit)}>
        <FormErrors />
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Full Name')}</div>
            <Field
              name="fullName"
              placeholder={t('Enter full name')}
              component={TextField}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Email')}</div>
            <Field
              name="email"
              type="email"
              placeholder={t('Enter email address')}
              component={TextField}
              validate={[Validator.required, Validator.email]}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <Field name="isOrgAdmin" component={Checkbox}>
              <LabelWithHelp
                className="form-label"
                helpTitle={t('Admin user')}
                help={t('Admin users can access and manage the Account menu')}
              >
                {t('Admin user')}
              </LabelWithHelp>
            </Field>
          </Col>
        </FormGroup>
        <FormGroup className="indented-form-group">
          <hr />
          <div className="confirmation-button-wrapper text-right">
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Save')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }

  render() {
    const shouldRenderSkeleton =
      underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props });

    return (
      <div>
        {this.renderSubHeader()}
        {shouldRenderSkeleton ? this.renderSkeleton() : this.renderForm()}
      </div>
    );
  }
}

const performCreateUserQuery = gql`
  mutation addUserForm_inviteUser($inviteUserInput: InviteUserInput!) {
    inviteUser(input: $inviteUserInput) {
      errors {
        field
        messages
      }
    }
  }
`;

const mapStateToProps = state => ({
  orgId: state.user.organization.id,
});

export default compose(
  connect(mapStateToProps),
  graphql(performCreateUserQuery, { name: 'createUser' }),
)(reduxForm({ form: 'CreateUser', enableReinitialize: true })(AddUserForm));
