// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n/index';
import { connect } from 'react-redux';
import { showModal } from 'Actions/ModalAction';
import ExpandIcon from 'icons/plus.svg?inline';
import CollapseIcon from 'icons/minus.svg?inline';
import Icon from 'Components/Icon';
import ClockIcon from 'icons/clock.svg?inline';
import FormatNumber from 'Components/FormatNumber';
import RankSERPOptions from 'Components/Table/TableRow/RankSERPOptions';
import './rank-cell.scss';
import LoadingSpinner from 'Components/LoadingSpinner';

type Props = {
  rank: number,
  rowId: string,
  keywordData?: Object,
  showModal: Function,
  onToggleExtraRanks: Function,
  extraRanksOpened: boolean,
  isToggling: boolean,
};

type State = {
  isTooltipShown: boolean,
};

class RankCell extends Component<Props, State> {
  state = {
    isTooltipShown: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.keywordData !== this.props.keywordData ||
      nextProps.rank !== this.props.rank ||
      nextProps.extraRanksOpened !== this.props.extraRanksOpened ||
      nextProps.isToggling !== this.props.isToggling ||
      nextState.isTooltipShown !== this.state.isTooltipShown
    );
  }

  handleMouseOver = () => {
    this.setState({
      isTooltipShown: true,
    });
  };

  handleMouseLeave = () => {
    this.setState({
      isTooltipShown: false,
    });
  };

  handleClick = () => {
    const { onToggleExtraRanks, keywordData } = this.props;

    if (onToggleExtraRanks) {
      onToggleExtraRanks({ items: keywordData.rank.extraRanks });
      this.setState({
        isTooltipShown: false,
      });
      return;
    }

    this.props.showModal({
      modalType: 'KeywordRanks',
      modalTheme: 'light',
      modalProps: {
        keyword: this.props.keywordData,
      },
    });
  };

  formatRank = (rank: number) => {
    if (rank < 0) {
      return <Icon inline icon={ClockIcon} tooltip={t('Waiting for ranking data')} />;
    }
    if (rank === null) {
      return t('Not in top 500');
    }
    return <FormatNumber>{rank}</FormatNumber>;
  };

  render() {
    const { keywordData, rank, extraRanksOpened, isToggling } = this.props;
    const { isTooltipShown } = this.state;
    if (keywordData && keywordData.rank) {
      return (
        <span className="rank-cell">
          {this.formatRank(rank)}
          <div className="float-right">
            <RankSERPOptions keywordData={keywordData} />

            {keywordData.rank.hasExtraRanks &&
              (isToggling ? (
                <LoadingSpinner />
              ) : (
                <Icon
                  className="extra-rank-btn"
                  icon={!extraRanksOpened ? ExpandIcon : CollapseIcon}
                  onClick={this.handleClick}
                  onMouseEnter={this.handleMouseOver}
                  onMouseLeave={this.handleMouseLeave}
                  isTooltipOpened={isTooltipShown}
                  tooltip={
                    !extraRanksOpened
                      ? t(
                          'This rank has %s more positions, click to view.',
                          keywordData.rank.extraRanks.length,
                        )
                      : t('Click to hide extra ranks.')
                  }
                />
              ))}
          </div>
        </span>
      );
    }
    return <span>{this.formatRank(rank)}</span>;
  }
}

export default connect(
  null,
  { showModal },
)(RankCell);
