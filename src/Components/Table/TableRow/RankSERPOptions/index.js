// @flow
import React, { Component } from 'react';
import Icon from 'Pages/Keywords/Table/Icon';
import { Comment, Link, Movie, Map, Snippet } from 'Pages/Keywords/Table/Icon/Icons';
import { t } from 'Utilities/i18n/index';

const HAS_VIDEO = 'hasVideo';
const HAS_REVIEWS = 'hasReviews';
const HAS_SITE_LINKS = 'hasSitelinks';
const IS_LOCAL_RESULT = 'isLocalResult';
const IS_FEATURE_SNIPPET = 'isFeaturedSnippet';
const possibleOptions = [
  HAS_VIDEO,
  HAS_REVIEWS,
  HAS_SITE_LINKS,
  IS_LOCAL_RESULT,
  IS_FEATURE_SNIPPET,
];

type Props = {
  keywordData: Object,
};

class RankSERPOptions extends Component<Props> {
  getIconData = () => ({
    [HAS_VIDEO]: {
      icon: Movie,
      label: t('Has video'),
    },
    [HAS_REVIEWS]: {
      icon: Comment,
      label: t('Has reviews'),
    },
    [HAS_SITE_LINKS]: {
      icon: Link,
      label: t('Has site links'),
    },
    [IS_LOCAL_RESULT]: {
      icon: Map,
      label: t('Is local result'),
    },
    [IS_FEATURE_SNIPPET]: {
      icon: Snippet,
      label: t('Is featured snippet'),
    },
  });

  shouldComponentUpdate(nextProps) {
    return nextProps.keywordData !== this.props.keywordData;
  }

  render() {
    const { keywordData } = this.props;
    const iconsData = this.getIconData();
    const icons = [];

    possibleOptions.forEach(option => {
      if (keywordData.rank[option]) {
        const iconData = iconsData[option] || {};
        icons.push(<Icon key={option} icon={iconData.icon} tooltip={iconData.label} />);
      }
    });

    return <div className="icons">{icons}</div>;
  }
}

export default RankSERPOptions;
