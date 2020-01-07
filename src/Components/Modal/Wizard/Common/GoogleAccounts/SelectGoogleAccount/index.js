// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import Button from 'Components/Forms/Button';
import { Select } from 'Components/Forms/Fields';
import { IntegrationOAuthProviders } from 'Types/Integration';

import { t, tct } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';
import Validator from 'Utilities/validation';

type Props = {
  handleSubmit: Function,
  goaAccounts: Object,
  onAdd: Function,
  onRemove: Function,
  accountId: string,
  initialValues: Object,
  onCancel: Function,
  onSubmit: Function,
};

type State = {};

class SelectGoogleAccount extends Component<Props, State> {
  onSubmit = ({ goaAccount: { value } }) => {
    this.props.onSubmit({ connectionId: value });
  };

  render() {
    const loading =
      underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props });
    const {
      goaAccounts: { user },
      handleSubmit,
      initialValues,
    } = this.props;
    const options = loading
      ? []
      : user.organization.googleConnections
          .filter(item => item.type === IntegrationOAuthProviders.GOOGLE_ACCOUNT.type)
          .map(({ id, description }) => ({
            value: id,
            label: description,
          }));

    if (options.length > 0) {
      return (
        <form onSubmit={handleSubmit(this.onSubmit)}>
          <div className="form-label">
            {t(
              'Select the Google connection you want to use for connecting this domain to Google Analytics.',
            )}
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
              "Don't see the Google Account you are looking for? You can always add an additional account [link:here].",
              {
                link: <a onClick={this.props.onAdd} className="link" />,
              },
            )}
          </div>

          {this.props.accountId != null && (
            <div className="alert alert-warning mt-2">
              <div className="form-label">
                {tct(
                  'This domain is already connected to [account] Google Account, you can connect to another account above or disconnect [link:here].',
                  {
                    account: (
                      <strong>
                        {initialValues.goaAccount ? initialValues.goaAccount.label : null}
                      </strong>
                    ),
                    link: <a onClick={this.props.onRemove} className="link" />,
                  },
                )}
              </div>
            </div>
          )}

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
        <p>{t('We could not find a connected Google Account, please set one up first.')}</p>
        <div className="form-actions">
          <Button theme="grey" onClick={this.props.onCancel}>
            {t('Cancel')}
          </Button>
          <Button theme="orange" onClick={this.props.onAdd}>
            {t('Connect an Google account')}
          </Button>
        </div>
      </div>
    );
  }
}

const goaAccountsQuery = gql`
  query selectGoogleAccount_goaAccounts {
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
  reduxForm({ form: 'SelectGoogleAccountForm' }),
)(SelectGoogleAccount);
