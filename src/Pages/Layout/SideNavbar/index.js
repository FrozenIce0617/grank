// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { t } from 'Utilities/i18n/index';

import { Link } from 'react-router-dom';

import AccurankerIcon from 'icons/logo-brand.svg';
import DashboardIcon from 'icons/main-menu/desktop.svg?inline';
import GroupsIcon from 'icons/main-menu/groups.svg?inline';
import DomainsIcon from 'icons/main-menu/domains.svg?inline';
import ReportsIcon from 'icons/main-menu/report.svg?inline';
import AccountIcon from 'icons/main-menu/settings.svg?inline';
import SalesIcon from 'icons/main-menu/sales.svg?inline';
import IntegrationsIcon from 'icons/menu/connected-accounts.svg?inline';
import LinkedAccountsIcon from 'icons/main-menu/linked-accounts.svg?inline';
import BlackFridayImage from 'icons/black-friday-vertical.png';
import cn from 'classnames';

import './side-navbar.scss';

type Props = {
  user: Object,
  match: Object,
};

class SideNavbar extends Component<Props> {
  isNavigationItemActive = item => {
    const { match } = this.props;
    return item.forPages.indexOf(match.path) !== -1;
  };

  getNavigationItems = () => {
    const { user } = this.props;

    const items = [
      {
        key: 'home',
        label: t('Dashboard'),
        link: '/',
        icon: DashboardIcon,
        forPages: ['/:filter?'],
      },
      {
        key: 'groups',
        label: t('Groups'),
        link: '/groups',
        icon: GroupsIcon,
        forPages: ['/groups/:filter?'],
      },
      {
        key: 'domains',
        label: t('Domains'),
        link: '/domains',
        icon: DomainsIcon,
        forPages: [
          '/domains/:filter?',
          '/domains/paused',
          '/keyword/:filter?',
          '/keywords/list/:filter?',
          '/keywords/overview/:filter?',
          '/keywords/competitors/:filter?',
          '/keywords/rankings/:filter?',
          '/keywords/landing-pages/:filter?',
          '/keywords/tags/:filter?',
          '/keywords/import/gsc/:filter?',
          '/notes/:filter?',
        ],
      },
      {
        key: 'reporting',
        label: t('Reporting'),
        link: '/reports/scheduled',
        icon: ReportsIcon,
        forPages: [
          '/reports/generated',
          '/reports/scheduled',
          '/reports/schedule',
          '/reports/templates',
          '/reports/templates/clone/:id',
          '/reports/templates/edit/:id',
        ],
      },
    ];

    items.push({
      key: 'sub-accounts',
      label: t('Sub-Accounts'),
      link: '/accounts',
      icon: LinkedAccountsIcon,
      forPages: ['/accounts', '/accounts/requests', '/accounts/domains'],
    });

    if (user.isOrgAdmin) {
      items.push({
        key: 'account',
        label: t('Account'),
        link: '/account',
        icon: AccountIcon,
        forPages: [
          '/account',
          '/account/users/:filter?',
          '/account/users/invite',
          '/account/users/edit/:id',
          '/account/external-access',
          '/account/billing',
          '/billing/paymentinfo',
          '/billing/paymentmethod',
          '/account/referral',
          '/account/connected',
          '/account/wallet',
        ],
      });
    }

    items.push({
      key: 'integrations',
      label: t('Integrations'),
      link: '/integrations',
      icon: IntegrationsIcon,
      forPages: ['/integrations', '/integrations/api', '/import/bulk'],
    });

    if (user.salesManager) {
      items.push({
        key: 'sales',
        label: t('Sales'),
        link: '/sales/search',
        icon: SalesIcon,
        forPages: [
          '/sales/search',
          '/sales/plans',
          '/sales/organization/:id',
          '/sales/plans/create',
          '/sales/metrics',
          '/sales/customers',
          '/sales/mails',
          '/sales/dashboard',
          '/sales/tools',
          '/sales/affiliate',
        ],
      });
    }
    return items;
  };

  renderNavigationItem(item) {
    return (
      <Link
        className={cn('item', {
          active: this.isNavigationItemActive(item),
        })}
        to={item.link}
        key={item.key}
      >
        <div className="ico">
          <item.icon />
        </div>
        <span>{item.label}</span>
      </Link>
    );
  }

  render() {
    const isBlackFriday =
      new Date() >= new Date('2018-11-09') &&
      new Date() < new Date('2018-11-27') &&
      this.props.user.organization.activePlan &&
      this.props.user.organization.activePlan.originPlan &&
      !this.props.user.organization.activePlan.isTrial &&
      [
        'da6de4cd-89f3-45bc-b42f-5fa2e3fbdc87',
        'e539981c-ccf9-44a2-86df-7014bef09197',
        'a5beefbb-7140-404c-b6b4-e37ba11d3084',
        'f0ab02d5-9d5f-48d1-87b5-4845159f0760',
        '66a961bb-db7d-4a45-a359-edd9e4186529',
        '33c42b0c-b316-4990-8d54-6dd954f7e4be',
        '5c5dbb84-e529-48dc-83c8-67e2b49bf70f',
        '96cda3c3-c9ad-44cc-b468-8dc6518fee73',
      ].includes(this.props.user.organization.activePlan.originPlan.id) &&
      new Date(this.props.user.organization.dateAdded) < new Date('2018-11-09');

    return (
      <div className="side-navbar">
        <Link to={'/'}>
          <img className="logo" src={AccurankerIcon} alt={'Accuranker dashboard'} />
        </Link>
        {this.getNavigationItems().map(item => this.renderNavigationItem(item))}
        <a className={'item'} href={'https://www.accuranker.com/grump/'} target="blank">
          <div className="ico">
            <img
              src={'https://www.accuranker.com/webservices/grump/tiger.png'}
              className={'grumpy'}
              alt={'Grumpy'}
            />
          </div>
        </a>
        {isBlackFriday && (
          <a className={'item full'} href={'/app/black-friday'} target="blank">
            <img src={BlackFridayImage} />
          </a>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});

export default withRouter(
  connect(
    mapStateToProps,
    null,
  )(SideNavbar),
);
