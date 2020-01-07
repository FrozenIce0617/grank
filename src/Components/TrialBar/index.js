//@flow
import React, { Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { tn, t } from 'Utilities/i18n';

import './trial-bar.scss';

type Props = {
  isTrial?: boolean,
  hasNextPlan?: boolean,
  endDate?: string,
};

export default class TrialBar extends Component<Props> {
  render() {
    const { isTrial, endDate, hasNextPlan } = this.props;
    if (!isTrial) return null;
    const now = moment(Date.now());
    const days = moment(endDate).diff(now, 'days') + 1;

    if (hasNextPlan) {
      return (
        <Link to="/billing/package/select" className="trial-bar">
          {tn('Your trial will end in %s day.', 'Your trial will end in %s days.', days)}{' '}
          {t('You will automatically move to a paid plan when your trial ends.')}{' '}
          {t('Click here to manage your subscription.')}
        </Link>
      );
    }

    return (
      <Link to="/billing/package/select" className="trial-bar">
        {tn(
          'Your trial account expires in %s day.',
          'Your trial account expires in %s days.',
          days,
        )}{' '}
        {t('Make sure you upgrade your account to avoid losing your data.')}{' '}
        {t('Click here to upgrade now.')}
      </Link>
    );
  }
}
