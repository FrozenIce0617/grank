// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { showModal } from 'Actions/ModalAction';
import SimpleDropdownList from 'Components/Controls/Dropdowns/SimpleDropdownList';
import type { FilterBase } from 'Types/Filter';
import { tn, t } from 'Utilities/i18n/index';
import gql from 'graphql-tag';
import Toast from 'Components/Toast';
import RemoveIcon from 'icons/remove.svg?inline';
import '../MoreActions/more-actions.scss';
import { mutationStarKeywords } from 'Pages/Keywords/Table/mutations';

type KeywordData = {
  id: string,
  keyword: string,
};

type Props = {
  showModal: Function,
  deleteKeywords: Function,
  starKeywords: Function,
  keywords: KeywordData[],
  shouldExclude: boolean,
  filters: FilterBase[],
  numResults: number,
  refresh: Function,
  optimisticUpdate: Function,
};

class MoreRemoveActions extends Component<Props> {
  getItems = () => [
    {
      label: t('Delete tags'),
      id: 'tags',
      action: this.handleDeleteTags,
    },
    {
      label: t('Delete stars'),
      id: 'stars',
      action: () => {
        this.handleChangeStars(false);
      },
    },
    {
      label: t('Delete keywords'),
      id: 'delete',
      action: this.handleDeleteAction,
    },
  ];

  handleSelect = (item: any) => {
    item.action();
  };

  getIds = keywords => keywords.map(keywordData => keywordData.id);

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
        Toast.error(t('Could not remove star from keywords'));
      });
  };

  getKeywordsInput = () => {
    const { keywords, shouldExclude, filters } = this.props;
    const ids = keywords.map(keywordData => keywordData.id);
    return shouldExclude
      ? {
          keywordsToExclude: ids,
          filters,
        }
      : {
          keywords: ids,
        };
  };

  handleDeleteTags = () => {
    const { keywords, optimisticUpdate, shouldExclude } = this.props;
    this.props.showModal({
      modalType: 'RemoveTags',
      modalTheme: 'light',
      modalProps: {
        keywords,
        optimisticUpdate,
        shouldExclude,
      },
    });
  };

  handleDeleteAction = () => {
    const { keywords } = this.props;
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: tn('Delete Keyword?', 'Delete Keywords?', keywords.length),
        description: tn(
          'The keyword will be permanently deleted.',
          'The keywords will be permanently deleted.',
          this.props.keywords.length,
        ),
        confirmLabel: tn('Delete keyword', 'Delete keywords', keywords.length),
        cancelLabel: t('Cancel'),
        action: () => {
          const { optimisticUpdate, shouldExclude } = this.props;
          const onRealUpdate = optimisticUpdate({
            ids: this.getIds(keywords),
            item: { deleted: true },
            isExcluded: shouldExclude,
          });
          this.props
            .deleteKeywords({
              variables: {
                input: {
                  ...this.getKeywordsInput(),
                  delete: true,
                },
              },
            })
            .then(() => {
              Toast.success(t('Updated'));
              // this.props.refresh();
            })
            .catch(() => {
              Toast.error(t('Could not delete keywords'));
              onRealUpdate();
            });
        },
      },
    });
  };

  render = () => {
    const { keywords, shouldExclude, numResults } = this.props;
    const allItems = this.getItems();
    const numKeywords = !isEmpty(keywords) ? keywords.length : 0;
    const placeholder = `${!shouldExclude ? numKeywords : numResults - numKeywords} ${t(
      'selected',
    )}`;

    return keywords.length > 0 || (shouldExclude && numResults !== 0) ? (
      <div className="more-actions">
        <RemoveIcon />
        <SimpleDropdownList
          placeholder={t('Delete ...')}
          item={{ label: placeholder }}
          labelFunc={menuItem => menuItem.label}
          items={allItems}
          onSelect={this.handleSelect}
        />
      </div>
    ) : null;
  };
}

const deleteKeywordsQuery = gql`
  mutation moreRemoveActions_deleteKeywords($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal },
  ),
  mutationStarKeywords(),
  graphql(deleteKeywordsQuery, { name: 'deleteKeywords' }),
)(MoreRemoveActions);
