// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import { uniqueId } from 'lodash';
import { compose, graphql } from 'react-apollo';
import { Tooltip } from 'reactstrap';
import cn from 'classnames';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import TopCompetitorsChartContainer from './TopCompetitorsChartContainer';
import KeywordAllHistoryTableContainer from './KeywordAllHistoryTableContainer';
import KeywordHistoryChartContainer from 'Components/Modal/Content/KeywordHistory/ChartContainer';
import IconButton from 'Components/IconButton';
import LabelWithHelp from 'Components/LabelWithHelp';
import { t } from 'Utilities/i18n';
import gql from 'graphql-tag';
import { RequiredFiltersSelector } from 'Selectors/FiltersSelector';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import RankOptions from 'Components/Table/TableRow/RankOptions';

// import KeywordIcon from 'icons/menu/keywords.svg?inline';
import CompetitorRanksIcon from 'icons/menu/competitor-rankings.svg?inline';
import RanksHistoryIcon from 'icons/menu/ranks-history.svg?inline';
import CloseIcon from 'icons/close-2.svg?inline';

import './keyword-info.scss';

// const KEYWORD = 'keyword';
const COMPETITORS_RANKS = 'competitors_ranks';
const RANKS_HISTORY = 'ranks_history';

type Props = {
  keyword: String,
  keywordId: String,
  domainId: String,
  scrollElement: Object,
  keywordData: Object,

  // automatic
  hideModal: Function,
};

type State = {
  currentMenuItemId: String,
  showCountryTooltip: Boolean,
};

const withTooltip = menuItems =>
  menuItems.map(menuItem => {
    menuItem.tooltipTarget = uniqueId(`keyword-info-tooltip-tab-${menuItem.id}`);
    return menuItem;
  });

// Use it to have same tab opened after modal was closed and opened one more time
let savedMenuItem = RANKS_HISTORY;

class KeywordInfo extends Component<Props, State> {
  state = {
    currentMenuItemId: savedMenuItem,
    hoveredMenuItemId: null,
    showCountryTooltip: false,
  };

  handleMenuItemSelect = menuItemId => {
    savedMenuItem = menuItemId;
    this.setState({
      currentMenuItemId: menuItemId,
      hoveredMenuItemId: null,
    });
  };

  handleShowTooltip = hoveredMenuItemId => {
    this.setState({
      hoveredMenuItemId,
    });
  };

  handleHideTooltip = () => {
    this.setState({
      hoveredMenuItemId: null,
    });
  };

  handleToggleCountryTooltip = () => {
    this.setState({
      showCountryTooltip: !this.state.showCountryTooltip,
    });
  };

  menuItems = withTooltip([
    // {
    //   id: KEYWORD,
    //   label: t('Keyword'),
    //   icon: <KeywordIcon />,
    // },
    {
      id: COMPETITORS_RANKS,
      label: t('Competitor Ranks'),
      icon: <CompetitorRanksIcon />,
    },
    {
      id: RANKS_HISTORY,
      label: t('Ranks History'),
      icon: <RanksHistoryIcon />,
    },
  ]);

  renderContent() {
    const { keywordId, keyword, scrollElement, domainId } = this.props;
    const { currentMenuItemId } = this.state;

    return (
      <div>
        {
          {
            // [KEYWORD]: <div className="tbd">TBD</div>,
            [COMPETITORS_RANKS]: (
              <Fragment>
                <div className="keyword-info-chart">
                  <LabelWithHelp
                    helpTitle={t('Top Competitor Ranks')}
                    help={t('Top Competitor Ranks')}
                  >
                    {t('Top Competitor Ranks')}
                  </LabelWithHelp>
                  <TopCompetitorsChartContainer domainId={domainId} keywordId={keywordId} />
                </div>
              </Fragment>
            ),
            [RANKS_HISTORY]: (
              <div>
                <div className="keyword-info-chart">
                  <LabelWithHelp helpTitle={t('Competitor Ranks')} help={t('Competitor Ranks')}>
                    {t('Competitor Ranks')}
                  </LabelWithHelp>
                  <KeywordHistoryChartContainer keyword={keyword} keywordId={keywordId} />
                </div>
                <div className="keyword-info-table">
                  <KeywordAllHistoryTableContainer
                    scrollElement={scrollElement}
                    keywordId={keywordId}
                  />
                </div>
              </div>
            ),
          }[currentMenuItemId]
        }
      </div>
    );
  }

