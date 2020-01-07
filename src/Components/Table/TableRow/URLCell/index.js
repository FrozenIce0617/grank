// @flow
import React, { Component, Fragment } from 'react';
import { uniqueId } from 'lodash';
import { UncontrolledTooltip } from 'reactstrap';
import UrlIcon from 'icons/url.svg?inline';
import './url-cell-content.scss';
import { Tooltip } from 'reactstrap';
import URLEllipsis from 'Components/URLEllipsis';

type Props = {
  keywordsData: {
    rank: {
      highestRankingPage: string,
      titleDescription: {
        title: string,
        description: string,
      },
    },
  },
  maxWidth: number,
};

type State = {
  tooltipOpen: boolean,
};

class URLCell extends Component<Props, State> {
  static defaultProps = {
    title: 'Rank Tracker: Grow your organic traffic with AccuRanker',
    description:
      'AccuRanker is the world’s fastest rank tracker - a must-have tool if you want to organize and grow your organic traffic, and leave your competitors in the dust.',
    maxWidth: 150,
  };

  constructor(props: Props) {
    super(props);

    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.state = {
      tooltipOpen: false,
    };
  }

  iconId = uniqueId('url');

  shouldComponentUpdate(nextProps) {
    return nextProps.keywordsData !== this.props.keywordsData;
  }

  toggleTooltip = () => {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  };

  render() {
    const { keywordsData } = this.props;
    const titleDescription = keywordsData.rank.titleDescription;
    const title = (titleDescription && titleDescription.title) || '';
    const description = (titleDescription && titleDescription.description) || '';
    const url = keywordsData.rank.highestRankingPage;
    let urlString = '';
    if (url) {
      const el = document.createElement('a');
      el.href = url;
      urlString = el.pathname + el.search + el.hash;
    }
    return (
      <div className="url-cell-content">
        {urlString && (
          <Fragment>
            <UrlIcon id={this.iconId} />
            <UncontrolledTooltip
              delay={{ show: 0, hide: 0 }}
              placement="top"
              className="url-tooltip"
              target={this.iconId}
            >
              <div className="title">{title}</div>
              <div className="url">{url || '-'}</div>
              <div className="text">{description}</div>
            </UncontrolledTooltip>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              id={`ToolTip-URL${this.iconId}`}
            >
              <URLEllipsis maxWidth={this.props.maxWidth} url={urlString} />
            </a>
            <UncontrolledTooltip
              delay={{ show: 0, hide: 0 }}
              placement="top"
              target={`ToolTip-URL${this.iconId}`}
            >
              {url}
            </UncontrolledTooltip>
          </Fragment>
        )}
      </div>
    );
  }
}

export default URLCell;
