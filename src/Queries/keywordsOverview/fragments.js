// @flow
import gql from 'graphql-tag';

export const competitorValuesFragment = gql`
  fragment competitorValuesProps on KeywordOverviewGraphCompetitorNode {
    competitor {
      id
      domain
    }
    values {
      mobile {
        values {
          value
          date
        }
        compareValue
      }
      desktop {
        values {
          value
          date
        }
        compareValue
      }
    }
  }
`;

export const valuesFragment = gql`
  fragment valuesProps on KeywordOverviewGraphDevicesNode {
    mobile {
      compareValue
      values {
        value
        date
      }
    }
    desktop {
      compareValue
      values {
        value
        date
      }
    }
  }
`;
