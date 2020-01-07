// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Table } from 'reactstrap';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import OptionsDropdown from 'Components/Controls/Dropdowns/OptionsDropdown';
import Toast from 'Components/Toast';
import { Container, Row, Col } from 'reactstrap';
import moment from 'moment';
import { isEmpty } from 'lodash';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { DOMAINS_PAUSED } from 'Pages/Layout/ActionsMenu';

import Skeleton from 'Components/Skeleton';
import PaginationOptionsBase from 'Components/PaginationOptions';
import StickyContainerBase from 'Components/Sticky/Container';
import FormattedDomainCell from 'Components/Table/TableRow/FormattedDomainCell';
import SortableHeaderBase from 'Components/Table/SortableHeader';

import { showModal } from 'Actions/ModalAction';

import { t } from 'Utilities/i18n/index';
import { graphqlLoading, graphqlError } from 'Utilities/underdash';
import TableEmptyState from 'Components/TableEmptyState';
import { withTable, withProps, offlineFilter } from 'Components/HOC';
import Sticky from 'Components/Sticky';
import cn from 'classnames';
import { TableIDs } from 'Types/Table';
import { StickyIDs } from 'Types/Sticky';

import SkeletonTableBody from 'Components/Skeleton/TableBody';
import SkeletonTableCell from 'Components/Skeleton/TableCell';

import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';

import UnpauseIcon from 'icons/play.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';

import './paused-domains.scss';

type Props = {
  data: Object,
  prepareData: Function,
  showModal: Function,
  deleteDomainMutation: Function,
  updateDomain: Function,
};

const tableName = TableIDs.PAUSED_DOMAINS;
const PaginationOptions = withProps({ tableName })(PaginationOptionsBase);
const StickyContainer = withProps({ name: tableName })(StickyContainerBase);
const SortableHeader = withProps({ tableName })(SortableHeaderBase);

class PausedDomainsPage extends Component<Props> {
  _subHandle: SubscriptionHandle;

  componentDidMount() {
    this._subHandle = subscribeToDomain(this.props.data.refetch);
  }

  componentWillUnmount() {
    this._subHandle.unsubscribe();
  }

  getDropdownOptions = domain => [
    {
      onSelect: () => this.handleUnpauseDomain(domain),
      label: t('Unpause'),
      icon: <UnpauseIcon />,
    },
    {
      onSelect: () => this.showDeleteConfirmation(domain),
      label: t('Delete'),
      icon: <DeleteIcon />,
    },
  ];

  getRows() {
    if (graphqlLoading({ ...this.props }) || graphqlError({ ...this.props })) {
      return [];
    }
    return this.props.prepareData(this.props.data.pausedDomainsList);
  }

  handleUnpauseDomain = domain =>
    this.props
      .updateDomain({
        variables: {
          input: {
            id: domain.id,
            domain: domain.domain,
            displayName: domain.displayName || '',
            includeSubdomains: domain.includeSubdomains,
            exactMatch: domain.exactMatch,
            shareOfVoicePercentage: domain.shareOfVoicePercentage,
            defaultLocation: domain.defaultLocation || '',
            defaultCountrylocale: domain.defaultCountrylocale.id,
            googleBusinessName: domain.googleBusinessName || '',
            client: domain.client.id,
            paused: false,
          },
        },
      })
      .then(({ data: { updateDomain: { errors } } }) => {
        if (!isEmpty(errors)) {
          throwSubmitErrors(errors);
        } else {
          Toast.success(t('Domain unpaused'));
        }
      }, throwNetworkError)
      .catch(error => {
        if (error.errors && error.errors.paused) {
          Toast.error(error.errors.paused);
        } else {
          Toast.error('Something went wrong');
        }
        throw error;
      });

