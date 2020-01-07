// @flow
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Container, Col, FormGroup } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import GenericPage from 'Pages/Layout/GenericPage';
import Button from 'Components/Forms/Button';

import { Checkbox, TextField } from 'Components/Forms/Fields';
import Skeleton from 'Components/Skeleton';

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
  loading: Boolean,
  error: Boolean,

  orgid: number,
  id: number,
};

type State = {};

class CreateUser extends Component<Props, State> {
  handleSubmit: Function;

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

  renderHeader = () =>
    this.props.id ? <h1>{t('Edit User')}</h1> : <h1>{t('Invite New User')}</h1>;

  renderSubHeader = () =>
    this.props.id ? (
      undefined
    ) : (
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
    const { handleSubmit, invalid, submitting, id } = this.props;
    return (
      <form onSubmit={handleSubmit}>
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
              {t('Admin user')}
            </Field>
            <span className="small">{t('Admin users can access and manage the Account menu')}</span>
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
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="account_users" />
        <Container className="generic-page" fluid>
          <Col lg={4}>
            {this.renderHeader()}
            {this.renderSubHeader()}
            {shouldRenderSkeleton ? this.renderSkeleton() : this.renderForm()}
          </Col>
        </Container>
      </DashboardTemplate>
    );
  }
}

const userDataQuery = gql`
  query createUser_userData($id: ID!) {
    user(id: $id) {
      id
      fullName
      email
      isOrgAdmin
    }
  }
`;

export default compose(
  graphql(userDataQuery, {
    name: 'userData',
    skip: ({ id }) => !id,
    options: ({ id }) => ({ variables: { id } }),
    props: ({ userData: { error, loading, user }, ownProps: id }) => {
      if (!id) {
        return null;
      }
      return { loading, error, initialValues: user };
    },
  }),
)(reduxForm({ form: 'CreateUser', enableReinitialize: true })(CreateUser));
