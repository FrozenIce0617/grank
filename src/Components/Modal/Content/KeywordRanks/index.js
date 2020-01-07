// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { compose } from 'react-apollo';
import { t } from 'Utilities/i18n';
import RanksTable from './Table';
import { RequiredFiltersSelector } from 'Selectors/FiltersSelector';
import './keyword-ranks.scss';

type Props = {
  keyword: Object,
  hideModal: Function,
};

class KeywordRanks extends Component<Props> {
  render() {
    return (
      <ModalBorder
        className="keyword-ranks"
        title={`${t('Ranks for ')} ${this.props.keyword.keyword}`}
        onClose={this.props.hideModal}
      >
        <RanksTable keyword={this.props.keyword} />
      </ModalBorder>
    );
  }
}

const mapStateToProps = state => ({
  filters: RequiredFiltersSelector(state),
});

export default compose(
  connect(
    mapStateToProps,
    { hideModal },
  ),
)(KeywordRanks);