  handleDeleteDomain = domainObj => {
    const { id } = domainObj;
    this.props
      .deleteDomainMutation({
        variables: {
          input: {
            id,
          },
        },
      })
      .then(({ data: { deleteDomain: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Could not delete domain'));
          return;
        }
        Toast.success(t('Domain deleted'));
        this.props.data.refetch();
      });
  };

  showDeleteConfirmation = domainObj => {
    const { domain, displayName } = domainObj;
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: t('Delete Domain?'),
        description: t(
          'The domain "%s" and all its keywords will be permanently deleted.',
          displayName || domain,
        ),
        confirmLabel: t('Delete domain'),
        action: () => this.handleDeleteDomain(domainObj),
      },
    });
  };

  renderHead = () => (
    <Sticky
      containerName={StickyIDs.containers.PAUSED_DOMAINS}
      name={StickyIDs.items.TABLE_HEADER}
      stickToTopContainer={StickyIDs.containers.DASHBOARD}
      stickToTopItem={StickyIDs.items.HEADER}
      showPlaceholder
      tag="thead"
    >
      {({ isSticky, style, getRef }) => (
        <tr className={cn({ sticky: isSticky })} ref={getRef} style={style}>
          <SortableHeader column="domain">{t('Domain Name')}</SortableHeader>
          <SortableHeader column="client.name">{t('Belongs to Group')}</SortableHeader>
          <SortableHeader column="totalKeywords">{t('Keywords')}</SortableHeader>
          <SortableHeader column="dateAdded">{t('Created At')}</SortableHeader>
          <SortableHeader column="pausedChangeDate">{t('Paused At')}</SortableHeader>
          <th />
        </tr>
      )}
    </Sticky>
  );

  renderBody() {
    if (graphqlError({ ...this.props }) || graphqlLoading({ ...this.props })) {
      return this.renderSkeleton();
    }
    return (
      <StickyContainer tag="tbody">
        {this.getRows().map(domain => (
          <tr key={domain.id}>
            <td className="domains-cell">
              <FormattedDomainCell
                domain={domain.domain}
                displayName={domain.displayName}
                faviconUrl={domain.faviconUrl}
              />
            </td>
            <td>{domain.client.name}</td>
            <td>{domain.totalKeywords}</td>
            <td>{domain.dateAdded}</td>
            <td>{moment(domain.pausedChangeDate).format('YYYY-MM-DD')}</td>
            <td className="text-right">
              <OptionsDropdown items={this.getDropdownOptions(domain)} />
            </td>
          </tr>
        ))}
      </StickyContainer>
    );
  }

  renderSkeleton() {
    return (
      <SkeletonTableBody>
        <SkeletonTableCell
          className="domains-cell"
          skeletonProps={{
            linesConfig: [{ type: 'text', options: { width: '100%', marginBottom: '10px' } }],
          }}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '10%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '10%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '10%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '10%', marginBottom: '10px' } }]}
        />
        <SkeletonTableCell
          className="hidden-sm-down"
          skeletonProps={{
            linesConfig: [
              {
                type: 'icon-sm',
                options: { width: '30px', marginBottom: '10px', alignment: 'right' },
              },
            ],
          }}
        />
      </SkeletonTableBody>
    );
  }

  renderPagination() {
    const { data } = this.props;
    let totalRows = 0;
    if (
      !graphqlError({ ...this.props }) &&
      !(graphqlLoading({ ...this.props }) && !data.pausedDomainsList)
    ) {
      totalRows = data.pausedDomainsList.length;
    }
    return <PaginationOptions totalRows={totalRows} />;
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={DOMAINS_PAUSED} />
        <Container fluid className="paused-domains-table-wrapper content-container">
          <Row noGutters>
            <Col>
              <Table className="data-table table table-hover">
                {this.renderHead()}
                {this.renderBody()}
              </Table>
              {!graphqlError({ ...this.props }) &&
                !graphqlLoading({ ...this.props }) && (
                  <TableEmptyState
                    list={this.getRows()}
                    title={t('No Data')}
                    subTitle={t('There are currently no paused domains')}
                  />
                )}
            </Col>
          </Row>
        </Container>
        {this.renderPagination()}
      </DashboardTemplate>
    );
  }
}

const deleteDomainMutation = gql`
  mutation pausedDomainsPage_deleteDomain($input: DeleteDomainInput!) {
    deleteDomain(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const pausedDomainsQuery = gql`
  query pausedDomainsPage_pausedDomains {
    pausedDomainsList {
      id
      domain
      displayName
      faviconUrl
      totalKeywords
      dateAdded
      pausedChangeDate
      client {
        name
      }
      includeSubdomains
      shareOfVoicePercentage
      exactMatch
      defaultCountrylocale {
        id
      }
      client {
        id
      }
      defaultLocation
      googleBusinessName
    }
  }
`;

const updateDomain = gql`
  mutation pausedDomainsPage_updateDomain($input: UpdateDomainInput!) {
    updateDomain(input: $input) {
      domain {
        id
      }
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  withTable(tableName),
  offlineFilter(tableName),
  connect(
    null,
    { showModal },
  ),
  graphql(updateDomain, { name: 'updateDomain' }),
  graphql(pausedDomainsQuery),
  graphql(deleteDomainMutation, { name: 'deleteDomainMutation' }),
)(PausedDomainsPage);
