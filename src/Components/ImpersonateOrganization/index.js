import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import AccurankerDropdown from '../AccurankerDropdown';

import { t } from 'Utilities/i18n';
import underdash from 'Utilities/underdash';

import SearchIcon from 'icons/search-2.svg?inline';

class ImpersonateOrganization extends Component {
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
      searchData = this.props.data.impersonateOrganizationList.organizations.map(organization => ({
        href: `/accuranker_admin/impersonate_organization/${organization.slug}/`,
        icon: organization.logo,
        text: organization.name,
      }));
    }
    return (
      <AccurankerDropdown
        placeholder={t('Impersonate organization')}
        icon={SearchIcon}
        searchQueryChanged={this.searchQueryChanged}
        searchData={searchData}
      />
    );
  }
}

const impersonateOrganizationQuery = gql`
  query impersonateOrganization_impersonateOrganizations($searchQuery: String!) {
    impersonateOrganizationList(searchQuery: $searchQuery) {
      organizations {
        slug
        logo
        name
      }
    }
  }
`;

export default compose(
  graphql(impersonateOrganizationQuery, {
    options: ({ searchQuery }) => ({
      variables: {
        searchQuery: searchQuery || '',
      },
    }),
  }),
)(ImpersonateOrganization);
