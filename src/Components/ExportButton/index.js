// @flow
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import DownloadIcon from 'icons/download.svg?inline';
import Button from 'Components/Forms/Button';
import FileSaver from 'file-saver';
import domtoimage from 'dom-to-image';

import './export-button.scss';

type Props = {
  content: any,
  fileName?: string,
};

class ExportButton extends Component<Props> {
  exportButton: ?Button;
  render() {
    return (
      <Button
        ref={button => (this.exportButton = button)}
        small
        theme="grey"
        additionalClassName="export-chart-button"
        onClick={() =>
          domtoimage
            .toBlob(this.props.content(), {
              filter: node => node !== findDOMNode(this.exportButton),
            })
            .then(blob => {
              FileSaver.saveAs(blob, this.props.fileName || 'chart.png');
            })
        }
      >
        <DownloadIcon />
      </Button>
    );
  }
}

export default ExportButton;
