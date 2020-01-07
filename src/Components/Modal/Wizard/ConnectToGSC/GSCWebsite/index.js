// @flow
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Toast from 'Components/Toast';
import Skeleton from 'Components/Skeleton';
import Button from 'Components/Forms/Button';
import RadioButton from 'Components/Controls/RadioButton';
import { RadioButtonGroup } from 'Components/Forms/Fields';
import FormErrors from 'Components/Forms/FormErrors';
import { isEmpty } from 'lodash';

import { t } from 'Utilities/i18n/index';
import { graphqlOK } from 'Utilities/underdash';
import Validator from 'Utilities/validation';
import TableEmptyState from 'Components/TableEmptyState';

type Props = {
  gscWebsites: Object,
  domainId: string,
  connectionId: string,
  handleSubmit: Function,
  performCreateGSCConnection: Function,
  onSubmit: Function,
  onBack: Function,
  submitting: boolean,
  invalid: boolean,
};

type State = {};

class GSCWebsitePage extends Component<Props, State> {
  onSubmit = ({ url }) => {
    const addGoogleSearchConsoleAccountInput = {
      domainId: this.props.domainId,
      connectionId: this.props.connectionId,
      websiteUrl: url,
    };

    return this.props
      .performCreateGSCConnection({ variables: { addGoogleSearchConsoleAccountInput } })
      .then(
        ({
          data: {
            addGoogleSearchConsoleAccount: { domain: domainOb },
          },
        }) => {
          this.props.onSubmit(domainOb);
        },
        () => {
          Toast.error(t('Failed to connect to Google Search Console'));
        },
      );
  };

  getRows() {
    if (!graphqlOK(this.props)) {
      return [];
    }
    const { gscWebsites } = this.props;
    return gscWebsites.googleConnection ? gscWebsites.googleConnection.gscSites : [];
  }

  renderRows(rows) {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }

    return (
      <Field name="url" component={RadioButtonGroup} validate={Validator.required}>
        {rows.reduce((acc, website) => {
          acc.push(
            <RadioButton key={website.siteUrl} value={website.siteUrl}>
              {website.siteUrl}
            </RadioButton>,
          );
          return acc;
        }, [])}
      </Field>
    );
  }

  renderSkeleton() {
    return [1, 2, 3].map(index => (
      <Skeleton
        key={index}
        linesConfig={[{ type: 'text', options: { width: '100%', marginBottom: '10px' } }]}
      />
    ));
  }

  render() {
    const { handleSubmit, submitting, invalid, onBack } = this.props;
    const rows = this.getRows();
    const isDisabled = invalid || submitting;
    return (
      <div>
        <form onSubmit={handleSubmit(this.onSubmit)}>
          <FormErrors />
          {!isEmpty(rows) && this.renderRows(rows)}
          {graphqlOK(this.props) && (
            <TableEmptyState
              list={rows}
              title={t('No domains returned from Google Search Console.')}
              subTitle={t(
                "Please make sure you're using the correct account and that the domain has been verified in Google Search Console.",
              )}
            />
          )}
          <div className="form-actions">
            <Button theme="grey" disabled={submitting} onClick={onBack}>
              {t('Back')}
            </Button>
            {!isEmpty(rows) && (
              <Button theme="orange" disabled={isDisabled} submit>
                {t('Select')}
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  }
}

const gscWebsitesQuery = gql`
  query gscWebsitePage_gscWebsites($goaAccountID: ID!) {
    googleConnection(id: $goaAccountID) {
      gscSites {
        siteUrl
      }
    }
  }
`;

const performCreateGSCConnection = gql`
  mutation gscWebsitePage_addGoogleSearchConsoleAccount(
    $addGoogleSearchConsoleAccountInput: AddGoogleSearchConsoleAccountInput!
  ) {
    addGoogleSearchConsoleAccount(input: $addGoogleSearchConsoleAccountInput) {
      domain {
        id
      }
    }
  }
`;

export default compose(
  graphql(gscWebsitesQuery, {
    name: 'gscWebsites',
    options: (props: Props) => {
      const connectionId = props.connectionId;
      return {
        fetchPolicy: 'network-only',
        variables: {
          goaAccountID: connectionId,
        },
      };
    },
  }),
  graphql(performCreateGSCConnection, { name: 'performCreateGSCConnection' }),
)(reduxForm({ form: 'GSCWebsiteForm' })(GSCWebsitePage));
