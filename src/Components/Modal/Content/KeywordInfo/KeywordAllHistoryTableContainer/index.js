// @flow
import React, { Component, Fragment } from 'react';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import KeywordAllHistoryInfiniteTable from 'Components/InfiniteTable/Tables/KeywordAllHistoryInfiniteTable';
import { copyToClipboard } from 'Utilities/underdash';

type Props = {
  keywordId: string,
  scrollElement?: Object,
};

class KeywordAllHistoryTableContainer extends Component<Props, State> {
  historyTable: KeywordAllHistoryInfiniteTable;

  setTableRef = ref => {
    this.historyTable = ref;
  };

  handleUpdate = () => {
    this.forceUpdate();

    if (this.props.scrollElement) {
      setTimeout(() => {
        this.forceUpdate();
      }, 1000);
    }
  };

  handleCopyTable = () => {
    copyToClipboard(this.getTableCopy());
  };

  getInfiniteTableInstance = () =>
    this.historyTable && this.historyTable.getWrappedInstance().getWrappedInstance();

  getTableCopy = () => {
    const instance = this.getInfiniteTableInstance();
    return instance ? instance.getCopy() : [];
  };

  render() {
    const { keywordId, scrollElement } = this.props;
    return (
      <Fragment>
        <div className="table-actions">
          <Actions.CopyAction onClick={this.handleCopyTable} />
        </div>
        <div className="table-container">
          <KeywordAllHistoryInfiniteTable
            scrollElement={scrollElement}
            ref={this.setTableRef}
            keywordId={keywordId}
            hasAnalytics={false}
            onUpdate={this.handleUpdate}
          />
        </div>
      </Fragment>
    );
  }
}

export default KeywordAllHistoryTableContainer;
