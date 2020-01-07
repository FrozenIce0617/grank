// @flow
import React, { Component, Fragment } from 'react';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import KeywordHistoryInfiniteTable from 'Components/InfiniteTable/Tables/KeywordsHistoryInfiniteTable';
import { copyToClipboard } from 'Utilities/underdash';

type Props = {
  keywordId: string,
  scrollElement: any,
};

class KeywordHistoryTableContainer extends Component<Props, State> {
  historyTable: KeywordHistoryInfiniteTable;

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
    const { scrollElement, keywordId } = this.props;
    return (
      <Fragment>
        <div className="table-actions">
          <Actions.CopyAction onClick={this.handleCopyTable} />
        </div>
        <div className="table-container">
          <KeywordHistoryInfiniteTable
            ref={this.setTableRef}
            scrollElement={scrollElement}
            keywordId={keywordId}
            onUpdate={this.handleUpdate}
          />
        </div>
      </Fragment>
    );
  }
}

export default KeywordHistoryTableContainer;
