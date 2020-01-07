// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import Button from 'Components/Forms/Button';
import { Select } from 'Components/Forms/Fields';

import { t, tct } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';
import Validator from 'Utilities/validation';
import type { IntegrationOAuthProvider } from 'Types/Integration';

type Props = {
  handleSubmit: Function,
  goaAccounts: Object,
  onAdd: Function,
  onCancel: Function,
  onSubmit: Function,
  integration: IntegrationOAuthProvider,
};

type State = {};

class SelectOAuthAccount extends Component<Props, State> {
  onSubmit = ({ goaAccount: { value } }) => {
    this.props.onSubmit({ connectionId: value });
  };

  render() {
    const loading =
      underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props });
    const {
      goaAccounts: { user },
      handleSubmit,
      integration,
    } = this.props;

    const { name: accountName, type } = integration;
    const options = loading
      ? []
      : user.organization.googleConnections
          .filter(item => item.type === type)
          .map(({ id, description }) => ({
            value: id,
            label: description,
          }));

    if (options.length > 0) {
      return (
        <form onSubmit={handleSubmit(this.onSubmit)}>
          <div className="form-label">
            {t('Select the %s connection you want to use for keywords import.', accountName)}
          </div>
          <FormGroup className="indented-form-group">
            <Field
              defaultBehaviour
              name="goaAccount"
              id="goaAccount"
              elementType="customSelect"
              type="text"
              placeholder={''}
              component={Select}
              loading={loading}
              options={options}
              validate={Validator.required}
            />
          </FormGroup>
          <div className="form-label">
            {tct(
              "Don't see the [accountName] account you are looking for? You can always add an additional account [link:here].",
              {
                accountName,
                link: <a onClick={this.props.onAdd} className="link" />,
              },
            )}
          </div>

          <div className="form-actions">
            <Button theme="grey" onClick={this.props.onCancel}>
              {t('Cancel')}
            </Button>
            <Button theme="orange" submit>
              {t('Select account')}
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div>
        <p>
          {t('We could not find a connected %s Account, please set one up first.', accountName)}
        </p>
        <div className="form-actions">
          <Button theme="grey" onClick={this.props.onCancel}>
            {t('Cancel')}
          </Button>
          <Button theme="orange" onClick={this.props.onAdd}>
            {t('Connect an %s account', accountName)}
          </Button>
        </div>
      </div>
    );
  }
}

const goaAccountsQuery = gql`
  query selectOAuthAccount_goaAccounts {
    user {
      id
      organization {
        id
        googleConnections {
          id
          type
          description
        }
      }
    }
  }
`;

export default compose(
  graphql(goaAccountsQuery, {
    props: ({ ownProps, data, data: { error, loading, user } }) => {
      if (error || loading) {
        return { goaAccounts: data };
      }

      const currentAccount = user.organization.googleConnections.find(
        connection => ownProps.accountId === connection.id,
      );
      let goaAccount;
      if (
        user.organization.googleConnections.find(connection => ownProps.accountId === connection.id)
      ) {
        goaAccount = {
          label: currentAccount.description,
          value: currentAccount.id,
        };
      }
      return {
        goaAccounts: data,
        initialValues: {
          goaAccount,
        },
      };
    },
  }),
  reduxForm({ form: 'SelectOAuthAccountForm' }),
)(SelectOAuthAccount);
