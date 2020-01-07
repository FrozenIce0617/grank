// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import IconButton from 'Components/IconButton';
import LabelWithHelp from 'Components/LabelWithHelp';
import { t } from 'Utilities/i18n';

import ChartContainer from './ChartContainer';
import CloseIcon from 'icons/close-2.svg?inline';

import './keyword-comparison.scss';

type Props = {
  keywords: Object[],

  // automatic
  hideModal: Function,
};

class KeywordsComparison extends Component<Props> {
  renderContent() {
    const { keywords } = this.props;

    return (
      <div>
        <Fragment>
          <div className="keyword-comparison-chart">
            <div className="title-wrapper">
              <LabelWithHelp helpTitle={t('Keyword Ranks')} help={t('Keyword Ranks')}>
                {t('Keyword Ranks')}
              </LabelWithHelp>
            </div>
            <ChartContainer keywords={keywords} />
          </div>
        </Fragment>
      </div>
    );
  }

  renderModalHeader() {
    return (
      <div className="modal-header">
        <div className="nav-header">
          <div className="keyword-title">
            <span className="keyword-title-text">Keywords Comparison</span>
          </div>
        </div>
        <IconButton icon={<CloseIcon />} onClick={this.props.hideModal} />
      </div>
    );
  }

  render() {
    return (
      <ModalBorder
        className="keyword-comparison"
        onClose={this.props.hideModal}
        header={this.renderModalHeader()}
      >
        {this.renderContent()}
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(KeywordsComparison);
