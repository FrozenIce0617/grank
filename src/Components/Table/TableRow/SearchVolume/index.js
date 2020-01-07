// @flow
import React, { Component } from 'react';
import FormatNumber from 'Components/FormatNumber';
import { connect } from 'react-redux';
import { showModal } from 'Actions/ModalAction';
import Icon from 'Pages/Keywords/Table/Icon';
import ClockIcon from 'icons/clock.svg?inline';
import { t } from 'Utilities/i18n';

type Props = {
  searchVolume: number | null,
  showModal: Function,
  keywordData?: Object,
};

class SearchVolume extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.keywordData !== this.props.keywordData ||
      nextProps.searchVolume !== this.props.searchVolume
    );
  }

  handleClick = () => {
    this.props.showModal({
      modalType: 'SearchVolume',
      modalTheme: 'light',
      modalProps: {
        keywordId: this.props.keywordData.id,
        keyword: this.props.keywordData.keyword,
      },
    });
  };

  render() {
    const { keywordData, searchVolume } = this.props;
    if (searchVolume === null) {
      if (keywordData && keywordData.searchEngine && keywordData.searchEngine.name === 'Bing') {
        return '-';
      }

      return <Icon inline={true} icon={ClockIcon} tooltip={t('Loading...')} />;
    } else if (keywordData) {
      return (
        <a tabIndex={1} onClick={this.handleClick}>
          <FormatNumber>{searchVolume}</FormatNumber>
        </a>
      );
    }
    return <FormatNumber>{searchVolume}</FormatNumber>;
  }
}

export default connect(
  null,
  { showModal },
)(SearchVolume);
