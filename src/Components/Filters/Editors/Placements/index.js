// @flow
import React, { Component } from 'react';
import MultiOptionsInputFactory from '../../Common/MultiOptionsEditor/InputFactory';
import { Field } from 'redux-form';
import Validator from 'Utilities/validation';
import toFormField from 'Components/Forms/toFormField';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';

const placementsQuery = gql`
  query affiliateInput_placements {
    affiliate {
      placementChoices
    }
  }
`;

const PlacementsInput = MultiOptionsInputFactory(
  graphql(placementsQuery, {
    props: ({ data: { error, loading, affiliate } }) => ({
      error,
      loading,
      items: affiliate ? affiliate.placementChoices : [],
    }),
  }),
);

const PlacementsField = toFormField(PlacementsInput);

class PlacementsEditor extends Component<{}> {
  render() {
    return (
      <div>
        <Field
          name="value"
          component={PlacementsField}
          validate={Validator.array}
          placeholder={t('Enter placements')}
          noValueItem={t('No placement')}
        />
      </div>
    );
  }
}
export default PlacementsEditor;
