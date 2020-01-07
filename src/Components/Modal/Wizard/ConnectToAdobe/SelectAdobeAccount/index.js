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

type Props = {
  handleSubmit: Function,
  adobeAccounts: Object,
  onAdd: Function,
  onRemove: Function,
  initialValues: Object,
  onCancel: Function,
  onSubmit: Function,
  accountId?: string,
};

type State = {};

class SelectAdobeAccount extends Component<Props, State> {
  onSubmit = ({ adobeAccount: { value } }) => {
    this.props.onSubmit({ connectionId: value });
  };

  render() {
    const loading =
      underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props });
    const {
      adobeAccounts: { user },
      handleSubmit,
      initialValues,
    } = this.props;
    const options = loading
      ? []
      : user.organization.adobeMarketingConnections.map(({ id, description }) => ({
          value: id,
          label: description,
        }));

    if (options.length > 0) {
      return (
        <form onSubmit={handleSubmit(this.onSubmit)}>
          <div className="form-label">
            {t(
              'Select the Adobe connection you want to use for connecting this domain to Adobe Analytics.',
            )}
          </div>
          <FormGroup className="indented-form-group">
            <Field
              defaultBehaviour
              name="adobeAccount"
              id="adobeAccount"
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
              "Don't see the Adobe Account you are looking for? You can always add an additional account [link:here].",
              {
                link: <a onClick={this.props.onAdd} className="link" />,
              },
            )}
          </div>

          {this.props.accountId != null && (
            <div className="alert alert-warning mt-2">
              <div className="form-label">
                {tct(
                  'This domain is already connected to [account] Adobe Account, you can connect to another account above or disconnect [link:here].',
                  {
                    account: (
                      <strong>
                        {initialValues.adobeAccount ? initialValues.adobeAccount.label : null}
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
        <p>{t('We could not find a connected Adobe Account, please set one up first.')}</p>
        <div className="form-actions">
          <Button theme="grey" onClick={this.props.onCancel}>
            {t('Cancel')}
          </Button>
          <Button theme="orange" onClick={this.props.onAdd}>
            {t('Connect an Adobe account')}
          </Button>
        </div>
      </div>
    );
  }
}

const adobeAccountsQuery = gql`
  query selectAdobeAccount_adobeAccounts {
    user {
      id
      organization {
        id
        adobeMarketingConnections {
          id
          description
        }
      }
    }
  }
`;

export default compose(
  graphql(adobeAccountsQuery, {
    props: ({ ownProps, data, data: { error, loading, user } }) => {
      if (error || loading) {
        return { adobeAccounts: data };
      }

      const currentAccount = user.organization.adobeMarketingConnections.find(
        connection => ownProps.accountId === connection.id,
      );
      let adobeAccount;
      if (
        user.organization.adobeMarketingConnections.find(
          connection => ownProps.accountId === connection.id,
        )
      ) {
        adobeAccount = {
          label: currentAccount.description,
          value: currentAccount.id,
        };
      }
      return {
        adobeAccounts: data,
        initialValues: {
          adobeAccount,
        },
      };
    },
  }),
  reduxForm({ form: 'SelectAdobeAccountForm' }),
)(SelectAdobeAccount);
