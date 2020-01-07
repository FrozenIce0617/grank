// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { showModal } from 'Actions/ModalAction';
import KeywordOptions from '../KeywordsOptions';
import { uniqueId } from 'lodash';
import { t } from 'Utilities/i18n';
import './keyword-cell.scss';
import LoadingSpinner from 'Components/LoadingSpinner';

import RemoveIcon from 'icons/close.svg?inline';
import Icon from 'Components/Icon';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import { linkToPageWithDomains } from 'Components/Filters/LinkToDomain';

type Props = {
  keywordData: Object,
  showModal: Function,
  showOptions?: boolean,
  showTags?: boolean,
  removeTags: Function,
  onTagDelete: Function,
  domainId: string,
  shouldOpenKeywordInfo: boolean,
  onKeywordClick: Function,
};

type State = {
  tagHovered: string | null,
  tagsDeleteProgress: Map<string, boolean>,
};

class KeywordCell extends Component<Props, State> {
  static defaultProps = {
    showOptions: false,
    showTags: false,
    onKeywordClick: () => {},
  };

  state = {
    tagHovered: null,
    tagsDeleteProgress: new Map(),
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.keywordData !== this.props.keywordData ||
      nextState.tagHovered !== this.state.tagHovered ||
      nextState.tagsDeleteProgress !== this.state.tagsDeleteProgress ||
      nextProps.domainId !== this.props.domainId
    );
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextProps.keywordData !== this.props.keywordData) {
      const tags = Array.from(nextState.tagsDeleteProgress.keys());
      const incomingTags = new Set(nextProps.keywordData.tags);
      tags.forEach(tag => {
        if (!incomingTags.has(tag)) {
          const tagsDeleteProgress = new Map(this.state.tagsDeleteProgress);
          tagsDeleteProgress.delete(tag);
          this.setState({ tagsDeleteProgress });
        }
      });
    }
  }

  handleMouseOver = tag => {
    this.setState({ tagHovered: tag });
  };

  handleMouseLeave = () => {
    this.setState({ tagHovered: null });
  };

  handleClick = () => {
    const { onKeywordClick, shouldOpenKeywordInfo } = this.props;

    onKeywordClick();

    this.props.showModal({
      modalType: shouldOpenKeywordInfo ? 'KeywordInfo' : 'KeywordHistory',
      modalTheme: 'light',
      modalProps: {
        keywordId: this.props.keywordData.id,
        keyword: this.props.keywordData.keyword,
        domainId: this.props.keywordData.domain && this.props.keywordData.domain.id,
      },
    });
  };

  handleDelete = tag => {
    this.setTagProgress(tag, true);
    this.props
      .removeTags({
        variables: {
          input: {
            keywords: [this.props.keywordData.id],
            removeTags: [tag],
          },
        },
      })
      .then(() => {
        this.setTagProgress(tag, false);
        this.props.onTagDelete();
      });
  };

  setTagProgress = (tag, isDeleting) =>
    this.setState({
      tagsDeleteProgress: new Map(this.state.tagsDeleteProgress).set(tag, isDeleting),
    });

  renderDeleteIcon(tag) {
    const { tagHovered } = this.state;
    return (
      tagHovered === tag && (
        <Icon
          className="delete-tag-icon"
          icon={RemoveIcon}
          onClick={() => this.handleDelete(tag)}
          tooltip={t('Remove tag')}
        />
      )
    );
  }

  getLinkToKeywordPage = () => {
    const { keywordData, domainId } = this.props;
    return linkToPageWithDomains(`/keyword/${keywordData.id}`, [domainId], KEYWORDS_FILTER_SET);
  };

  render() {
    const { keywordData, showOptions } = this.props;

    const { tagsDeleteProgress } = this.state;

    const keyword = keywordData.keyword;
    let linkRenderer = (
      <a className="keyword-link" tabIndex={0} onClick={this.handleClick}>
        {keyword}
      </a>
    );
    if (showOptions) {
      linkRenderer = (
        <div className="keyword-and-options">
          {linkRenderer}
          <KeywordOptions keywordData={keywordData} />
        </div>
      );
    }
    let tags = null;
    if (keywordData.tags && keywordData.tags.length > 0 && this.props.showTags) {
      tags = keywordData.tags.map(tag => {
        const tagDeleteState = tagsDeleteProgress.get(tag);
        if (tagDeleteState === false) {
          return null;
        }
        return (
          <span
            key={uniqueId(tag)}
            className="badge badge-tag mr-1"
            onMouseEnter={() => this.handleMouseOver(tag)}
            onMouseLeave={() => this.handleMouseLeave()}
          >
            {tag}
            {tagsDeleteProgress.get(tag) ? <LoadingSpinner /> : this.renderDeleteIcon(tag)}
          </span>
        );
      });
    }

    return (
      <div className="keyword-cell">
        {linkRenderer}
        {tags}
      </div>
    );
  }
}

const removeTagsQuery = gql`
  mutation keywordCell_removeTags($input: UpdateKeywordsInput!) {
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
  graphql(removeTagsQuery, { name: 'removeTags' }),
)(KeywordCell);
