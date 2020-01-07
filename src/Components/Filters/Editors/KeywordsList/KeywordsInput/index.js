// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment';
import { throttle } from 'lodash';
import { Async } from 'react-select';
import CustomValueRenderer from 'Components/Controls/TagsInput/CustomValueRenderer';
import OptionComponent from './OptionComponent';
import specificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';

import './form-keywords-input.scss';

const keywordsQuery = gql`
  query keywordsInput_keywords($filters: [FilterInput]!) {
    keywords(
      filters: $filters
      pagination: { page: 1, results: 25 }
      ordering: { orderBy: "keyword", order: "ASC" }
    ) {
      keywords {
        id
        keyword
        searchType
        searchEngine {
          name
          id
        }
        location
        countrylocale {
          id
          countryCode
          region
        }
      }
    }
  }
`;

type Props = {
  client: Object,
  value: Object,
  onChange: Function,
  domainId: string,
};

class KeywordsInput extends Component<Props> {
  getOptions = throttle((query, cb) => {
    const { domainId } = this.props;

    const filters = [
      {
        attribute: 'period',
        type: 'datetime',
        comparison: 'between',
        value: `["${moment().format('YYYY-MM-DD')}", "${moment().format('YYYY-MM-DD')}"]`,
      },
      {
        attribute: 'compare_to',
        type: 'datetime',
        comparison: 'eq',
        value: `${moment().format('YYYY-MM-DD')}`,
      },
      { attribute: 'domains', type: 'list', comparison: 'contains', value: `[${domainId}]` },
      { attribute: 'keyword', type: 'string', comparison: 'contains', value: query },
    ];

    this.props.client
      .query({ query: keywordsQuery, variables: { filters } })
      .then(({ data: { keywords: { keywords } } }) =>
        cb(null, {
          options: keywords.map(({ id, keyword, ...rest }) => ({
            value: id,
            label: keyword,
            ...rest,
          })),
        }),
      );
  }, 400);

  render() {
    return (
      <Async
        className={'form-keywords-input '}
        multi
        value={this.props.value}
        optionComponent={OptionComponent}
        loadOptions={this.getOptions}
        onChange={this.props.onChange}
        valueComponent={CustomValueRenderer}
        loadingPlaceholder={t('Fetching keywords')}
        placeholder={t('Type to search for keywords')}
        filterOptions={options => options}
      />
    );
  }
}

const mapStateToProps = state => ({
  domainId: (domains => (domains.value.length === 1 ? domains.value[0] : null))(
    specificFilterSelector(FilterAttribute.DOMAINS)(state),
  ),
});

export default compose(
  connect(mapStateToProps),
  withApollo,
)(KeywordsInput);
