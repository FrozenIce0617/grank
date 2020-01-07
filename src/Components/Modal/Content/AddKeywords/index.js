// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { uniq } from 'lodash';
import { withRouter } from 'react-router';

import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import linkWithFilters from 'Components/Filters/linkWithFilters';

import { DESKTOP } from 'Types/Filter';
import type { FilterBase } from 'Types/Filter';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';

import AddKeywordsSkeleton from './Skeleton';
import AddKeywordsForm from './AddKeywordsForm';
import type { SearchEngine, KeywordSettings } from './AddKeywordsForm/types';

import { t } from 'Utilities/i18n';
import underdash from 'Utilities/underdash';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';

import { hideModal } from 'Actions/ModalAction';

import './add-keywords.scss';

type Props = {
  hideModal: Function,
  data: any,
  domainId: string,
  addKeywords: Function,
  hasGSC: Object,
  gscKeywords?: {
    keyword: string,
  }[],
  showHelpOverlay?: boolean,
  refresh: Function,
  history: Object,
  filters: FilterBase[],
  shouldExclude: boolean,
  numResults: number,
  keywordsData: Object,
};

type FormProps = {
  keywords: string[],
  tags: string[],
  locations: string[],
  localeId: string,
  searchEngines: SearchEngine[],
  keywordSettings: KeywordSettings,
  hasGSC: boolean,
};

const SEARCH_TYPE_GOOGLE = 'google';
const SEARCH_TYPE_BING = 'bing';
const SEARCH_TYPE_YAHOO = 'yahoo';

const transformLocalesData = (data: any) =>
  data.map(localeData => {
    const searchEngines = [];
    if (localeData.googleSupport) {
      searchEngines.push(SEARCH_TYPE_GOOGLE);
    }
    if (localeData.bingSupport) {
      searchEngines.push(SEARCH_TYPE_BING);
    }

    return {
      id: localeData.id,
      region: localeData.region,
      countryCode: localeData.countryCode,
      localeShort: localeData.localeShort,
      locale: localeData.locale,
      searchEngines,
    };
  });

const searchEngineToIdMap = {
  [SEARCH_TYPE_GOOGLE]: 1,
  [SEARCH_TYPE_BING]: 2,
  [SEARCH_TYPE_YAHOO]: 3,
};

const getSearchEngineId = (searchEngine: string) => searchEngineToIdMap[searchEngine];

class AddKeywords extends Component<Props> {
  onClose = () => {
    this.props.hideModal();
  };

  openHelperOverlay = () => {
    this.props.hideModal();
  };

  handleSubmit = (data: FormProps) => {
    const input = {
      domain: this.props.domainId,
      countrylocale: data.localeId,
      locations: data.locations,
      searchEngines: data.searchEngines.map(searchEngine => ({
        id: getSearchEngineId(searchEngine.id),
        searchTypes: searchEngine.searchTypes,
      })),
      ignoreLocalResults: data.keywordSettings.ignoreLocalResults,
      ignoreFeaturedSnippet: data.keywordSettings.ignoreFeaturedSnippet,
      ignoreInShareOfVoice: data.keywordSettings.ignoreInShareOfVoice,
      enableAutocorrect: data.keywordSettings.enableAutocorrect,
      starred: data.keywordSettings.starred,
      tags: data.tags,
      keywords: data.keywords.map(el => el.trim()).filter(el => el.length !== 0),
    };
    return this.props
      .addKeywords({ variables: { input } })
      .then(({ data: { addKeywords: { errors } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        }
        this.props.hideModal();
      }, throwNetworkError)
      .then(() => {
        if (this.props.gscKeywords) {
          const link = linkWithFilters('/keywords/list', [], KEYWORDS_FILTER_SET);
          this.props.history.replace(link);
        }
        this.props.refresh && this.props.refresh();
      });
  };

  render() {
    const { hasGSC, shouldExclude, gscKeywords, keywordsData } = this.props;

    let content = null;
    if (underdash.graphqlLoading(this.props)) {
      content = <AddKeywordsSkeleton />;
    } else {
      const locales = transformLocalesData(this.props.data.countrylocales);
      const localeObj = transformLocalesData([hasGSC.domain.defaultCountrylocale])[0];

      let keywords = gscKeywords ? gscKeywords.map(({ keyword }) => keyword) : [];
      if (shouldExclude) {
        keywords = keywordsData.keywords.keywords
          .map(item => item.keyword)
          .filter(keyword => !keywords.includes(keyword));
      }

      const initialValues = {
        keywords: uniq(keywords),
        tags: [],
        locations: [''],
        localeId: localeObj.id,
        searchEngines: localeObj.searchEngines.map(searchEngineId => ({
          id: searchEngineId,
          searchTypes: searchEngineId === SEARCH_TYPE_GOOGLE ? [DESKTOP] : [],
        })),
        keywordSettings: {
          starred: false,
          ignoreLocalResults: false,
          ignoreFeaturedSnippet: false,
          ignoreInShareOfVoice: false,
          enableAutocorrect: false,
        },
      };
      const isGSCEnabled = !!hasGSC.domain.googleOauthConnectionGsc;
      const country = hasGSC && hasGSC.domain ? hasGSC.domain.defaultCountrylocale.region : '';
      content = (
        <AddKeywordsForm
          locales={locales}
          initialValues={initialValues}
          onCancel={this.props.hideModal}
          onSubmit={this.handleSubmit}
          hasGSC={isGSCEnabled}
          country={country}
          openHelperOverlay={this.openHelperOverlay}
          domain={this.props.domainId}
          refresh={this.props.refresh}
        />
      );
    }
    return (
      <ModalBorder className="add-keywords" title={t('Add Keywords')} onClose={this.onClose}>
        {content}
      </ModalBorder>
    );
  }
}

const keywordsQuery = gql`
  query addKeywords_keywords(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keywords {
        id
        keyword
      }
    }
  }
`;

const getLocalesQuery = gql`
  query addKeywords_countrylocales {
    countrylocales {
      id
      locale
      region
      countryCode
      localeShort
      googleSupport
      bingSupport
    }
  }
`;

const addKeywords = gql`
  mutation addKeywords_addKeywords($input: AddKeywordsInput!) {
    addKeywords(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const hasGSCQuery = gql`
  query addKeywords_domain($domainId: ID!) {
    domain(id: $domainId) {
      id
      defaultCountrylocale {
        id
        locale
        region
        countryCode
        localeShort
        googleSupport
        bingSupport
      }
      googleOauthConnectionGsc {
        id
      }
    }
  }
`;

export default compose(
  graphql(getLocalesQuery),
  graphql(keywordsQuery, {
    name: 'keywordsData',
    options: props => {
      const { filters, numResults } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          pagination: {
            page: 1,
            startIndex: 0,
            stopIndex: numResults,
            results: 0,
          },
          ordering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
        },
      };
    },
    skip: props => !props.shouldExclude,
  }),
  graphql(hasGSCQuery, { name: 'hasGSC', options: () => ({ fetchPolicy: 'network-only' }) }),
  graphql(addKeywords, { name: 'addKeywords' }),
  connect(
    null,
    { hideModal },
  ),
  withRouter,
)(AddKeywords);
