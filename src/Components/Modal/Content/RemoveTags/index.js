// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import type { FilterBase } from 'Types/Filter';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import { Table } from 'reactstrap';
import { graphqlOK } from 'Utilities/underdash';
import './remove-tags.scss';
import Checkbox from 'Components/Controls/Checkbox';
import Button from 'Components/Forms/Button';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import Toast from 'Components/Toast';
import { FilterAttribute } from 'Types/Filter';

type KeywordData = {
  id: string,
  keyword: string,
  tags: string[],
};

type Props = {
  hideModal: Function,
  removeTags: Function,
  keywords: KeywordData[],
  shouldExclude: boolean,
  filters: FilterBase[],
  tagsData: Object,
  domainId: string,
  optimisticUpdate: Function,
};

type State = {
  tagsToRemove: Array<string>,
};

class RemoveTags extends Component<Props, State> {
  state = {
    tagsToRemove: [],
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

  mergeKeywordTags = (oldItem, newItem) => {
    const oldTags = oldItem.tags || [];
    const newTags = newItem.tags ? oldTags.filter(tag => !newItem.tags.includes(tag)) : oldTags;

    return { ...oldItem, tags: newTags };
  };

  handleSubmit = () => {
    const { tagsToRemove: removeTags } = this.state;
    const { optimisticUpdate, keywords, shouldExclude } = this.props;
    const onRealUpdate = optimisticUpdate({
      ids: this.getIds(keywords),
      item: { tags: removeTags },
      isExcluded: shouldExclude,
      merger: this.mergeKeywordTags,
      shouldResize: true,
    });
    this.props
      .removeTags({
        variables: {
          input: {
            ...this.getKeywordsInput(),
            removeTags,
          },
        },
      })
      .catch(() => {
        onRealUpdate();
        Toast.error(t('Failed to remove tags'));
      });

    this.props.hideModal();
  };

  handleChange = e => {
    const tag = e.target.value;
    let tagsToRemove = this.state.tagsToRemove;

    if (e.target.checked) {
      this.state.tagsToRemove.push(tag);
    } else {
      tagsToRemove = this.state.tagsToRemove.filter(value => value !== tag);
    }

    this.setState({
      tagsToRemove,
    });
  };

  renderRows() {
    if (!graphqlOK(this.props)) {
      return null;
    }

    const {
      tagsData: { domainsList },
      domainId,
    } = this.props;
    const { tagsToRemove } = this.state;

    const domain = domainsList.find(item => item.id === domainId);
    return domain
      ? domain.tags.map(tag => (
          <tr key={tag}>
            <td>
              <Checkbox
                value={tag}
                onChange={this.handleChange}
                checked={!!tagsToRemove.find(tagToRemove => tagToRemove === tag)}
              />
            </td>
            <td>{tag}</td>
          </tr>
        ))
      : null;
  }

  render() {
    return (
      <ModalBorder className="remove-tags" title={t('Delete Tags')} onClose={this.props.hideModal}>
        <Table className="data-table">
          <thead>
            <tr>
              <th />
              <th>{t('Tag')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRows()}</tbody>
        </Table>
        <div className="footer">
          <Button theme="orange" onClick={this.handleSubmit}>
            {t('Remove tags')}
          </Button>
        </div>
      </ModalBorder>
    );
  }
}

const removeTagsQuery = gql`
  mutation removeTags_removeTags($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

const tagsQuery = gql`
  query removeTags_domainsList {
    domainsList {
      id
      tags
    }
  }
`;

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
    filters: state.filter.filterGroup.filters,
  };
};

export default compose(
  connect(
    mapStateToProps,
    { hideModal },
  ),
  graphql(removeTagsQuery, { name: 'removeTags' }),
  graphql(tagsQuery, { name: 'tagsData' }),
)(RemoveTags);
