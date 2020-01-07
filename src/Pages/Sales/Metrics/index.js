/* eslint-disable react/no-did-update-set-state */
// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Container, Row, Col, Dropdown, DropdownToggle, DropdownMenu, Collapse } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select';
import findIndex from 'lodash/findIndex';

// Utilities
import { t } from 'Utilities/i18n/index';

import { evolution, roundNumber, formatDate } from 'Utilities/format';
import { mrrColors } from 'Utilities/colors';

// Actions
import {
  setMetricsRange,
  setMetricsInterval,
  setActiveMetricsRR,
  setMetricsManager,
  setActiveMetricsPlan,
} from 'Actions/SalesMetricsAction';
import { showModal } from 'Actions/ModalAction';

// Components
import DashboardTemplate from 'Pages/Layout/DashboardTemplate/index';
import ActionsMenu, { SALES_METRICS } from 'Pages/Layout/ActionsMenu/index';
import DatesPicker from 'Components/PeriodFilter/CompareToContent/DatesPicker/index';
import MonthsPicker from 'Components/PeriodFilter/MonthsPicker/index';
import Kpi from 'Components/Kpi/index';
import Loader from 'Components/Loader/index';
import LineChart from 'Components/LineChart/index';
import SimpleItemsList from 'Components/Controls/Dropdowns/SimpleItemsList/index';
import { UpdateAction, AddAction } from 'Pages/Layout/ActionsMenu/Actions/index';
import Switch from 'Components/Switch/index';
import MetricTable from 'Components/MetricTable/index';

// Types
import type { State as MetricsState } from 'Reducers/SalesMetricsReducer';

import './sales-metrics.scss';

type Props = {
  adminSalesMetricsData: Object,
  adminSalesMetricsGoalsData: Object,
  adminSalesManagersData: Object,

  salesMetrics: MetricsState,
  isCfo: boolean,
  history: Object,

  setMetricsRange: Function,
  setMetricsInterval: Function,
  setActiveMetricsRR: Function,
  showModal: Function,
  setMetricsManager: Function,
  setActiveMetricsPlan: Function,
};

type State = {
  searchTerm: string,
  dropdown: boolean | 'period' | 'interval' | 'manager' | 'compare',
  min: Date,
  max: Date,
  tempRange: {
    from: Date,
    to: Date,
  },
  compareTo: Object | null,
  activeKpis: Array<{
    title: string,
    graph: Array<number>,
  }>,
  metricTable: {
    visible: boolean,
    metric: string,
    date: Date,
    data: any,
  },
};

const setDropdown = (curVal, newVal) => (curVal === newVal ? false : newVal);

class SalesMetrics extends Component<Props, State> {
  state = {
    searchTerm: '',
    dropdown: false,
    min: new Date(0),
    max: new Date(),
    tempRange: {
      from: this.props.salesMetrics.metricsRange.from,
      to: this.props.salesMetrics.metricsRange.to,
    },
    compareTo: null, // this.props.adminSalesMetricsData.adminSalesMetrics[0],
    activeKpis: [],
    metricTable: {
      visible: false,
    },
  };

  componentDidUpdate(prevProps) {
    const { adminSalesMetrics } = this.props.adminSalesMetricsData;
    if (adminSalesMetrics !== prevProps.adminSalesMetricsData.adminSalesMetrics) {
      let compareToIndex = 1;
      if (adminSalesMetrics.length >= 2) {
        compareToIndex = adminSalesMetrics.length - 2;
      }

      this.setState({ compareTo: adminSalesMetrics[compareToIndex] }); // prev interval el in arr
    }
  }

  closeFilter = () => this.setState({ dropdown: false });

  handleAddAction = () => {
    this.props.showModal({
      modalType: 'AddGoal',
      modalTheme: 'light',
      modalProps: {
        refetch: () => this.props.adminSalesMetricsGoalsData.refetch(),
        salesManager: this.props.salesMetrics.manager,
      },
    });
  };

  renderPeriodPicker = () => {
    const { interval } = this.props.salesMetrics;
    const { min, max, tempRange } = this.state;
    return interval !== t('Month') ? (
      <DatesPicker
        value={tempRange}
        min={min}
        max={max}
        onChange={({ from, to }) => this.setState({ tempRange: { from, to } })}
      />
    ) : (
      <MonthsPicker
        value={tempRange}
        min={min}
        max={max}
        onChange={({ from, to }) => this.setState({ tempRange: { from, to } })}
      />
    );
  };

