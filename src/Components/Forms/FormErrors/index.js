// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { getFormSubmitErrors } from 'redux-form';
import { Alert } from 'reactstrap';
import withFormName from '../withFormName';
import './form-errors.scss';
import { AddAction } from 'Pages/Layout/ActionsMenu/Actions';

import { isFieldError, ErrorKind } from 'Utilities/errors';

type Props = {
  errors?: { [type: string]: string },
  formName: string,
};

class FormErrors extends React.Component<Props> {
  renderOrgPlanError = (errorKind: string, error: string) => (
    <Alert key={errorKind} color="danger" className="error-with-action">
      {error}
      <AddAction label="Upgrade Plan" link="/billing/package/select" />
    </Alert>
  );

  renderError = (errorKind: string, error: string) => {
    if (errorKind === ErrorKind.ORG_PLAN_ERROR) {
      return this.renderOrgPlanError(errorKind, error);
    }
    return (
      <Alert key={errorKind} color="danger">
        {error}
      </Alert>
    );
  };

  render() {
    const errors = this.props.errors;
    if (!errors) {
      return null;
    }
    const errorKinds = Object.keys(errors).filter(errorKind => !isFieldError(errorKind));
    if (errorKinds.length === 0) {
      return null;
    }
    return (
      <div className="form-errors">
        {errorKinds.map(errorKind => this.renderError(errorKind, errors[errorKind]))}
      </div>
    );
  }
}

const mapStateToProps = (state: any, props: Props) => ({
  errors: getFormSubmitErrors(props.formName)(state),
});

export default withFormName(connect(mapStateToProps)(FormErrors));
