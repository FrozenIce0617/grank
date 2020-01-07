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
      campaignChoices
    }
  }
`;

const CampaignsInput = MultiOptionsInputFactory(
  graphql(campaignsQuery, {
    props: ({ data: { error, loading, affiliate } }) => ({
      error,
      loading,
      items: affiliate ? affiliate.campaignChoices : [],
    }),
  }),
);

const CampaignsField = toFormField(CampaignsInput);

class CampaignsEditor extends Component<{}> {
  render() {
    return (
      <div>
        <Field
          name="value"
          component={CampaignsField}
          validate={Validator.array}
          placeholder={t('Enter campaigns')}
          noValueItem={t('No campaign')}
        />
      </div>
    );
  }
}
export default CampaignsEditor;
