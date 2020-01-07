// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import AddTagsForm from './AddTagsForm';
import type { FilterBase } from 'Types/Filter';
import Toast from 'Components/Toast';
import './add-tags.scss';

type KeywordData = {
  id: string,
  keyword: string,
};

type Props = {
  hideModal: Function,
  addTags: Function,
  keywords: KeywordData[],
  shouldExclude: boolean,
  filters: FilterBase[],
  optimisticUpdate: Function,
};

class AddTags extends Component<Props> {
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

  mergeKeywordTags = (oldItem, newItem) => {
    const oldTags = oldItem.tags || [];
    const newTags = newItem.tags ? Array.from(new Set(oldTags.concat(newItem.tags))) : oldTags;

    return { ...oldItem, tags: newTags };
  };

  handleSubmit = (values: any) => {
    const { optimisticUpdate, keywords, shouldExclude } = this.props;
    const onRealUpdate = optimisticUpdate({
      ids: this.getIds(keywords),
      item: { tags: values.tags },
      isExcluded: shouldExclude,
      merger: this.mergeKeywordTags,
      shouldResize: true,
    });
    this.props
      .addTags({
        variables: {
          input: {
            ...this.getKeywordsInput(),
            addTags: values.tags,
          },
        },
      })
      .catch(() => {
        onRealUpdate();
        Toast.error(t('Failed to add tags'));
      });
    this.props.hideModal();
  };

  render() {
    return (
      <ModalBorder className="add-tags" title={t('Add Tags')} onClose={this.props.hideModal}>
        <AddTagsForm
          initialValues={{ tags: [] }}
          onCancel={this.props.hideModal}
          onSubmit={this.handleSubmit}
        />
      </ModalBorder>
    );
  }
}

const addTagsQuery = gql`
  mutation addTags_addTags($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

const mapStateToProps = state => ({
  filters: state.filter.filterGroup.filters,
});

export default compose(
  graphql(addTagsQuery, { name: 'addTags' }),
  connect(
    mapStateToProps,
    { hideModal },
  ),
)(AddTags);
