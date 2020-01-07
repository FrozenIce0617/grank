// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Progress, Row, Col } from 'reactstrap';
import cn from 'classnames';

import underdash from 'Utilities/underdash';
import { t } from 'Utilities/i18n';

import './account-usage.scss';

type Props = {
  className: string,
  accountUsage: Object,
};

class AccountUsage extends Component<Props> {
  render() {
    if (underdash.graphqlLoading({ ...this.props }) || underdash.graphqlError({ ...this.props })) {
      return null;
    }
    const {
      accountUsage: {
        user: {
          organization: {
            numberOfKeywords,
            numberOfUsers,
            numberOfDomains,
            activePlan: { maxUsers, maxKeywords, maxDomains },
          },
        },
      },
      className,
    } = this.props;

    return (
      <div className={cn('account-usage', className)}>
        <Row>
          <Col>
            <small>{t('Keywords')}</small>
          </Col>
          <Col className="text-right">
            <small>{t('%s of %s', numberOfKeywords, maxKeywords)}</small>
          </Col>
        </Row>
        <Row>
          <Col>
            <Progress max={maxKeywords} value={numberOfKeywords} />
          </Col>
        </Row>

        <Row>
          <Col>
            <small>{t('Domains')}</small>
          </Col>
          <Col className="text-right">
            <small>
              {t('%s of %s', numberOfDomains, maxDomains === -1 ? t('Unlimited') : maxDomains)}
            </small>
          </Col>
        </Row>
        <Row>
          <Col>
            <Progress max={maxDomains === -1 ? 9999 : maxDomains} value={numberOfDomains} />
          </Col>
        </Row>

        <Row>
          <Col>
            <small>{t('Users')}</small>
          </Col>
          <Col className="text-right">
            <small>
              {t('%s of %s', numberOfUsers, maxUsers === -1 ? t('Unlimited') : maxUsers)}
            </small>
          </Col>
        </Row>
        <Row>
          <Col>
            <Progress max={maxUsers === -1 ? 9999 : maxUsers} value={numberOfUsers} />
          </Col>
        </Row>
      </div>
    );
  }
}

const accountUsageQuery = gql`
  query accountUsage_user {
    user {
      id
      organization {
        id
        activePlan {
          id
          maxUsers
          maxKeywords
          maxDomains
        }
        numberOfKeywords
        numberOfDomains
        numberOfUsers
      }
    }
  }
`;

export default compose(graphql(accountUsageQuery, { name: 'accountUsage' }))(AccountUsage);
