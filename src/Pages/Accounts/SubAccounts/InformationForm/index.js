// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { FormGroup } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Button from 'Components/Forms/Button';
import { changeIsPartner } from 'Actions/UserAction';
import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';

type Props = {
  handleSubmit: Function,
  invalid: boolean,
  performUpdateAccount: Function,
  submitting: boolean,
  user: Object,
  changeIsPartner: Function,
};

class SubAccountsInformationForm extends Component<Props> {
  handleSubmit = () => {
    const {
      user: {
        organization: { id, name },
      },
    } = this.props;
    return this.props
      .performUpdateAccount({
        variables: {
          input: {
            id,
            name,
            isPartner: true,
          },
        },
      })
      .then(({ data: { updateOrganization: { errors } } }) => {
        if (errors && errors.length) {
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          this.props.changeIsPartner(true);
        }
      });
  };

  render() {
    const {
      handleSubmit,
      invalid,
      submitting,
      user: { isOrgAdmin },
    } = this.props;
    return (
      <form className="subaccounts-information-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <p>
          {t(
            'Sub-accounts enables you to manage additional AccuRanker accounts from your main account. You can control whether this account or the sub-account should handle billing.',
          )}
        </p>
        <FormGroup className="indented-form-group">
          <hr />
          {!isOrgAdmin && <p>{t('You must be an administrator to enable sub-accounts.')}</p>}
          <div className="confirmation-button-wrapper text-right">
            <Button disabled={invalid || submitting || !isOrgAdmin} submit theme="orange">
              {t('Enable sub-accounts')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

const performUpdateAccountQuery = gql`
  mutation subAccountsInformationForm_updateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
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
    { changeIsPartner },
  ),
  graphql(performUpdateAccountQuery, { name: 'performUpdateAccount' }),
)(reduxForm({ form: 'SubAccountsInformationForm' })(SubAccountsInformationForm));
