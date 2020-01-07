// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import CircleIcon from 'icons/circle.svg?inline';
import './url-status.scss';
import { Tooltip } from 'reactstrap';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';

type Props = {
  showModal: Function,
  keyword: Object,
  refresh: Function,
  optimisticUpdate: Function,
};

type State = {
  tooltipOpen: boolean,
};

export const getStatusMap = highestRankingPageStatus => {
  const statusMap = {
    1: {
      content: <CircleIcon className="status-up" />,
      tooltip: t('Preferred URL matches ranked page'),
      status: t('Preferred URL matches ranked page'),
    },
    2: {
      content: <CircleIcon className="status-unknown" />,
      tooltip: t('Click to set the preferred URL for this keyword'),
      status: t('Preferred URL not set'),
    },
  };

  return (
    statusMap[highestRankingPageStatus] || {
      content: <CircleIcon className="status-down" />,
      tooltip: t('Not ranked for correct preferred URL'),
      status: t('Not ranked for correct preferred URL'),
    }
  );
};

class URLStatus extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      tooltipOpen: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.keyword !== this.props.keyword || nextState.tooltipOpen !== this.state.tooltipOpen
    );
  }

  toggleTooltip = () => {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  };

  handleLandingPage = () => {
    let path = '/';
    const keyword = this.props.keyword;

    if (keyword.preferredLandingPage) {
      path = keyword.preferredLandingPage.path;
    } else if (keyword.rank && keyword.rank.highestRankingPage) {
      const el = document.createElement('a');
      el.href = keyword.rank.highestRankingPage;
      path = el.pathname;
    }

    this.props.showModal({
      modalType: 'LandingPage',
      modalTheme: 'light',
      modalProps: {
        keywords: [this.props.keyword],
        path,
        optimisticUpdate: this.props.optimisticUpdate,
        refresh: this.props.refresh,
      },
    });
  };

  render() {
    const { keyword } = this.props;
    const { content, tooltip } = getStatusMap(keyword.highestRankingPageStatus);

    return (
      <div>
        <div
          className="url-status"
          id={`Tooltip-URLStatus-${keyword.id}`}
          onClick={this.handleLandingPage}
        >
          {content}
        </div>
        <Tooltip
          delay={{ show: 0, hide: 0 }}
          placement="top"
          isOpen={this.state.tooltipOpen}
          target={`Tooltip-URLStatus-${keyword.id}`}
          toggle={this.toggleTooltip}
        >
          {tooltip}
        </Tooltip>
      </div>
    );
  }
}

export default compose(
  connect(
    null,
    { showModal },
  ),
)(URLStatus);
