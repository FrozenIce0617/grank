// @flow
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';

// actions
import { showModal } from 'Actions/ModalAction';

// components
import { Container, Row } from 'reactstrap';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { AFFILIATE_DASHBOARD } from 'Pages/Layout/ActionsMenu';
import Loader from 'Components/Loader';
import Kpi from 'Components/Kpi';
import AffiliateKpiGraph from './KpiGraph';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import Switch from 'Components/Switch';

// utils
import { t } from 'Utilities/i18n';
import { evolution, roundNumber, formatDate } from 'Utilities/format';
import { LATEST } from 'Components/PeriodFilter/model';
import { populateDataWithZeros } from './utils';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';

// styles
import './affiliate-dashboard.scss';

type Props = {
  // automatic
  setMetricsRange: Function,
  metricsData: Object,
  filters: Object,
  startDate: Date,
  endDate: Date,
};

type State = {
  activeKpis: Array<{
    title: string,
  }>,
  category: string,
};

class AffiliateDashboard extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      activeKpis: [t('Customers')],
      category: 'all',
    };
  }

  toggleCategorySwitch = el => {
    const { filters } = this.props;

    const s = this.state;
    s.category = el.id;
    this.setState(s);

    this.props.metricsData.refetch({
      category: s.category,
    });
  };

  handleKpiClick = ({ title }) => {
    const { activeKpis } = this.state;

    this.setState({
      activeKpis: !activeKpis.find(kpiTitle => kpiTitle === title)
        ? activeKpis.concat(title)
        : activeKpis.filter(kpiTitle => kpiTitle !== title),
    });
  };

  handleMakeAffiliateLink = () => {
    this.props.showModal({
      modalType: 'CreateAffiliateLink',
      modalTheme: 'light',
    });
  };

  handleAffiliateInfo = () => {
    this.props.showModal({
      modalType: 'AffiliateInfo',
      modalTheme: 'light',
    });
  };

  renderPageActions = () => {
    return (
      <Fragment>
        <Actions.AddAction
          label={t('Create affiliate link')}
          onClick={this.handleMakeAffiliateLink}
        />
        <Actions.NormalAction
          label={t('Affiliate Information')}
          onClick={this.handleAffiliateInfo}
        />
        <Switch
          width={250}
          els={[
            { name: 'all', id: 'all', prop: 'category' },
            { name: 'campaigns', id: 'campaigns', prop: 'category' },
            { name: 'placements', id: 'placements', prop: 'category' },
          ]}
          onClick={this.toggleCategorySwitch}
          style={{ display: 'inline-block' }}
          activeById
          activeId={this.state.category}
        />
      </Fragment>
    );
  };

  isKpiActive = title => {
    const { activeKpis } = this.state;
    return !!activeKpis.find(kpiTitle => kpiTitle === title);
  };

  populateData = data => {
    const { startDate, endDate } = this.props;
    return populateDataWithZeros(data, startDate, endDate).map(({ date, amount }) => ({
      date: formatDate(date),
      amount,
    }));
  };

  renderKpis = () => {
    const style = { display: 'flex' };
    return this.getKpiDescriptor().map(({ title, data, valueAsCurrency, valueAsPercentage }) => {
      data = this.populateData(data || []);

      const evo = data && data.length > 1;
      const value = data && data.length ? data[data.length - 1].amount : 0;
      return (
        <Kpi
          key={title}
          onClick={() => this.handleKpiClick({ title })}
          active={this.isKpiActive(title)}
          style={style}
          title={title}
          valueAsCurrency={valueAsCurrency}
          value={valueAsPercentage ? `${value}%` : value}
          graph={data.map(item => item.amount)}
          evolution={
            evo &&
            roundNumber(evolution(data[data.length - 2].amount, data[data.length - 1].amount), 2)
          }
        />
      );
    });
  };

  groupDate = data => {
    let result = [];

    const placements = new Set(data.map(e => e.placement));
    const campaigns = new Set(data.map(e => e.campaign));
    const { category } = this.state;

    if (category === 'placements') {
      placements.forEach(el => {
        result.push({
          title: `(p: ${el})`,
          data: data.filter(d => d.placement === el),
        });
      });
    } else if (category === 'campaigns') {
      campaigns.forEach(el => {
        result.push({
          title: `(c: ${el})`,
          data: data.filter(d => d.campaign === el),
        });
      });
    } else {
      result = [
        {
          title: '',
          data,
        },
      ];
    }

    return result;
  };

  getKpiDescriptor = () => {
    const {
      metricsData: {
        affiliate: { metrics },
      },
    } = this.props;

    const visitorToTrialRate = metrics.newTrials.map(trial => {
      const visitorsObject = metrics.visitors.filter(visitor => visitor.date === trial.date);
      let visitors = 0;

      if (visitorsObject.length > 0) {
        console.log(visitorsObject[0]);
        visitors = visitorsObject[0].amount;
      }

      return Object.assign({}, trial, {
        amount: (trial.amount / visitors) * 100,
      });
    });

    return [
      {
        title: t('Page views'),
        data: metrics.pageviews,
        groupedData: this.groupDate(metrics.pageviews),
        valueAsCurrency: false,
      },
      {
        title: t('Visitors'),
        data: metrics.visitors,
        groupedData: this.groupDate(metrics.visitors),
        valueAsCurrency: false,
      },
      {
        title: t('Active Trials'),
        data: metrics.trials,
        groupedData: this.groupDate(metrics.trials),
        valueAsCurrency: false,
      },
      {
        title: t('New Trials'),
        data: metrics.newTrials,
        groupedData: this.groupDate(metrics.newTrials),
        valueAsCurrency: false,
      },
      {
        title: t('Visitor to Trial conversion rate'),
        data: visitorToTrialRate,
        groupedData: this.groupDate(visitorToTrialRate),
        valueAsCurrency: false,
        valueAsPercentage: true,
      },
      {
        title: t('Active Customers'),
        data: metrics.customers,
        groupedData: this.groupDate(metrics.customers),
        valueAsCurrency: false,
      },
      {
        title: t('New Customers'),
        data: metrics.newCustomers,
        groupedData: this.groupDate(metrics.newCustomers),
        valueAsCurrency: false,
      },
      {
        title: t('Commissions'),
        data: metrics.commission,
        groupedData: this.groupDate(metrics.commission),
        valueAsCurrency: true,
      },
    ];
  };

  renderContent() {
    const { startDate, endDate } = this.props;
    const kpis = this.getKpiDescriptor().filter(kpi => this.isKpiActive(kpi.title));

    return (
      <Fragment>
        <Row>{this.renderKpis()}</Row>
        {kpis && kpis.length ? (
          <Row>
            <AffiliateKpiGraph startDate={startDate} endDate={endDate} kpis={kpis} />
          </Row>
        ) : null}
      </Fragment>
    );
  }

  render() {
    const {
      metricsData: { loading, error, affiliate },
    } = this.props;

    return (
      <DashboardTemplate showSegments={false}>
        <ActionsMenu menuFor={AFFILIATE_DASHBOARD} onlyPeriodFilter className="affiliate-actions">
          {!loading && !error ? this.renderPageActions() : null}
        </ActionsMenu>

        <Container className="affiliate-dashboard content-container with-padding" fluid>
          {loading ? (
            <Loader style={{ height: '500px' }} />
          ) : !affiliate || error ? (
            <div>
              {t('Error fetching data.')} {error.message || ''}
            </div>
          ) : !Object.keys(affiliate.metrics).some(
            key => affiliate.metrics[key] && affiliate.metrics[key].length,
          ) ? (
            <div>{t('There are no data for the selected period.')}</div>
          ) : (
            this.renderContent()
          )}
        </Container>
      </DashboardTemplate>
    );
  }
}

const metricsQuery = gql`
  query affiliateDashboard_metrics($filters: [FilterInput]!, $category: String!) {
    affiliate {
      metrics(filters: $filters, category: $category) {
        visitors {
          date
          amount
          placement
          campaign
        }
        customers {
          date
          amount
          placement
          campaign
        }
        newCustomers {
          date
          amount
          placement
          campaign
        }
        trials {
          date
          amount
          placement
          campaign
        }
        newTrials {
          date
          amount
          placement
          campaign
        }
        pageviews {
          date
          amount
          placement
          campaign
        }
        commission {
          date
          amount
          placement
          campaign
        }
      }
    }
  }
`;

const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = state => {
  const periodFilter = periodFilterSelector(state);

  const date = JSON.parse(periodFilter.value);
  const firstMoment = moment(date[0]);
  const lastMoment = date[1] === LATEST ? moment() : moment(date[1]);

  return {
    filters: state.filter.filterGroup.filters,
    startDate: firstMoment.toDate(),
    endDate: lastMoment.toDate(),
  };
};

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(metricsQuery, {
    name: 'metricsData',
    options: ({ filters }) => {
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          category: 'all',
        },
      };
    },
  }),
)(AffiliateDashboard);
