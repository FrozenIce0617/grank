// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import type { FilterBase } from 'Types/Filter';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import LandingPageForm from './LandingPageForm';
import './landing-page.scss';

type Props = {
  hideModal: Function,
  keywords: Object,
  shouldExclude: boolean,
  path: string,
  refresh: Function,
  filters: FilterBase[],
  domainId: string,
  optimisticUpdate: Function,
};

class LandingPage extends Component<Props> {
  static defaultProps = {
    path: '/',
  };

  render() {
    const { shouldExclude, optimisticUpdate, keywords, path, filters, domainId } = this.props;
    return (
      <ModalBorder
        className="landing-page"
        title={t('Change Preferred URL')}
        onClose={this.props.hideModal}
      >
        <LandingPageForm
          initialValues={{ preferred_landing_page: { value: path, label: path } }}
          domain={!shouldExclude ? keywords[0].domain.id : domainId} // keyword domains are always the same, so just take the first one
          ids={keywords.map(keywordData => keywordData.id)}
          shouldExclude={shouldExclude}
          optimisticUpdate={optimisticUpdate}
          onClose={this.props.hideModal}
          filters={filters}
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
)(LandingPage);
