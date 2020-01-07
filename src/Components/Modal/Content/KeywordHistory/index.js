// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import KeywordHistoryChartContainer from './ChartContainer';
import KeywordHistoryTableContainer from './TableContainer';
import './keyword-history.scss';

type Props = {
  keywordId: string,
  keyword: string,
  hideModal: Function,
  scrollElement: any,
};

class KeywordHistory extends Component<Props> {
  render() {
    const { keyword, keywordId, scrollElement } = this.props;
    return (
      <ModalBorder
        className="keyword-history"
        title={`${t('History for %s', keyword)}`}
        onClose={this.props.hideModal}
      >
        <KeywordHistoryChartContainer keyword={keyword} keywordId={keywordId} />
        <KeywordHistoryTableContainer scrollElement={scrollElement} keywordId={keywordId} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(KeywordHistory);
