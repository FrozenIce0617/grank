// @flow
import React, { Component } from 'react';

import Icon from 'Pages/Keywords/Table/Icon';
import { IgnoreInShareOfVoice, Snippet, Ignore, Movie } from 'Pages/Keywords/Table/Icon/Icons';

import { t } from 'Utilities/i18n/index';

type Props = {
  keywordData: Object,
};

class KeywordsOptions extends Component<Props> {
  getIconData = () => ({
    ignoreLocalResults: {
      icon: Ignore,
      label: t('Ignore local pack'),
    },
    ignoreFeaturedSnippet: {
      icon: Snippet,
      label: t('Ignore featured snippet'),
    },
    ignoreInShareOfVoice: {
      icon: IgnoreInShareOfVoice,
      label: t('Ignore in share of voice'),
    },
    ignoreVideoResults: {
      icon: Movie,
      label: t('Ignore video results'),
    },
  });

  render() {
    const { keywordData } = this.props;
    const possibleKeywordsOptions = [
      'ignoreInShareOfVoice',
      'ignoreLocalResults',
      'ignoreVideoResults',
      'ignoreFeaturedSnippet',
    ];
    const icons = [];
    const iconsData = this.getIconData();
    possibleKeywordsOptions.forEach(option => {
      if (keywordData[option]) {
        const iconData = iconsData[option] || {};
        icons.push(<Icon ignored key={option} icon={iconData.icon} tooltip={iconData.label} />);
      }
    });
    return <div className="flex-row-right">{icons}</div>;
  }
}

export default KeywordsOptions;
