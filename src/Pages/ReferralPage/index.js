// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Row, Col, Table } from 'reactstrap';
import { Container } from 'reactstrap';
import { Link } from 'react-router-dom';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import FormatNumber from 'Components/FormatNumber';

import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import SkeletonTableCell from 'Components/Skeleton/TableCell';
import LabelWithHelp from 'Components/LabelWithHelp';

import underdash from 'Utilities/underdash';
import { t } from 'Utilities/i18n';

import './referral-page.scss';

type Props = {
  referralStats: Object,
};

class ReferralPage extends Component<Props> {
  renderShareYourLink = () => this.renderShareYourLinkContent();

  renderShareYourLinkContent = () => {
    if (underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })) {
      return this.renderShareYourLinkSkeleton();
    }

    const {
      referralStats: {
        user: {
          organization: {
            affiliate: { signupBonus, refCode, payout, minimumUsage },
          },
        },
      },
    } = this.props;
    const url = `https://www.accuranker.com/?ref_code=${refCode}`;
    const twitterText = t(
      'Easily track your rankings with @AccuRanker in 55 seconds. Sign up using my link and receive $%s in credit: ',
      signupBonus,
    );

    return (
      <div>
        <p>
          {t(
            "Everyone you refer gets $%s in credit. Once they've spent $%s with us, you'll get $%s. There is no limit to the amount of credit you can earn through referrals.",
            signupBonus,
            minimumUsage,
            payout,
          )}
        </p>
        <p>
          <strong>{t('Your Referral Link')}</strong>
          <br />
          {t('Copy your personal referral link and share it with your friends and followers.')}
          <br />
          <a href={url}>{url}</a>
        </p>

        <a
          target="_blank"
          rel="noreferrer noopener"
          className="btn btn-brand-orange btn-large btn-block"
          href={`http://twitter.com/share?text=${twitterText}&url=${url}`}
        >
          {t('Share via Twitter')}
        </a>
      </div>
    );
  };

  renderShareYourLinkSkeleton = () => (
    <Skeleton
      linesConfig={[
        { type: 'text', options: { width: '100%' } },
        { type: 'text', options: { width: '100%' } },
        { type: 'title', options: { width: '20%' } },
        { type: 'text', options: { width: '50%' } },
        { type: 'text', options: { width: '70%' } },
        { type: 'button', options: { width: '100%' } },
      ]}
    />
  );

  renderReferralStatsSkeleton = () => (
    <SkeletonTableBody count={5}>
      <Skeleton
        linesConfig={[
          { type: 'title', options: { width: '70%' } },
          { type: 'subtitle', options: { width: '50%' } },
        ]}
      />
      <SkeletonTableCell
        className="skeleton-stats-number-cell"
        skeletonProps={{
          linesConfig: [
            { type: 'text', options: { width: '25%', alignment: 'right', marginBottom: '10px' } },
          ],
        }}
      />
    </SkeletonTableBody>
  );

  renderReferralStatsBody = () => {
    if (underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })) {
      return this.renderReferralStatsSkeleton();
    }

    const affiliate = this.props.referralStats.user.organization.affiliate;

    return (
      <tbody>
        <tr>
          <td>
            <span>{t('Clicks')}</span>
            <br />
            <small>{t('Number of times your link has been clicked.')}</small>
          </td>
          <td className="text-right referral-stats-number">
            <FormatNumber>{affiliate.click}</FormatNumber>
          </td>
        </tr>
        <tr>
          <td>
            <span>{t('Referrals')}</span>
            <br />
            <small>{t('Number of trials created from your link.')}</small>
          </td>
          <td className="text-right referral-stats-number">
            <FormatNumber>{affiliate.referralCount}</FormatNumber>
          </td>
        </tr>
        <tr>
          <td>
            <span>{t('Pending')}</span>
            <br />
            <small>
              {t(
                'Amount you stand to earn when your referrals have spent $%s',
                affiliate.minimumUsage,
              )}
            </small>
          </td>
          <td className="text-right referral-stats-number">
            <FormatNumber currency="usd">{affiliate.pendingCommission}</FormatNumber>
          </td>
        </tr>
        <tr>
          <td>
            <span>{t('Earned')}</span>
            <br />
            <small>{t('Amount that has been applied to your wallet.')}</small>
          </td>
          <td className="text-right referral-stats-number">
            <FormatNumber currency="usd">{this.props.referralStats.earnedCommission}</FormatNumber>
          </td>
        </tr>
        <tr>
          <td>
            <span>{t('Credit')}</span>
            <br />
            <small>
              {t('Your available credit.')}{' '}
              <Link to="/account/wallet">{t('View your credit history here.')}</Link>
            </small>
          </td>
          <td className="text-right referral-stats-number">
            <FormatNumber currency="usd">{affiliate.purseHolding}</FormatNumber>
          </td>
        </tr>
      </tbody>
    );
  };

  renderReferralStats = () => <Table>{this.renderReferralStatsBody()}</Table>;

  renderSignupBonusSkeleton = () => (
    <Skeleton linesConfig={[{ type: 'text', options: { width: '20%' } }]} />
  );

  renderSignupBonus() {
    if (underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })) {
      return this.renderSignupBonusSkeleton();
    }

    const {
      referralStats: {
        user: {
          organization: {
            affiliate: { signupBonus, payout },
          },
        },
      },
    } = this.props;
    return (
      signupBonus != null &&
      payout != null && <LabelWithHelp>{t('Give $%s, Get $%s', signupBonus, payout)}</LabelWithHelp>
    );
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="account_referral" />
        <Container fluid className="referral-page content-container with-side-padding">
          <Row className="content-row" noGutters>
            <Col xs={12} md={6}>
              {this.renderSignupBonus()}
              {this.renderShareYourLink()}
            </Col>
            <Col xs={12} md={6}>
              <LabelWithHelp>{t('Referral Stats')}</LabelWithHelp>
              {this.renderReferralStats()}
            </Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

const referralStatsQuery = gql`
  query referralPage_affiliate {
    user {
      id
      organization {
        id
        affiliate {
          id
          signupBonus
          payout
          payoutType
          refCode
          referralCount
          click
          pendingCommission
          purseHolding
          minimumUsage
          earnedCommission
          wallet {
            id
            amount
            description
            comment
          }
        }
      }
    }
  }
`;

export default compose(graphql(referralStatsQuery, { name: 'referralStats' }))(ReferralPage);
