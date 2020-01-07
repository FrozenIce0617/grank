// @flow
import React, { Component } from 'react';
import { withApollo, compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import elementsMap from './Elements';
import underdash from 'Utilities/underdash';
import moment from 'moment';
import { t } from 'Utilities/i18n';
import './report-page.scss';
import cookie from 'react-cookies';
import { uniqueId } from 'lodash';

/*
THIS IS ONLY USED FOR INTERNAL USAGE
*/

type Props = {
  scheduledReportData: Object,
};

class Report extends Component<Props> {
  elementsToLoad: number = 0;

  getFilters() {
    const {
      scheduledReportData: { scheduledReport },
    } = this.props;
    /*
    If scheduledReport.isOneTimeReport then use the filters (as they will
    have the required filters) otherwise we generate the required filters as they will not be in it.

    Domains filter is never present.
    */
    let filters = [];

    // if a group report, then use all the domains from that group / client
    let domainIds = [];
    if (scheduledReport.isGroupReport) {
      scheduledReport.group.domains.forEach(domain => {
        domainIds.push(domain.id);
      });
    } else {
      domainIds = [scheduledReport.domain.id];
    }

    const domainsFilter = {
      attribute: 'domains',
      type: 'list',
      comparison: 'contains',
      value: `[${domainIds.toString()}]`,
    };

    // Set "latest" as current date as charts doesn't recognize that filter value
    const scheduledFilters = JSON.parse(scheduledReport.reportFilter.filters).map(filter => {
      if (filter.attribute === 'period') {
        const parts = JSON.parse(filter.value);
        return {
          ...filter,
          value: JSON.stringify([
            parts[0],
            parts[1] !== 'latest' ? parts[1] : moment({}).format('YYYY-MM-DD'),
          ]),
        };
      }
      return filter;
    });

    if (!scheduledReport.isOneTimeReport) {
      const today = new Date(); // TODO remove the string date
      let periodFrom = moment(today);

      switch (scheduledReport.schedule) {
        case 'A_1': // daily
          periodFrom = periodFrom.subtract(1, 'days');
          break;

        case 'A_2': // weekly
          periodFrom = periodFrom.subtract(7, 'days');
          break;

        case 'A_3': // monthly
          periodFrom = periodFrom.subtract(1, 'months');
          break;

        default:
      }

      periodFrom = periodFrom.format('YYYY-MM-DD');
      const periodTo = moment(today).format('YYYY-MM-DD');

      const periodFilter = {
        attribute: 'period',
        type: 'datetime',
        comparison: 'between',
        value: `["${periodFrom}", "${periodTo}"]`,
      };

      const compareToFilter = {
        attribute: 'compare_to',
        type: 'datetime',
        comparison: 'eq',
        value: periodFrom,
      };

      filters = [periodFilter, compareToFilter, domainsFilter, ...scheduledFilters];
    } else {
      filters = [domainsFilter, ...scheduledFilters];
    }
    return filters;
  }

  isLoading() {
    return underdash.graphqlLoading({ ...this.props });
  }

  handleLoadWidget = s => {
    this.elementsToLoad--;
    if (this.elementsToLoad === 0) {
      // eslint-disable-next-line
      console.log('ACCURANKER_LOADED_TIME_TO_SMILE'); // THIS SHOULD NOT BE DELETED!!! ITS USED FOR puppeteer TO KNOW WHEN PAGE IS RDDY
    } else {
      const time = new Date().toLocaleString();
      // eslint-disable-next-line
      console.log(`[${time}] Loaded ${s}`);
    }
  };

  renderTemplateElement(templateElement, filters) {
    const {
      scheduledReportData: {
        scheduledReport: { group, domain, isGroupReport },
      },
    } = this.props;
    const WidgetRenderer = elementsMap[templateElement.type];
    if (WidgetRenderer) {
      return (
        <WidgetRenderer
          key={uniqueId(templateElement.type)}
          filters={filters}
          settings={templateElement.settings}
          group={group}
          domain={domain}
          isGroupReport={isGroupReport}
          onLoad={() => this.handleLoadWidget(templateElement.type)}
        />
      );
    }
    this.handleLoadWidget();
    return (
      <p key={uniqueId(templateElement.type)}>
        {t('Type: %s is not implemented, yet...', templateElement.type)}
      </p>
    );
  }

  renderTemplateElements(templateElements, filters) {
    const elements = [];

    templateElements.forEach(templateElement => {
      elements.push(this.renderTemplateElement(templateElement, filters));
    });

    return <div className="report-page">{elements}</div>;
  }

  render() {
    // have we fetched all the date we need?
    if (this.isLoading()) {
      return <div>{t('Loading')}</div>;
    }

    const {
      scheduledReportData: { scheduledReport },
    } = this.props;
    const templateElements = JSON.parse(scheduledReport.reportTemplate.template);
    this.elementsToLoad = templateElements.length;
    const filters = this.getFilters();
    return this.renderTemplateElements(templateElements, filters);
  }
}

const scheduledReportQuery = gql`
  query report_scheduledReport($id: ID!) {
    scheduledReport(id: $id) {
      id
      schedule
      isGroupReport
      isOneTimeReport
      domain {
        id
      }
      group {
        id
        domains {
          id
        }
      }
      reportFilter {
        id
        filters
      }
      reportTemplate {
        id
        template
      }
    }
  }
`;

export default withApollo(
  compose(
    graphql(scheduledReportQuery, {
      name: 'scheduledReportData',
      options: props => ({
        variables: {
          id: props.match.params.scheduledReportId,
        },
      }),
    }),
  )(Report),
);
