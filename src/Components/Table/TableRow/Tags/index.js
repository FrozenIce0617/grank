// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { uniqueId } from 'lodash';
import { Tooltip } from 'reactstrap';
import TagIcon from 'icons/tag.svg?inline';
import CloseIcon from 'icons/close-2.svg?inline';
import { t } from 'Utilities/i18n/index';
import toast from 'Components/Toast';
import './tags-cell-content.scss';

type Props = {
  keywordId: string,
  landingPageId: string,
  tags: Array<string>,
  removeTags: Function,
  removeLandingPageTags: Function,
};

type State = {
  isHover: boolean,
  isOpen: boolean,
};

class Tags extends Component<Props, State> {
  tooltipChild: HTMLElement;

  state = {
    isHover: false,
    isOpen: false,
  };

  addEvents() {
    ['click', 'touchstart'].forEach(event =>
      document.addEventListener(event, this.handleDocumentClick, true),
    );
  }

  removeEvents() {
    ['click', 'touchstart'].forEach(event =>
      document.removeEventListener(event, this.handleDocumentClick, true),
    );
  }

  handleDocumentClick = (event: Event) => {
    const tooltipElement = this.tooltipChild.parentNode;
    if (tooltipElement && tooltipElement.contains((event.target: any))) {
      return;
    }
    this.toggleDropdown();
  };

  handleClose = (tag: string) => {
    if (this.props.landingPageId) {
      const input = {
        landingPages: [this.props.landingPageId],
        tags: [tag],
      };
      this.props
        .removeLandingPageTags({ variables: { input } })
        .then()
        .catch(() => {
          toast.error(t('Failed to remove tags'));
        });
    }

    if (this.props.keywordId) {
      const input = {
        keywords: [this.props.keywordId],
        tags: [tag],
      };
      this.props
        .removeTags({ variables: { input } })
        .then()
        .catch(() => {
          toast.error(t('Failed to remove tags'));
        });
    }
  };

  toggleDropdown = () => {
    const isOpen = !this.state.isOpen;
    this.setState({
      isOpen,
    });
    if (isOpen) {
      this.addEvents();
    } else {
      this.removeEvents();
    }
  };

  toggleTooltip = () => {
    this.setState({
      isHover: !this.state.isHover,
    });
  };

  iconId = uniqueId('tag');

  render() {
    const tags = this.props.tags || [];
    const { isHover, isOpen } = this.state;
    return (
      <div className="tags-cell-content">
        <TagIcon id={this.iconId} onClick={this.toggleDropdown} />
        <Tooltip
          delay={{ show: 0, hide: 0 }}
          isOpen={isHover || isOpen}
          toggle={this.toggleTooltip}
          placement="top"
          className="tags-tooltip"
          target={this.iconId}
        >
          <p className="title">{t('Tags:')}</p>
          <ul
            ref={tooltipChild => {
              if (tooltipChild) this.tooltipChild = tooltipChild;
            }}
          >
            {tags.map(tag => (
              <li key={tag}>
                {tag}
                <CloseIcon
                  onClick={() => this.handleClose(tag)}
                  className={isOpen ? '' : 'hidden'}
                />
              </li>
            ))}
          </ul>
        </Tooltip>
      </div>
    );
  }
}

const removeTagsQuery = gql`
  mutation tags_removeTags($input: RemoveTagsInput!) {
    removeTags(input: $input) {
      keywords {
        id
      }
    }
  }
`;

const removeLandingPageTagsQuery = gql`
  mutation tags_removeLandingPageTags($input: RemoveLandingPageTagsInput!) {
    removeLandingPageTags(input: $input) {
      landingPages {
        id
      }
    }
  }
`;

export default compose(
  graphql(removeTagsQuery, { name: 'removeTags' }),
  graphql(removeLandingPageTagsQuery, { name: 'removeLandingPageTags' }),
)(Tags);