  renderModalHeader() {
    const { keywordData } = this.props;
    const { currentMenuItemId, hoveredMenuItemId, showCountryTooltip } = this.state;

    const keywordObj = keywordData && keywordData.keywords ? keywordData.keywords.keyword : null;

    return (
      <div className="modal-header">
        <div className="nav-header">
          <div className="keyword-title">
            {keywordObj && (
              <React.Fragment>
                <span className="keyword-title-text">{keywordObj.keyword}</span>
                <span className="mr-2">
                  <RankOptions keywordData={keywordObj} />
                </span>
                <span
                  id="country"
                  className={`flag-icon flag-icon-${keywordObj.countrylocale.countryCode.toLowerCase()}`}
                  onMouseEnter={this.handleToggleCountryTooltip}
                  onMouseLeave={this.handleToggleCountryTooltip}
                />
                <Tooltip
                  target="country"
                  delay={{ show: 0, hide: 0 }}
                  placement="top"
                  isOpen={showCountryTooltip}
                >
                  {keywordObj.location}, {keywordObj.countrylocale.region}
                </Tooltip>
              </React.Fragment>
            )}
          </div>
          <ul className="nav">
            {this.menuItems.map(menuItem => {
              const isSelected = menuItem.id === currentMenuItemId;
              return (
                <Fragment key={menuItem.id}>
                  <li
                    id={menuItem.tooltipTarget}
                    className={cn('nav-item', { active: isSelected })}
                    onMouseLeave={this.handleHideTooltip}
                    onMouseEnter={() => this.handleShowTooltip(menuItem.id)}
                    onClick={() => this.handleMenuItemSelect(menuItem.id)}
                  >
                    {isSelected ? (
                      <Fragment>
                        <span className="icon">{menuItem.icon}</span>
                        <span className="menu-item-label">{menuItem.label}</span>
                      </Fragment>
                    ) : (
                      menuItem.icon
                    )}
                  </li>
                  <Tooltip
                    target={menuItem.tooltipTarget}
                    delay={{ show: 0, hide: 0 }}
                    placement="top"
                    isOpen={hoveredMenuItemId === menuItem.id}
                  >
                    {menuItem.label}
                  </Tooltip>
                </Fragment>
              );
            })}
          </ul>
        </div>
        <IconButton icon={<CloseIcon />} onClick={this.props.hideModal} />
      </div>
    );
  }

  render() {
    return (
      <ModalBorder
        className="keyword-info"
        onClose={this.props.hideModal}
        header={this.renderModalHeader()}
      >
        {this.renderContent()}
      </ModalBorder>
    );
  }
}

const keywordQuery = gql`
  query keywordHistoryChartContainer_keywordsRanks(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
    $keywordId: ID!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keyword(id: $keywordId) {
        id
        keyword
        searchType
        searchEngine {
          name
          id
        }
        location
        countrylocale {
          id
          countryCode
          region
        }
        domain {
          id
          domain
        }
      }
    }
  }
`;

const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = state => {
  const periodFilter = periodFilterSelector(state);
  return {
    filters: RequiredFiltersSelector(state),
    period: periodFilter && daysInPeriod(periodFilter),
  };
};

export default compose(
  connect(
    mapStateToProps,
    { hideModal },
  ),
  graphql(keywordQuery, {
    name: 'keywordData',
    options: props => {
      const { filters, keywordId } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          pagination: {
            page: 1,
            results: 1,
          },
          ordering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
          keywordId,
        },
      };
    },
  }),
)(KeywordInfo);
