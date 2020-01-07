// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { Col, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import { throwNetworkError } from 'Utilities/errors';
import { redirectToExternalUrl } from 'Utilities/underdash';

import Validator from 'Utilities/validation';
import Button from 'Components/Forms/Button';
import { TextAreaField } from 'Components/Forms/Fields';
import { t } from 'Utilities/i18n/index';
import User from 'Queries/user';
import cookie from 'react-cookies';

type Props = {
  handleSubmit: Function,
  submitting: boolean,
  hideModal: Function,
  invalid: boolean,
  updateReason: Function,
};

class OldInterfaceReasonForm extends Component<Props> {
  handleSubmit = ({ reason }) => {
    this.props
      .updateReason({ variables: { input: { selectedVersionReason: reason } } })
      .then(() => {
        this.props.hideModal();
        cookie.save('accuranker_version_1', true, { path: '/' });
        redirectToExternalUrl('/user/version/1/');
      }, throwNetworkError);
  };

  render() {
    const { invalid, submitting, handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(this.handleSubmit)}>
        <FormGroup row className="indented-form-group">
          <Col xs={12} lg={12}>
            <div className="form-label required">
              {t('Please tell us why you prefer the old version.')}
            </div>
            <Field
              name="reason"
              component={TextAreaField}
              validate={Validator.required}
              helpText={<span>{t('Please be as specific as possible.')}</span>}
            />
          </Col>
        </FormGroup>
        <hr />
        <FormGroup className="indented-form-group">
          <div className="confirmation-button-wrapper text-right">
            <Button theme="orange" submit disabled={invalid || submitting}>
              {t('Switch to Old AccuRanker')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

export default compose(graphql(User.mutations.updateUserSettings, { name: 'updateReason' }))(
  reduxForm({
    form: 'OldInterfaceReasonForm',
  })(OldInterfaceReasonForm),
);