  renderPageFilters = () => {
    const {
      isCfo,
      adminSalesManagersData,
      adminSalesMetricsData: { adminSalesMetrics, loading },
    } = this.props;
    const { dropdown, tempRange, compareTo } = this.state;
    const { interval, manager } = this.props.salesMetrics;
    const adminSalesManagers = adminSalesManagersData.adminSalesManagers.filter(el => el.active);

    return (
      <React.Fragment>
        <Dropdown
          className="simple-dropdown period-filter-dropdown"
          isOpen={dropdown === 'period'}
          toggle={() => this.setState({ dropdown: setDropdown(dropdown, 'period') })}
        >
          <DropdownToggle tag="div" className="menu-toggle" disabled>
            <UpdateAction brand="orange" label={t('Update dates')} disabled />
          </DropdownToggle>
          <DropdownMenu flip={false} className="dropdown-menu-overlap">
            <div className="period-filter-editor">
              {this.renderPeriodPicker()}
              <div className="action-buttons">
                <button
                  type="button"
                  className="btn btn-brand-orange"
                  onClick={() => {
                    this.props.setMetricsRange(tempRange);
                    this.closeFilter();
                  }}
                >
                  {t('Update')}
                </button>
              </div>
            </div>
          </DropdownMenu>
        </Dropdown>

        <Dropdown
          isOpen={dropdown === 'interval'}
          toggle={() => this.setState({ dropdown: setDropdown(dropdown, 'interval') })}
          className={`simple-dropdown period-filter-dropdown`}
        >
          <DropdownToggle tag="div" className="menu-toggle" disabled>
            <UpdateAction title="Interval" label={interval} className="icn-settings" disabled />
          </DropdownToggle>
          <DropdownMenu>
            <SimpleItemsList
              items={[
                { label: t('Year') },
                { label: t('Month') },
                { label: t('Week') },
                { label: t('Day') },
              ]}
              item={{ label: interval }}
              labelFunc={el => el.label}
              onSelect={el => {
                this.props.setMetricsInterval(el.label);
                this.closeFilter();
              }}
            />
          </DropdownMenu>
        </Dropdown>

        <Dropdown
          isOpen={dropdown === 'compare'}
          toggle={() => this.setState({ dropdown: setDropdown(dropdown, 'compare') })}
          className={`simple-dropdown period-filter-dropdown`}
        >
          <DropdownToggle tag="div" className="menu-toggle">
            <UpdateAction
              title={`${t('Compare latest')} ${interval.toLowerCase()} ${t('to')}`}
              label={
                compareTo
                  ? `${formatDate(compareTo.startDate)} - ${formatDate(compareTo.endDate)}`
                  : '--'
              }
              className="icn-settings"
            />
          </DropdownToggle>
          <DropdownMenu>
            <Select
              autoFocus
              openOnFocus
              value={{ value: compareTo }}
              onChange={el => {
                this.setState({ compareTo: el.value });
                this.closeFilter();
              }}
              isLoading={loading}
              arrowRenderer={() => <div className="dropdown-arrow" />}
              options={
                loading || !adminSalesMetrics.length
                  ? []
                  : adminSalesMetrics.filter((el, i) => i !== 0).map(el => ({
                      label: `${formatDate(el.startDate)} - ${formatDate(el.endDate)}`,
                      value: el,
                    }))
              }
            />
          </DropdownMenu>
        </Dropdown>

        {isCfo ? (
          <Dropdown
            isOpen={dropdown === 'manager'}
            toggle={() => this.setState({ dropdown: setDropdown(dropdown, 'manager') })}
            className={`simple-dropdown period-filter-dropdown`}
          >
            <DropdownToggle tag="div" className="menu-toggle">
              <UpdateAction
                title={t('Sales manager')}
                label={manager ? manager.name : 'All'}
                className="icn-settings"
              />
            </DropdownToggle>
            <DropdownMenu>
              <SimpleItemsList
                items={[{ id: null, name: t('All') }, ...adminSalesManagers]}
                labelFunc={el => el.name}
                onSelect={el => {
                  this.props.setMetricsManager(el);
                  this.closeFilter();
                }}
              />
            </DropdownMenu>
          </Dropdown>
        ) : null}
      </React.Fragment>
    );
  };

  handleKpiClick = kpi => {
    const { activeKpis } = this.state;

    if (findIndex(activeKpis, el => el.title === kpi.title) === -1) {
      this.setState({ activeKpis: [...activeKpis, kpi] });
    } else {
      const newArr = activeKpis.filter(el => el.title !== kpi.title);
      this.setState({ activeKpis: newArr });
    }
  };

  getPartialArray = array => {
    return array.filter(e => new Date(e.endDate) <= new Date());
  };

