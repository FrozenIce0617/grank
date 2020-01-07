// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { LocaleDropdownField } from 'Components/Forms/Fields';
import gql from 'graphql-tag';
import { Field } from 'redux-form';
import { t } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';
import Skeleton from 'Components/Skeleton';
import Validator from 'Utilities/validation';

type Props = {
  locales: Object,
};

class CountryLocaleEditor extends Component<Props> {
  parse = (value: string) => parseInt(value, 10);

  format = (value: any) => value && value.toString();

  render() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      // Fake field to prevent submit while loading
      return (
        <div>
          <Skeleton
            linesConfig={[{ type: 'text', options: { width: '100%', marginBottom: '10px' } }]}
          />
          <Field
            name="value"
            component="input"
            type="hidden"
            validate={[Validator.required, Validator.numeric]}
          />
        </div>
      );
    }
    const {
      locales: { countrylocales },
    } = this.props;
    return (
      <div>
        <Field
          autoFocus
          name="value"
          component={LocaleDropdownField}
          format={this.format}
          parse={this.parse}
          placeholder={t('Select locale')}
          validate={[Validator.required, Validator.numeric]}
          locales={countrylocales}
        />
      </div>
    );
  }
}

const localesQuery = gql`
  query countryLocaleEditor_countrylocales {
    countrylocales {
      id
      countryCode
      region
      locale
    }
  }
`;

export default compose(graphql(localesQuery, { name: 'locales' }))(CountryLocaleEditor);
