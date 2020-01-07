// @flow
import React, { Component } from 'react';
import { withApollo, compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { showModal } from 'Actions/ModalAction';
import SimpleDropdownList from 'Components/Controls/Dropdowns/SimpleDropdownList';
import { t } from 'Utilities/i18n/index';
import gql from 'graphql-tag';
import Toast from 'Components/Toast';
import EditIcon from 'icons/edit.svg?inline';
import './more-actions.scss';
import { copyToClipboard } from 'Utilities/underdash';
import { mutationStarKeywords } from 'Pages/Keywords/Table/mutations';
import { isEmpty } from 'lodash';
import type { FilterBase } from 'Types/Filter';
import { merge } from 'lodash';
import { isShownInFilterBar } from 'Types/FilterSet';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';

type KeywordData = {
  id: string,
  keyword: string,
};

type ItemOptions = {
  label: string,
  id: string,
  showWithoutKeywords?: boolean,
  hideWhenSelectAll?: boolean,
  action: Function,
};

type Props = {
  allKeywords: KeywordData[],
  showModal: Function,
  starKeywords: Function,
  scrapeKeywords: Function,
  copyToClipboardKeywords: Function,
  domainId: string,
  allKeywords: KeywordData[],
  keywords: KeywordData[],
  shouldExclude: boolean,
  filters: FilterBase[],
  numResults: number,
  optimisticUpdate: Function,
  refresh: Function,
  keywordRefreshDisabled: boolean,
  client: Object,
};

type State = {
  tooltipOpen: boolean,
};

const keywordsQuery = gql`
  query moreActions_keywords(
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

class MoreActions extends Component<Props, State> {
  state = {
    tooltipOpen: false,
  };

  getItems(): Array<ItemOptions> {
    const result = [];

    result.push({
      label: t('Refresh'),
      id: 'refresh',
      action: this.handleScrape,
    });

    result.push({
      label: t('Add note'),
      id: 'note',
      showWithoutKeywords: true,
      hideWhenSelectAll: this.hasFilters() && this.props.shouldExclude,
      action: this.handleAddNote,
    });

    result.push({
      label: t('Add tags'),
      id: 'tags',
      action: this.handleAddTags,
    });

    result.push({
      label: t('Add stars'),
      id: 'stars',
      action: () => {
        this.handleChangeStars(true);
      },
    });

    result.push({
      label: t('Change settings'),
      id: 'editKeywords',
      action: this.handleEditAction,
    });

    result.push({
      label: t('Change preferred URL'),
      id: 'preferredUrl',
      action: this.handleLandingPage,
    });

    result.push({
      label: t('Duplicate'),
      id: 'duplicate',
      action: this.handleDuplicateKeywords,
    });

    result.push({
      label: t('Move to other domain'),
      id: 'moveToOtherDomain',
      action: this.handleMoveKeywords,
    });

    result.push({
      label: t('Copy to clipboard'),
      id: 'copyToClipboard',
      action: this.handleCopyToClipboard,
    });

    return result;
  }

  handleSelect = (item: any) => {
    item.action();
  };

  hasFilters = () =>
    this.props.filters.some(filter => isShownInFilterBar(filter.attribute, KEYWORDS_FILTER_SET));

  handleLandingPage = () => {
    const { optimisticUpdate, keywords, shouldExclude, domainId } = this.props;
    this.props.showModal({
      modalType: 'LandingPage',
      modalTheme: 'light',
      modalProps: {
        keywords,
        shouldExclude,
        domainId,
        optimisticUpdate,
      },
    });
  };

  getIds = keywords => keywords.map(keywordData => keywordData.id);

  getKeywordsInput = () => {
    const { keywords, shouldExclude, filters } = this.props;
    const ids = this.getIds(keywords);
    return shouldExclude
      ? {
          keywordsToExclude: ids,
          filters,
        }
      : {
          keywords: ids,
        };
  };

  handleChangeStars = starred => {
    const { optimisticUpdate, keywords, shouldExclude } = this.props;
    const onRealUpdate = optimisticUpdate({
      ids: this.getIds(keywords),
      item: { starred },
      isExcluded: shouldExclude,
    });
    this.props
      .starKeywords({
        input: {
          ...this.getKeywordsInput(),
          starred,
        },
      })
      .catch(() => {
        onRealUpdate();
        Toast.error(t('Could not star keywords'));
      });
  };

  keywordsToCopy = keywords => keywords.map(({ keyword }) => keyword).join('\r\n');

  handleCopyToClipboard = () => {
    const { shouldExclude, filters, numResults } = this.props;
    if (!shouldExclude) {
      copyToClipboard(this.keywordsToCopy(this.props.keywords));
      Toast.success(t('Keywords copied to clipboard'));
      return;
    }

    this.props.showModal({
      modalType: 'CopyToClipboard',
      modalProps: {
        confirmButtonLabel: t('Copy keywords'),
        value: this.props.client
          .query({
            fetchPolicy: 'network-only',
            query: keywordsQuery,
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
          })
          .then(({ data: { keywords: { keywords } } }) => this.keywordsToCopy(keywords)),
      },
    });
  };

  handleScrape = () => {
    const { keywordRefreshDisabled, optimisticUpdate, keywords, shouldExclude } = this.props;
    if (keywordRefreshDisabled) {
      this.props.showModal({
        modalType: 'Confirmation',
        modalProps: {
          title: t('Degraded Performance'),
          lockDuration: 0,
          description: (
            <div style={{ textAlign: 'left' }}>
              <p>{t('Dear Customer')}</p>
              <p>
                {t(
                  'Due to degraded performance, manual keyword refresh has been temporarily disabled.',
                )}
                <br />
                {t('Your keywords will still get automatically updated daily.')}
              </p>
              <p>{t('We apologize for any inconvenience caused by this.')}</p>
            </div>
          ),
          showCancelLabel: false,
          confirmLabel: t('OK'),
        },
      });
      return;
    }

    const onRealUpdate = optimisticUpdate({
      ids: this.getIds(keywords),
      item: {
        rank: {
          rank: -1,
        },
      },
      merger: merge,
      isExcluded: shouldExclude,
    });
    this.props
      .scrapeKeywords({
        variables: {
          input: {
            ...this.getKeywordsInput(),
            scrape: true,
          },
        },
      })
      .catch(() => {
        onRealUpdate();
        Toast.error(t('Could not refresh keywords'));
      });
  };

  handleDuplicateKeywords = () => {
    const { keywords, refresh, filters, numResults, shouldExclude } = this.props;
    this.props.showModal({
      modalType: 'AddKeywords',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        gscKeywords: keywords,
        numResults,
        shouldExclude,
        filters,
        refresh,
      },
    });
  };

  handleAddTags = () => {
    const { optimisticUpdate, keywords, refresh, shouldExclude } = this.props;
    this.props.showModal({
      modalType: 'AddTags',
      modalTheme: 'light',
      modalProps: {
        keywords,
        refresh,
        shouldExclude,
        optimisticUpdate,
      },
    });
  };

  handleAddNote = () => {
    const { keywords, refresh, domainId, shouldExclude } = this.props;
    this.props.showModal({
      modalType: 'AddNote',
      modalTheme: 'light',
      modalProps: {
        keywords,
        domainId,
        shouldExclude,
        refresh,
      },
    });
  };

  handleEditAction = () => {
    const { allKeywords, keywords, shouldExclude, optimisticUpdate } = this.props;
    this.props.showModal({
      modalType: 'EditKeywords',
      modalTheme: 'light',
      modalProps: {
        allKeywords,
        keywords,
        shouldExclude,
        optimisticUpdate,
      },
    });
  };

  handleMoveKeywords = () => {
    const { keywords, refresh, domainId, shouldExclude } = this.props;
    this.props.showModal({
      modalType: 'MoveKeywords',
      modalTheme: 'light',
      modalProps: {
        keywords,
        domainId,
        refresh,
        shouldExclude,
      },
    });
  };

  toggleTooltip = () => {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  };

  render() {
    const { keywords, shouldExclude, numResults } = this.props;
    const allItems = this.getItems().filter((item: ItemOptions) => {
      if (!isEmpty(keywords)) {
        return !shouldExclude || !item.hideWhenSelectAll;
      }

      if (shouldExclude) {
        return !item.hideWhenSelectAll && numResults !== 0;
      }

      return item.showWithoutKeywords;
    });
    const numKeywords = !isEmpty(keywords) ? keywords.length : 0;
    const placeholder = `${!shouldExclude ? numKeywords : numResults - numKeywords} ${t(
      'selected',
    )}`;

    return !isEmpty(allItems) ? (
      <div className="more-actions">
        <SimpleDropdownList
          labelFunc={menuItem => menuItem.label}
          items={allItems}
          icon={<EditIcon />}
          placeholder={t('Edit ...')}
          item={{ label: placeholder }}
          onSelect={this.handleSelect}
        />
      </div>
    ) : null;
  }
}

const updateKeywordsQuery = gql`
  mutation moreActions_updateKeywords($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

const mapStateToProps = state => ({
  keywordRefreshDisabled: state.user.organization.errors.keywordRefreshDisabled,
});

export default compose(
  withApollo,
  connect(
    mapStateToProps,
    { showModal },
  ),
  mutationStarKeywords(),
  graphql(updateKeywordsQuery, { name: 'scrapeKeywords' }),
)(MoreActions);
