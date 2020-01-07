// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import type { DomainsFilter, FilterBase } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import { KEYWORDS_FILTER_SET, IMPORT_GSC_FILTER_SET, NOTES_FILTER_SET } from 'Types/FilterSet';
import { FilterComparison, FilterValueType, FilterAttribute } from 'Types/Filter';
import linkWithFilters from 'Components/Filters/linkWithFilters';
import { Link } from 'react-router-dom';
import { updateScrollTarget } from 'Actions/ScrollAction';
import { store } from 'Store';

type Props = {
  domainId: string,
  children: React.Node,
  className?: string,
  scrollTo?: string,
  updateScrollTarget: Function,
  reset: boolean,
};

type ImportGSCValues = {
  country?: string,
};

const PageIdToLink = {
  overview: '/keywords/overview',
  keywords: '/keywords/list',
  competitors: '/keywords/competitors',
  competitors_ranking: '/keywords/rankings',
  landing_pages: '/keywords/landing-pages',
  tags: '/keywords/tags',
  notes: '/notes',
};

export function linkToPageWithDomains(
  page: string,
  domains: string | string[],
  filterSet?: FilterSet,
  newFilters?: FilterBase[],
  reset: boolean = false,
) {
  const domainsFilter: DomainsFilter = {
    attribute: FilterAttribute.DOMAINS,
    type: FilterValueType.LIST,
    comparison: FilterComparison.CONTAINS,
    value: Array.isArray(domains) ? domains : [domains],
  };
  if (reset && domainsFilter.value.length === 1) {
    // Update page to page from settings
    const defaultKeywordsPage = store.getState().user.defaultKeywordsPage;
    const newPage = PageIdToLink[defaultKeywordsPage];

    if (newPage === PageIdToLink.notes) {
      filterSet = NOTES_FILTER_SET;
    }
    page = newPage || page;
  }
  return linkWithFilters(page, [domainsFilter, ...(newFilters || [])], filterSet, [], reset);
}

export function linkToImportGSCWithDomains(
  domains: string | string[],
  { country }: ImportGSCValues,
) {
  return linkToPageWithDomains('/keywords/import/gsc', domains, IMPORT_GSC_FILTER_SET, [
    {
      attribute: FilterAttribute.COUNTRY_NAME,
      type: FilterValueType.STRING,
      comparison: FilterComparison.CONTAINS,
      value: (country || '': string),
    },
  ]);
}

export function linkToKeywordsDomain(domainId: any) {
  return linkToPageWithDomains('/keywords/list', domainId, KEYWORDS_FILTER_SET);
}

class LinkToDomain extends React.Component<Props> {
  static defaultProps = {
    reset: false,
  };

  handleLink = () => {
    if (this.props.scrollTo) {
      this.props.updateScrollTarget(this.props.scrollTo);
    }
  };

  render() {
    const { domainId, className, children, reset } = this.props;
    return (
      <Link
        to={linkToPageWithDomains('/keywords/overview', domainId, KEYWORDS_FILTER_SET, [], reset)}
        tabIndex={0}
        onClick={this.handleLink}
        className={className}
      >
        {children}
      </Link>
    );
  }
}

export default connect(
  null,
  { updateScrollTarget },
)(LinkToDomain);
