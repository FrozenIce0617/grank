// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import Skeleton from 'Components/Skeleton';
import gql from 'graphql-tag';

type Props = {
  localeId: number,
  loading: boolean,
  error: string,
  countrylocale: {
    region: string,
    locale: string,
    countryCode: string,
  },
};

class CountryLocaleLabel extends React.Component<Props> {
  render() {
    if (this.props.loading || this.props.error) {
      return (
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '120px', marginBottom: '10px' } }]}
        />
      );
    }
    const localeData = this.props.countrylocale;
    return (
      <span>
        <span className={`flag-icon flag-icon-${localeData.countryCode.toLowerCase()} mr-1`} />
        {localeData.region} - {localeData.locale}
      </span>
    );
  }
}

const localeQuery = gql`
  query countryLocaleLabel_getLocale($ids: [ID]!) {
    countrylocales(ids: $ids) {
      id
      countryCode
      region
      locale
    }
  }
`;

export default compose(
  graphql(localeQuery, {
    options: (props: Props) => ({
      variables: {
        ids: [props.localeId],
      },
    }),
    props: ({ data: { error, loading, countrylocales } }) => {
      const countryLocale = countrylocales && countrylocales[0];
      return {
        error,
        loading,
        countrylocale: countryLocale,
      };
    },
  }),
)(CountryLocaleLabel);
