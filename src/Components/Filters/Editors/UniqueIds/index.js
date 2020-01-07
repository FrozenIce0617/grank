// @flow
import React, { Component } from 'react';
import MultiOptionsInputFactory from '../../Common/MultiOptionsEditor/InputFactory';
import { Field } from 'redux-form';
import Validator from 'Utilities/validation';
import toFormField from 'Components/Forms/toFormField';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';

const campaignsQuery = gql`
  query affiliateInput_campaigns {
    affiliate {
      uniqueIdChoices
    }
  }
`;

const UniqueIdsInput = MultiOptionsInputFactory(
  graphql(campaignsQuery, {
    props: ({ data: { error, loading, affiliate } }) => ({
      error,
      loading,
      items: affiliate ? affiliate.uniqueIdChoices : [],
    }),
  }),
);

const UniqueIdsField = toFormField(UniqueIdsInput);

class UniqueIdsEditor extends Component<{}> {
  render() {
    return (
      <div>
        <Field
          name="value"
          component={UniqueIdsField}
          validate={Validator.array}
          placeholder={t('Enter unique IDs')}
          noValueItem={t('No unique ID')}
        />
      </div>
    );
  }
}
export default UniqueIdsEditor;
