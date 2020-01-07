// @flow
import React, { Component, type Element } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Col, Row, FormGroup, Container } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import Toast from 'Components/Toast';

import { TextField, TextAreaField, Checkbox, Select } from 'Components/Forms/Fields';
import Button from 'Components/Forms/Button';
import Skeleton from 'Components/Skeleton';

import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import underdash from 'Utilities/underdash';

type Props = {
  organizations: Object,
  handleSubmit: Function,
  requestAccess: Function,
  invalid: boolean,
  reset: Function,
  submitting: boolean,
  refresh: Function,
  onClose: Function,
};

type State = {};

class RequestAccessForm extends Component<Props, State> {
  handleSubmit = ({
    fromOrganization: { value: id },
    toEmail,
    subject,
    message = '',
    isOrgAdmin,
    sendACopy,
  }) => {
    const requestAccessInput = {
      fromOrganization: id,
      toEmail,
      subject,
      message,
      isOrgAdmin: !!isOrgAdmin,
      sendACopy: !!sendACopy,
    };
    return this.props
      .requestAccess({
        variables: {
          requestAccessInput,
        },
      })
      .then(({ data: { addMultiAccountRequest: { multiAccount, errors } } }) => {
        if (!multiAccount) {
          Toast.error('Something went wrong');
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          this.props.onClose();
          this.props.refresh();
          Toast.success(t('Request sent'));
        }
      });
  };

  handleSelectOnBlur(field) {
    const {
      input,
      input: { value },
    } = field;
    input.onBlur(value);
  }

  renderSkeleton() {
    return (
      <div>
        <Skeleton
          className="indented-form-group form-group"
          linesConfig={[
            { type: 'text', options: { width: '30%' } },
            { type: 'input' },
            { type: 'text', options: { width: '30%' } },
            { type: 'input' },
            { type: 'text', options: { width: '30%' } },
            { type: 'input' },
            { type: 'text', options: { width: '30%' } },
            { type: 'input' },
            { type: 'input' },
            { type: 'text', options: { width: '35%' } },
            { type: 'text', options: { width: '25%' } },
            { type: 'subtitle', options: { width: '20%' } },
            { type: 'button', options: { width: '45%', alignment: 'center' } },
          ]}
        />
      </div>
    );
  }

  render() {
    const {
      organizations: { user },
      invalid,
      submitting,
      handleSubmit,
    } = this.props;
    const toReturn = null;
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return this.renderSkeleton();
    }
    const options = user.organizations.map(org => ({ label: org.name, value: org.id }));
    return (
      <form className="row" onSubmit={handleSubmit(this.handleSubmit)}>
        <Col lg={12}>
          <Row>
            <Col xs={12}>
              <FormGroup row className="indented-form-group">
                <Col xs={12} lg={12}>
                  <div className="form-label required">{t('From organization')}</div>
                  <Field
                    defaultBehaviour
                    name="fromOrganization"
                    type="text"
                    placeholder={t('Select your organization')}
                    component={Select}
                    validate={Validator.required}
                    options={options}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('To email')}</div>
                  <Field
                    name="toEmail"
                    type="email"
                    placeholder={t('To email')}
                    component={TextField}
                    validate={[Validator.required, Validator.email]}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('Subject')}</div>
                  <Field
                    name="subject"
                    placeholder={t('Subject')}
                    component={TextField}
                    validate={[Validator.required]}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label">{t('Message')}</div>
                  <Field
                    name="message"
                    placeholder={t('Message')}
                    component={TextAreaField}
                    validate={[]}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <Field name="isOrgAdmin" component={Checkbox}>
                    {t('Access the account as an admin user')}
                  </Field>
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <Field name="sendACopy" component={Checkbox} defaultChecked>
                    {t('Send a copy to myself')}
                  </Field>
                </Col>
              </FormGroup>
              <FormGroup className="indented-form-group">
                <hr />
                <div className="confirmation-button-wrapper text-right">
                  <Button disabled={invalid || submitting} submit theme="orange">
                    {t('Send request')}
                  </Button>
                </div>
              </FormGroup>
            </Col>
          </Row>
        </Col>
      </form>
    );
  }
}

const requestAccessQuery = gql`
  mutation requestAccessForm_requestAccess($requestAccessInput: AddMultiAccountRequestInput!) {
    addMultiAccountRequest(input: $requestAccessInput) {
      multiAccount {
        id
      }
      errors {
        field
        messages
      }
    }
  }
`;

const getOrganizationsQuery = gql`
  query requestAccessForm_organizations {
    user {
      id
      organizations {
        id
        name
      }
    }
  }
`;

export default compose(
  graphql(getOrganizationsQuery, { name: 'organizations' }),
  graphql(requestAccessQuery, { name: 'requestAccess' }),
)(
  reduxForm({
    form: 'RequestAccessForm',
  })(RequestAccessForm),
);
