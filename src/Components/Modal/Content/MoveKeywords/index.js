// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import type { FilterBase } from 'Types/Filter';
import { t } from 'Utilities/i18n';
import './move-keywords.scss';

import MoveKeywordsForm from './MoveKeywordsForm';

type Props = {
  hideModal: Function,
  refresh: Function,
  keywords: Array<any>,
  domainId: string,
  filters: FilterBase[],
  shouldExclude: boolean,
};

class MoveKeywords extends Component<Props> {
  render() {
    const { refresh, keywords, domainId, filters, shouldExclude } = this.props;
    return (
      <ModalBorder
        className="move-keywords"
        title={t('Move to Other Domain')}
        onClose={this.props.hideModal}
      >
        <MoveKeywordsForm
          hideModal={this.props.hideModal}
          refresh={refresh}
          keywords={keywords}
          domainId={domainId}
          filters={filters}
          shouldExclude={shouldExclude}
        />
      </ModalBorder>
    );
  }
}

const mapStateToProps = state => ({
  filters: state.filter.filterGroup.filters,
});

export default connect(
  mapStateToProps,
  { hideModal },
)(MoveKeywords);