  renderContent() {
    const {
      adminSalesMetricsData: { adminSalesMetrics },
      adminSalesMetricsGoalsData: { adminSalesMetricsGoals },
      salesMetrics: { recurringRevenueMetrics, plansMetrics },
      isCfo,
    } = this.props;
    const { compareTo, activeKpis } = this.state;

    const data = adminSalesMetrics
      .slice()
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const evo = data.length > 1 && compareTo;
    const reversedData = data.slice().reverse();

    const activePlan = plansMetrics.filter(el => el.active)[0].id || 'count';
    const rrMultiplier = recurringRevenueMetrics.filter(el => el.active)[0].id || 1;
    const categories = reversedData.map(el => formatDate(el.startDate));
    const dateCats = reversedData.map(el => +new Date(el.startDate)); // reversedData.map(el => formatDate(el.startDate));
    const catLastEl = dateCats[dateCats.length - 1];

    const mrrNew = [],
      mrrExpansion = [],
      mrrContraction = [],
      mrrReactivation = [],
      mrrChurn = [],
      mrrNet = [];

    const plans = {
      basic: { count: [], mrr: [], mrr_percent: [] },
      professional: { count: [], mrr: [], mrr_percent: [] },
      expert: { count: [], mrr: [], mrr_percent: [] },
      enterprise: { count: [], mrr: [], mrr_percent: [] },
    };

    const companyTypes = {
      '1': { count: [], mrr: [], mrr_percent: [] },
      '2': { count: [], mrr: [], mrr_percent: [] },
      '3': { count: [], mrr: [], mrr_percent: [] },
      '4': { count: [], mrr: [], mrr_percent: [] },
      other: { count: [], mrr: [], mrr_percent: [] },
    };

    const companyCountries = {};

    // fill dict with options
    reversedData.forEach(el => {
      // countries
      el.countries.forEach(c => {
        if (companyCountries[c.country] === undefined) {
          companyCountries[c.country] = {
            name: c.country,
            color: mrrColors.contraction,
            data: { count: [], mrr: [], mrr_percent: [] },
          };
        }
      });
    });

    reversedData.forEach(el => {
      // MRR graph
      mrrNew.push(roundNumber(el.mrr.new.amount));
      mrrExpansion.push(roundNumber(el.mrr.expansion.amount));
      mrrContraction.push(roundNumber(el.mrr.contraction.amount));
      mrrReactivation.push(roundNumber(el.mrr.reactivation.amount));
      mrrChurn.push(roundNumber(el.mrr.churn.amount));
      mrrNet.push(roundNumber(el.mrr.net.amount));

      // Plans breakout: country
      Object.keys(companyCountries).forEach(country => {
        const countryData = el.countries.filter(e => e.country === country);
        companyCountries[country].data.count.push(countryData.reduce((a, b) => a + b.count, 0));
        companyCountries[country].data.mrr.push(
          roundNumber(countryData.reduce((a, b) => a + b.mrr, 0), 2),
        );
      });

      // Plans breakout: count, mrr
      const basic = el.plans.filter(planEl => planEl.category === 'Basic');
      plans.basic.count.push(basic.reduce((a, b) => a + b.count, 0));
      const baMrr = roundNumber(basic.reduce((a, b) => a + b.mrr, 0), 2);
      plans.basic.mrr.push(baMrr);

      const professional = el.plans.filter(planEl => planEl.category === 'Professional');
      plans.professional.count.push(professional.reduce((a, b) => a + b.count, 0));
      const prMrr = roundNumber(professional.reduce((a, b) => a + b.mrr, 0), 2);
      plans.professional.mrr.push(prMrr);

      const expert = el.plans.filter(planEl => planEl.category === 'Expert');
      plans.expert.count.push(expert.reduce((a, b) => a + b.count, 0));
      const exMrr = roundNumber(expert.reduce((a, b) => a + b.mrr, 0), 2);
      plans.expert.mrr.push(exMrr);

      const enterprise = el.plans.filter(planEl => planEl.category === 'Enterprise');
      plans.enterprise.count.push(enterprise.reduce((a, b) => a + b.count, 0));
      const enMrr = roundNumber(enterprise.reduce((a, b) => a + b.mrr, 0), 2);
      plans.enterprise.mrr.push(enMrr);

      // Plans breakout: mrr_percent
      const totalMrr = baMrr + prMrr + exMrr + enMrr;
      plans.basic.mrr_percent.push(roundNumber((baMrr / totalMrr) * 100));
      plans.professional.mrr_percent.push(roundNumber((prMrr / totalMrr) * 100));
      plans.expert.mrr_percent.push(roundNumber((exMrr / totalMrr) * 100));
      plans.enterprise.mrr_percent.push(roundNumber((enMrr / totalMrr) * 100));

      // company type breakout
      const companyType_1 = el.companyTypes.filter(planEl => planEl.type === '1');
      const companyType_1_mrr = roundNumber(companyType_1.reduce((a, b) => a + b.mrr, 0), 2);
      companyTypes['1'].count.push(companyType_1.reduce((a, b) => a + b.count, 0));
      companyTypes['1'].mrr.push(companyType_1_mrr);

      const companyType_2 = el.companyTypes.filter(planEl => planEl.type === '2');
      const companyType_2_mrr = roundNumber(companyType_2.reduce((a, b) => a + b.mrr, 0), 2);
      companyTypes['2'].count.push(companyType_2.reduce((a, b) => a + b.count, 0));
      companyTypes['2'].mrr.push(companyType_2_mrr);

      const companyType_3 = el.companyTypes.filter(planEl => planEl.type === '3');
      const companyType_3_mrr = roundNumber(companyType_3.reduce((a, b) => a + b.mrr, 0), 2);
      companyTypes['3'].count.push(companyType_3.reduce((a, b) => a + b.count, 0));
      companyTypes['3'].mrr.push(companyType_3_mrr);

      const companyType_4 = el.companyTypes.filter(planEl => planEl.type === '4');
      const companyType_4_mrr = roundNumber(companyType_4.reduce((a, b) => a + b.mrr, 0), 2);
      companyTypes['4'].count.push(companyType_4.reduce((a, b) => a + b.count, 0));
      companyTypes['4'].mrr.push(companyType_4_mrr);

      const companyType_other = el.companyTypes.filter(planEl => planEl.type === 'other');
      const companyType_other_mrr = roundNumber(
        companyType_other.reduce((a, b) => a + b.mrr, 0),
        2,
      );
      companyTypes['other'].count.push(companyType_other.reduce((a, b) => a + b.count, 0));
      companyTypes['other'].mrr.push(companyType_other_mrr);

      // Plans breakout: mrr_percent
      const companyTypeTotalMrr =
        companyType_1_mrr +
        companyType_2_mrr +
        companyType_3_mrr +
        companyType_4_mrr +
        companyType_other_mrr;
      companyTypes['1'].mrr_percent.push(
        roundNumber((companyType_1_mrr / companyTypeTotalMrr) * 100),
      );
      companyTypes['2'].mrr_percent.push(
        roundNumber((companyType_2_mrr / companyTypeTotalMrr) * 100),
      );
      companyTypes['3'].mrr_percent.push(
        roundNumber((companyType_3_mrr / companyTypeTotalMrr) * 100),
      );
      companyTypes['4'].mrr_percent.push(
        roundNumber((companyType_4_mrr / companyTypeTotalMrr) * 100),
      );
      companyTypes['other'].mrr_percent.push(
        roundNumber((companyType_other_mrr / companyTypeTotalMrr) * 100),
      );
    });

    console.log(companyCountries);
    console.log(companyTypes);

    return (
      <React.Fragment>
        <Row
          style={{
            paddingLeft: 15,
            paddingBottom: 5,
          }}
        >
          <span className="label-with-help">
            <span>{t('Company')}</span>
          </span>
        </Row>

        <Row>
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Quick Ratio')) !== -1}
            style={{ display: 'flex' }}
            title={t('Quick Ratio')}
            value={roundNumber(this.getPartialArray(data)[0].quickRatio, 2)}
            valueAsCurrency={false}
            graph={this.getPartialArray(reversedData).map(el => roundNumber(el.quickRatio, 2))}
            evolution={
              evo &&
              roundNumber(
                evolution(compareTo.quickRatio, this.getPartialArray(data)[0].quickRatio),
                2,
              )
            }
          />

          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('NPS')) !== -1}
            style={{ display: 'flex' }}
            title={t('NPS')}
            value={roundNumber(this.getPartialArray(data)[0].nps, 2)}
            valueAsCurrency={false}
            graph={this.getPartialArray(reversedData).map(el => roundNumber(el.nps, 2))}
            evolution={
              evo && roundNumber(evolution(compareTo.nps, this.getPartialArray(data)[0].nps), 2)
            }
          />
        </Row>

