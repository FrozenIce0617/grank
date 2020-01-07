// @flow
import React, { Component } from 'react';
import Icon from 'Pages/Keywords/Table/Icon';
import { Bing, Google, Monitor, Mobile, Tweet } from 'Pages/Keywords/Table/Icon/Icons';
import { t } from 'Utilities/i18n/index';

type Props = {
  keywordData: Object,
  showSearchType?: boolean,
};

let loadedIconData = null;

class RankOptions extends Component<Props> {
  static defaultProps = {
    showSearchType: true,
  };

  getIconData = () => {
    if (!loadedIconData) {
      loadedIconData = {
        A_1: {
          icon: Monitor,
          label: t('Desktop search'),
        },
        A_2: {
          icon: Mobile,
          label: t('Mobile search'),
        },
        Google: {
          icon: Google,
          label: t('Google'),
        },
        Bing: {
          icon: Bing,
          label: t('Bing'),
        },
        Yandex: {
          icon: Tweet,
          label: t('Yandex'),
        },
        Baidu: {
          icon: Tweet,
          label: t('Baidu'),
        },
      };
    }
    return loadedIconData;
  };

  shouldComponentUpdate(nextProps: Props) {
    return nextProps.keywordData !== this.props.keywordData;
  }

  render() {
    const { keywordData, showSearchType } = this.props;
    const iconsData = this.getIconData();
    const {
      searchType,
      searchEngine: { name: searchEngineName },
    } = keywordData;

    return (
      <div className="flex-row-right">
        {showSearchType && (
          <div className="pr-2">
            <Icon
              key="searchType"
              icon={iconsData[searchType].icon}
              tooltip={iconsData[searchType].label}
            />
          </div>
        )}
        <Icon
          key="searchEngine"
          icon={iconsData[searchEngineName].icon}
          tooltip={iconsData[searchEngineName].label}
        />
      </div>
    );
  }
}

export default RankOptions;
