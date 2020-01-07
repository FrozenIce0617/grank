import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import AccurankerDropdown from '../AccurankerDropdown';
import AtoDjango from 'Utilities/django';

import { t } from 'Utilities/i18n';
import underdash from 'Utilities/underdash';

import SearchIcon from 'icons/search-2.svg';

class QuickSearch extends Component {
  searchQueryChanged = query => {
    this.props.data.refetch({
      searchQuery: query,
    });
  };

  render() {
    let searchData = [];
    if (
      !underdash.graphqlError({ ...this.props }) &&
      !underdash.graphqlLoading({ ...this.props })
    ) {
      searchData = this.props.data.domainsList.map(domain => ({
        href: `/keywords/overview/${domain.id}/`,
        icon: domain.faviconUrl,
        text: domain.displayName,
      }));
    }
    const optionDropdownConfig = [
      {
        type: 'header',
        text: t('Quick add'),
      },
      {
        type: 'item',
        tag: AtoDjango,
        href: '#',
        text: t('Add new group'),
      },
      {
        type: 'item',
        tag: AtoDjango,
        href: '#',
        text: t('Add new domain'),
      },
    ];
    return (
      <AccurankerDropdown
        placeholder={t('Quick navigate')}
        icon={SearchIcon}
        optionDropdownConfig={optionDropdownConfig}
        searchQueryChanged={this.searchQueryChanged}
        searchData={searchData}
      />
    );
  }
}

const domainSearchQuery = gql`
  query quickSearch_domainSearch($searchQuery: String!) {
    domainsList(searchQuery: $searchQuery) {
      id
      displayName
      faviconUrl
    }
  }
`;

export default compose(
  graphql(domainSearchQuery, {
    options: ({ searchQuery }) => ({
      variables: {
        searchQuery: searchQuery || '',
      },
    }),
  }),
)(QuickSearch);