        <Row
          style={{
            paddingLeft: 15,
            paddingBottom: 5,
          }}
        >
          <span className="label-with-help">
            <span>{t('Revenue')}</span>
          </span>
        </Row>

        <Row>
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('MRR Movement')) !== -1}
            style={{ display: 'flex' }}
            title={t('MRR Movement')}
            value={roundNumber(data[0].mrr.net.amount)}
            graph={reversedData.map(el => roundNumber(el.mrr.net.amount))}
            evolution={
              evo && roundNumber(evolution(compareTo.mrr.net.amount, data[0].mrr.net.amount), 2)
            }
          />

          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={
              findIndex(activeKpis, el => el.title === t('Monthly Recurring Revenue (MRR)')) !== -1
            }
            style={{ display: 'flex' }}
            title={t('Monthly Recurring Revenue (MRR)')}
            value={roundNumber(data[0].mrr.total.amount)}
            graph={reversedData.map(el => roundNumber(el.mrr.total.amount))}
            evolution={
              evo && roundNumber(evolution(compareTo.mrr.total.amount, data[0].mrr.total.amount), 2)
            }
          />

          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={
              findIndex(activeKpis, el => el.title === t('Annual Recurring Revenue (ARR)')) !== -1
            }
            style={{ display: 'flex' }}
            title={t('Annual Recurring Revenue (ARR)')}
            value={roundNumber(data[0].mrr.total.amount * 12)}
            graph={reversedData.map(el => roundNumber(el.mrr.total.amount * 12))}
            evolution={
              evo &&
              roundNumber(
                evolution(compareTo.mrr.total.amount * 12, data[0].mrr.total.amount * 12),
                2,
              )
            }
          />

          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Net Revenue')) !== -1}
            style={{ display: 'flex' }}
            title={t('Net Revenue')}
            value={roundNumber(this.getPartialArray(data)[0].netCashFlow)}
            graph={this.getPartialArray(reversedData).map(el => roundNumber(el.netCashFlow))}
            evolution={
              evo &&
              roundNumber(
                evolution(compareTo.netCashFlow, this.getPartialArray(data)[0].netCashFlow),
                2,
              )
            }
          />
        </Row>

        <Row
          style={{
            paddingLeft: 15,
            paddingBottom: 5,
          }}
        >
          <span className="label-with-help">
            <span>{t('Affiliate')}</span>
          </span>
        </Row>

        <Row>
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={
              findIndex(
                activeKpis,
                el => el.title === t('Affiliate Monthly Recurring Revenue (MRR)'),
              ) !== -1
            }
            style={{ display: 'flex' }}
            title={t('Affiliate Monthly Recurring Revenue (MRR)')}
            value={roundNumber(data[0].mrr.affiliate.amount)}
            graph={reversedData.map(el => roundNumber(el.mrr.affiliate.amount))}
            evolution={
              evo &&
              roundNumber(
                evolution(compareTo.mrr.affiliate.amount, data[0].mrr.affiliate.amount),
                2,
              )
            }
          />
        </Row>

        <Row
          style={{
            paddingLeft: 15,
            paddingBottom: 5,
          }}
        >
          <span className="label-with-help">
            <span>{t('Customers')}</span>
          </span>
        </Row>

        <Row>
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={
              findIndex(activeKpis, el => el.title === t('Customer Lifetime Value (CLV)')) !== -1
            }
            style={{ display: 'flex' }}
            title={t('Customer Lifetime Value (CLV)')}
            value={roundNumber(this.getPartialArray(data)[0].customers.ltv)}
            graph={this.getPartialArray(reversedData).map(el => roundNumber(el.customers.ltv))}
            evolution={
              evo &&
              roundNumber(
                evolution(compareTo.customers.ltv, this.getPartialArray(data)[0].customers.ltv),
                2,
              )
            }
          />
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={
              findIndex(activeKpis, el => el.title === t('Average Revenue Per Account (ARPA)')) !==
              -1
            }
            style={{ display: 'flex' }}
            title={t('Average Revenue Per Account (ARPA)')}
            value={roundNumber(data[0].arpa)}
            graph={reversedData.map(el => roundNumber(el.arpa))}
            evolution={evo && roundNumber(evolution(compareTo.arpa, data[0].arpa), 2)}
          />
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Average Sale Price (ASP)')) !== -1}
            style={{ display: 'flex' }}
            title={t('Average Sale Price (ASP)')}
            value={roundNumber(data[0].asp)}
            graph={reversedData.map(el => roundNumber(el.asp))}
            evolution={evo && roundNumber(evolution(compareTo.asp, data[0].asp), 2)}
          />
        </Row>
        <Row
          style={{
            paddingLeft: 15,
            paddingBottom: 5,
          }}
        >
          <span className="label-with-help">
            <span>{t('Churn')}</span>
          </span>
        </Row>
        <Row>
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Customer Churn Rate')) !== -1}
            style={{ display: 'flex' }}
            title={t('Customer Churn Rate')}
            value={`${roundNumber(this.getPartialArray(data)[0].customers.churnRate, 2)}%`}
            valueAsCurrency={false}
            graph={this.getPartialArray(reversedData).map(el =>
              roundNumber(el.customers.churnRate, 2),
            )}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.churnRate, this.getPartialArray(data)[0].customers.churnRate), 2
            )}
            reverseEvolution
          />
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Net MRR Churn Rate')) !== -1}
            style={{ display: 'flex' }}
            title={t('Net MRR Churn Rate')}
            value={`${roundNumber(this.getPartialArray(data)[0].mrr.netChurnRate, 2)}%`}
            valueAsCurrency={false}
            graph={this.getPartialArray(reversedData).map(el =>
              roundNumber(el.mrr.netChurnRate, 2),
            )}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.mrr.netChurnRate, this.getPartialArray(data)[0].mrr.netChurnRate), 2
            )}
            reverseEvolution
          />

          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Gross MRR Churn Rate')) !== -1}
            style={{ display: 'flex' }}
            title={t('Gross MRR Churn Rate')}
            value={`${roundNumber(this.getPartialArray(data)[0].mrr.grossChurnRate, 2)}%`}
            valueAsCurrency={false}
            graph={this.getPartialArray(reversedData).map(el =>
              roundNumber(el.mrr.grossChurnRate, 2),
            )}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.mrr.grossChurnRate, this.getPartialArray(data)[0].mrr.grossChurnRate), 2
            )}
            reverseEvolution
          />
        </Row>

        <Row
          style={{
            paddingLeft: 15,
            paddingBottom: 5,
          }}
        >
          <span className="label-with-help">
            <span>{t('Convertion')}</span>
          </span>
        </Row>
        <Row>
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={
              findIndex(activeKpis, el => el.title === t('Unconfirmed Convertion Rate')) !== -1
            }
            style={{ display: 'flex' }}
            title={t('Unconfirmed Convertion Rate')}
            value={`${roundNumber(data[0].customers.unconfirmedConvertedRate, 2)}%`}
            valueAsCurrency={false}
            graph={reversedData.map(el => roundNumber(el.customers.unconfirmedConvertedRate, 2))}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.unconfirmedConvertedRate, data[0].customers.unconfirmedConvertedRate), 2
            )}
          />

          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Trial Convertion Rate')) !== -1}
            style={{ display: 'flex' }}
            title={t('Trial Convertion Rate')}
            value={`${roundNumber(data[0].customers.trialConvertedRate, 2)}%`}
            valueAsCurrency={false}
            graph={reversedData.map(el => roundNumber(el.customers.trialConvertedRate, 2))}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.trialConvertedRate, data[0].customers.trialConvertedRate), 2
            )}
          />

          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Trials Converted')) !== -1}
            style={{ display: 'flex' }}
            title={t('Trials Converted')}
            value={`${roundNumber(data[0].customers.trialConverted, 0)}`}
            valueAsCurrency={false}
            graph={reversedData.map(el => roundNumber(el.customers.trialConverted, 0))}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.trialConverted, data[0].customers.trialConverted), 2
            )}
          />
        </Row>

        <Row
          style={{
            paddingLeft: 15,
            paddingBottom: 5,
          }}
        >
          <span className="label-with-help">
            <span>{t('Users')}</span>
          </span>
        </Row>
        <Row>
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Subscribers')) !== -1}
            style={{ display: 'flex' }}
            title={t('Subscribers')}
            value={`${roundNumber(
              data[0].customers.count + data[0].customers.freePlans + data[0].customers.trials,
              0,
            )}`}
            valueAsCurrency={false}
            graph={reversedData.map(el =>
              roundNumber(el.customers.count + el.customers.freePlans + el.customers.trials, 0),
            )}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.count + compareTo.customers.freePlans + compareTo.customers.trials, data[0].customers.count + data[0].customers.freePlans + data[0].customers.trials,), 2
            )}
          />
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Paying Subscribers')) !== -1}
            style={{ display: 'flex' }}
            title={t('Paying Subscribers')}
            value={`${roundNumber(data[0].customers.count, 0)}`}
            valueAsCurrency={false}
            graph={reversedData.map(el => roundNumber(el.customers.count, 0))}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.count, data[0].customers.count), 2
            )}
          />
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Free Subscribers')) !== -1}
            style={{ display: 'flex' }}
            title={t('Free Subscribers')}
            value={`${roundNumber(data[0].customers.freePlans, 0)}`}
            valueAsCurrency={false}
            graph={reversedData.map(el => roundNumber(el.customers.freePlans, 0))}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.freePlans, data[0].customers.freePlans), 2
            )}
          />
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Trials')) !== -1}
            style={{ display: 'flex' }}
            title={t('Trials')}
            value={`${roundNumber(data[0].customers.trials, 0)}`}
            valueAsCurrency={false}
            graph={reversedData.map(el => roundNumber(el.customers.trials, 0))}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.trials, data[0].customers.trials), 2
            )}
          />
          <Kpi
            onClick={kpi => this.handleKpiClick(kpi)}
            active={findIndex(activeKpis, el => el.title === t('Cancellations')) !== -1}
            style={{ display: 'flex' }}
            title={t('Cancellations')}
            value={`${roundNumber(data[0].customers.cancellations, 0)}`}
            valueAsCurrency={false}
            graph={reversedData.map(el => roundNumber(el.customers.cancellations, 0))}
            // prettier-ignore
            evolution={evo && roundNumber(
              evolution(compareTo.customers.cancellations, data[0].customers.cancellations), 2
            )}
          />
        </Row>

        <Collapse isOpen={!!activeKpis.length}>
          <div className="row-hidden-graph">
            <Row>
              <Col xs={12} style={{ marginTop: '20px' }}>
                <LineChart
                  series={activeKpis.map((el, i) => ({
                    name: el.title,
                    data: el.graph,
                    yAxis: i,
                  }))}
                  categories={categories}
                  // label={{
                  //   text: t('Net vs Gross Churn Rate (MRR)'),
                  //   helpText: t('Evolution of net vs gross churn rate of MRR'),
                  // }}
                  extendConfig={{
                    chart: {
                      backgroundColor: '#f5f7fa',
                    },
                    legend: {
                      enabled: true,
                    },
                    yAxis: activeKpis.map((el, i) => ({
                      title: { text: el.title },
                      opposite: i % 2,
                    })),
                  }}
                />
              </Col>
            </Row>
          </div>
        </Collapse>

        <Row>
          <Col xs={12} style={{ marginTop: '30px' }}>
            <LineChart
              series={[
                {
                  name: t('New'),
                  color: mrrColors.new,
                  data: mrrNew,
                  cursor: 'pointer',
                  events: {
                    click: event => {
                      this.setState({
                        metricTable: {
                          visible: true,
                          metric: 'new',
                          date: new Date(event.point.category),
                          data: reversedData.filter(e => e.startDate === event.point.category)[0]
                            .metricsNew,
                        },
                      });
                    },
                  },
                },
                {
                  name: t('Expansion'),
                  color: mrrColors.expansion,
                  data: mrrExpansion,
                  cursor: 'pointer',
                  events: {
                    click: event => {
                      this.setState({
                        metricTable: {
                          visible: true,
                          metric: 'expansion',
                          date: new Date(event.point.category),
                          data: reversedData.filter(e => e.startDate === event.point.category)[0]
                            .metricsExpansion,
                        },
                      });
                    },
                  },
                },
                {
                  name: t('Reactivation'),
                  color: mrrColors.reactivation,
                  data: mrrReactivation,
                  cursor: 'pointer',
                  events: {
                    click: event => {
                      this.setState({
                        metricTable: {
                          visible: true,
                          metric: 'reactivation',
                          date: new Date(event.point.category),
                          data: reversedData.filter(e => e.startDate === event.point.category)[0]
                            .metricsReactivation,
                        },
                      });
                    },
                  },
                },
                {
                  name: t('Contraction'),
                  color: mrrColors.contraction,
                  data: mrrContraction,
                  cursor: 'pointer',
                  events: {
                    click: event => {
                      this.setState({
                        metricTable: {
                          visible: true,
                          metric: 'contraction',
                          date: new Date(event.point.category),
                          data: reversedData.filter(e => e.startDate === event.point.category)[0]
                            .metricsContraction,
                        },
                      });
                    },
                  },
                },
                {
                  name: t('Churn'),
                  color: mrrColors.churn,
                  data: mrrChurn,
                  cursor: 'pointer',
                  events: {
                    click: event => {
                      this.setState({
                        metricTable: {
                          visible: true,
                          date: new Date(event.point.category),
                          metric: 'churn',
                          data: reversedData.filter(e => e.startDate === event.point.category)[0]
                            .metricsChurn,
                        },
                      });
                    },
                  },
                },
                {
                  name: t('Net new'),
                  color: mrrColors.net,
                  type: 'line',
                  data: mrrNet,
                  cursor: 'pointer',
                },
              ]}
              categories={categories}
              label={{
                text: t('Monthly Recurring Revenue Growth'),
              }}
              valueIsCurrency
              extendConfig={{
                chart: {
                  type: 'column',
                  height: '350',
                },
                plotOptions: {
                  column: {
                    stacking: 'normal',
                  },
                },
                yAxis: {
                  title: { text: t('number in USD ($)') },
                },
                legend: {
                  enabled: true,
                },
              }}
            />

            {this.state.metricTable.visible && <MetricTable {...this.state.metricTable} />}
          </Col>

          <Col xs={12} style={{ marginTop: '40px' }}>
            <div className="SalesMetrics-mrrActions">
              <Switch
                els={plansMetrics}
                onClick={el => this.props.setActiveMetricsPlan(el)}
                width={280}
                style={{ display: 'inline-block' }}
              />
            </div>

            <LineChart
              series={[
                {
                  name: t('Enterprise'),
                  color: mrrColors.contraction,
                  data: plans.enterprise[activePlan],
                },
                {
                  name: t('Expert'),
                  color: mrrColors.reactivation,
                  data: plans.expert[activePlan],
                },
                {
                  name: t('Professional'),
                  color: mrrColors.expansion,
                  data: plans.professional[activePlan],
                },
                {
                  name: t('Basic'),
                  color: mrrColors.new,
                  data: plans.basic[activePlan],
                },
              ]}
              valueIsCurrency={activePlan === 'mrr'}
              categories={categories}
              label={{
                text: t('Plans breakout'),
                helpText: t('Grouped plans broken out per plan category.'),
              }}
              extendConfig={{
                chart: {
                  type: 'column',
                  height: '350',
                  animation: true,
                },
                plotOptions: {
                  column: {
                    stacking: activePlan === 'mrr_percent' ? 'percent' : 'normal',
                  },
                },
                yAxis: {
                  title: { text: t('Combined plans') },
                },
                legend: { enabled: true },
                tooltip: {
                  valueSuffix: activePlan === 'mrr_percent' && '%',
                },
              }}
            />
          </Col>

          <Col xs={12} style={{ marginTop: '40px' }}>
            <div className="SalesMetrics-mrrActions">
              <Switch
                els={plansMetrics}
                onClick={el => this.props.setActiveMetricsPlan(el)}
                width={280}
                style={{ display: 'inline-block' }}
              />
            </div>

            <LineChart
              series={[
                {
                  name: t('Agency'),
                  color: mrrColors.contraction,
                  data: companyTypes['1'][activePlan],
                },
                {
                  name: t('E-commerce'),
                  color: mrrColors.reactivation,
                  data: companyTypes['2'][activePlan],
                },
                {
                  name: t('Brand'),
                  color: mrrColors.expansion,
                  data: companyTypes['3'][activePlan],
                },
                {
                  name: t('Independent/Consultant'),
                  color: mrrColors.expansion,
                  data: companyTypes['4'][activePlan],
                },
                {
                  name: t('Other'),
                  color: mrrColors.new,
                  data: companyTypes.other[activePlan],
                },
              ]}
              valueIsCurrency={activePlan === 'mrr'}
              categories={categories}
              label={{
                text: t('Company type breakout'),
                helpText: t('Grouped by company type.'),
              }}
              extendConfig={{
                chart: {
                  type: 'column',
                  height: '350',
                  animation: true,
                },
                plotOptions: {
                  column: {
                    stacking: activePlan === 'mrr_percent' ? 'percent' : 'normal',
                  },
                },
                yAxis: {
                  title: { text: t('Combined organizations') },
                },
                legend: { enabled: true },
                tooltip: {
                  valueSuffix: activePlan === 'mrr_percent' && '%',
                },
              }}
            />
          </Col>

          <Col xs={12} style={{ marginTop: '40px' }}>
            <div className="SalesMetrics-mrrActions">
              <Switch
                els={plansMetrics}
                onClick={el => this.props.setActiveMetricsPlan(el)}
                width={280}
                style={{ display: 'inline-block' }}
              />
            </div>

            <LineChart
              series={Object.keys(companyCountries).map(v => ({
                name: companyCountries[v].name,
                color: companyCountries[v].color,
                data: companyCountries[v].data[activePlan],
              }))}
              valueIsCurrency={activePlan === 'mrr'}
              categories={categories}
              label={{
                text: t('Company country breakout'),
                helpText: t('Grouped by company country.'),
              }}
              extendConfig={{
                chart: {
                  type: 'column',
                  height: '350',
                  animation: true,
                },
                plotOptions: {
                  column: {
                    stacking: activePlan === 'mrr_percent' ? 'percent' : 'normal',
                  },
                },
                yAxis: {
                  title: { text: t('Combined organizations') },
                },
                legend: { enabled: true },
                tooltip: {
                  valueSuffix: activePlan === 'mrr_percent' && '%',
                },
              }}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  render() {
    const {
      adminSalesManagersData,
      adminSalesMetricsData: { loading, error, adminSalesMetrics },
    } = this.props;

    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SALES_METRICS}>
          {!adminSalesManagersData.loading && !error ? this.renderPageFilters() : null}
        </ActionsMenu>

        <Container className="generic-page sales-plans" fluid>
          {loading ? (
            <Loader style={{ height: '500px' }} />
          ) : !adminSalesMetrics || error ? (
            <div>
              {t('Error fetching data.')} {error.message || undefined}
            </div>
          ) : !adminSalesMetrics.length ? (
            <div>{t('There are no data for the selected period.')}</div>
          ) : (
            this.renderContent()
          )}
        </Container>
      </DashboardTemplate>
    );
  }
}

const mapStateToProps = state => ({
  salesMetrics: state.salesMetrics,
  isCfo: state.user.isCfo,
});

const metricsGoals = gql`
  query salesMetrics_adminSalesMetricsGoals {
    adminSalesMetricsGoals {
      id
      date
      metric
      value
      note
    }
  }
`;

const adminSalesManagers = gql`
  query salesMetrics_adminSalesManagers {
    adminSalesManagers {
      id
      name
      active
    }
  }
`;

const metricsQuery = gql`
  query salesMetrics_adminSalesMetrics(
    $interval: String!
    $startDate: String!
    $endDate: String!
    $compareStartDate: String
    $compareEndDate: String
    $salesManagerId: ID
  ) {
    adminSalesMetrics(
      interval: $interval
      startDate: $startDate
      endDate: $endDate
      compareStartDate: $compareStartDate
      compareEndDate: $compareEndDate
      salesManagerId: $salesManagerId
    ) {
      startDate
      endDate
      customers {
        count
        trials
        freePlans
        cancellations
        churnRate
        ltv
        unconfirmedConvertedRate
        unconfirmedConverted
        trialConvertedRate
        trialConverted
      }
      metricsChurn {
        organization {
          id
          name
          dateAdded
        }
        mrr
        beforeMrr
        netCashFlow
      }
      metricsNew {
        organization {
          id
          name
          dateAdded
        }
        mrr
        beforeMrr
        netCashFlow
      }
      metricsExpansion {
        organization {
          id
          name
          dateAdded
        }
        mrr
        beforeMrr
        netCashFlow
      }
      metricsReactivation {
        organization {
          id
          name
          dateAdded
        }
        mrr
        beforeMrr
        netCashFlow
      }
      metricsContraction {
        organization {
          id
          name
          dateAdded
        }
        mrr
        beforeMrr
        netCashFlow
      }
      metricsCancellations {
        organization {
          id
          name
          dateAdded
        }
        mrr
        beforeMrr
        netCashFlow
      }
      asp
      arpa
      quickRatio
      netCashFlow
      plans {
        keywords
        category
        mrr
        count
      }
      companyTypes {
        type
        mrr
        count
      }
      countries {
        country
        mrr
        count
      }
      nps
      mrr {
        netChurnRate
        grossChurnRate
        total {
          amount
        }
        recurring {
          amount
        }
        affiliate {
          amount
        }
        new {
          amount
        }
        expansion {
          amount
        }
        reactivation {
          amount
        }
        contraction {
          amount
        }
        churn {
          amount
        }
        net {
          amount
        }
      }
    }
  }
`;

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    {
      setMetricsRange,
      setMetricsInterval,
      setActiveMetricsRR,
      showModal,
      setMetricsManager,
      setActiveMetricsPlan,
    },
  ),
  graphql(adminSalesManagers, { name: 'adminSalesManagersData' }),
  graphql(metricsGoals, {
    name: 'adminSalesMetricsGoalsData',
    options: ({ salesMetrics: { manager } }) => ({
      fetchPolicy: 'network-only',
      variables: {
        salesManagerId: manager ? manager.id : undefined,
      },
    }),
  }),
  graphql(metricsQuery, {
    name: 'adminSalesMetricsData',
    options: ({ salesMetrics }) => {
      const { metricsRange, interval, manager } = salesMetrics;

      return {
        fetchPolicy: 'network-only',
        variables: {
          interval: interval.toLowerCase(),
          startDate: formatDate(metricsRange.from),
          endDate: formatDate(metricsRange.to),
          compareStartDate: null, // formatDate(metricsRange.compareFrom),
          compareEndDate: null, // formatDate(metricsRange.compareTo),
          salesManagerId: manager ? manager.id : undefined,
        },
      };
    },
  }),
)(SalesMetrics);
