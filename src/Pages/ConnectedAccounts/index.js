// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Table, Row, Col } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { groupBy, isEmpty, transform } from 'lodash';
import moment from 'moment';

import { showModal } from 'Actions/ModalAction';
import { gaToggleRefetch, gaSetFromCallback } from 'Actions/GoogleAccountsAction';
import Toast from 'Components/Toast';
import OptionsDropdown from 'Components/Controls/Dropdowns/OptionsDropdown';
import ActionsMenu, { ACCOUNT_CONNECTED_ACCOUNTS } from 'Pages/Layout/ActionsMenu';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import StickyContainer from 'Components/Sticky/Container';
import Sticky from 'Components/Sticky';
import cn from 'classnames';
import { StickyIDs } from 'Types/Sticky';

import { t } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';
import TableEmptyState from 'Components/TableEmptyState';

import EditIcon from 'icons/edit.svg?inline';
import DeleteIcon from 'icons/remove.svg?inline';

import { Integrations } from 'Types/Integration';

type Account = {
  id: string,
  type: string,
  description: string,
  createdAt: string,
  createdBy: string,
};

type Group = { [id: string]: number };

type Props = {
  accountsData: Object,
  accounts: Account[],
  gaGroup: Group,
  gscGroup: Group,
  adobeGroup: Group,
  removeAdobeAccess: Function,
  removeGoogleAccess: Function,
  showModal: Function,
  shouldRefetch: boolean,
  fromCallback: boolean,
  gaToggleRefetch: Function,
  gaSetFromCallback: Function,
};

const ADOBE_ACCOUNT = Integrations.ADOBE.name;
const GOOGLE_ACCOUNT = Integrations.GOOGLE_ACCOUNT.name;

class ConnectedAccounts extends Component<Props> {
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.shouldRefetch && !this.props.shouldRefetch) {
      this.props.gaToggleRefetch();
      this.props.gaSetFromCallback(false);
    }
  }

  onRemoveClick = (id, type) => {
    const input = {
      id,
      description: '~~DELETED~~',
      delete: true,
    };

    const { removeAdobeAccess, removeGoogleAccess } = this.props;
    const actionCb = errors => {
      if (!isEmpty(errors)) {
        Toast.error(t('Unable to remove account'));
      } else {
        Toast.success(t('Account removed'));
        this.props.accountsData.refetch();
      }
    };

    if (type === ADOBE_ACCOUNT) {
      removeAdobeAccess({ variables: { input } }).then(
        ({
          data: {
            updateAdobeMarketingConnection: { errors },
          },
        }) => actionCb(errors),
      );
    } else {
      removeGoogleAccess({ variables: { input } }).then(
        ({
          data: {
            updateGoogleConnection: { errors },
          },
        }) => actionCb(errors),
      );
    }
  };

  getDropdownOptions = account => [
    {
      onSelect: () => this.handleEdit(account),
      label: t('Rename'),
      icon: <EditIcon />,
    },
    {
      onSelect: () => this.handleDelete(account),
      label: t('Delete'),
      icon: <DeleteIcon />,
    },
  ];

  handleAdd = () => {
    this.props.showModal({
      modalType: 'AddAccount',
      modalTheme: 'light',
      modalProps: {
        refresh: this.props.accountsData.refetch,
      },
    });
  };

  handleEdit = (account: Object) => {
    this.props.showModal({
      modalType: account.type === ADOBE_ACCOUNT ? 'EditAdobeAccount' : 'EditAccount',
      modalTheme: 'light',
      modalProps: {
        accountName: account.type,
        accountId: account.id,
        refresh: this.props.accountsData.refetch,
      },
    });
  };

  handleDelete = (account: Object) => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        cancelLabel: t('Cancel'),
        confirmLabel: t('Delete account'),
        lockDuration: 0,
        title: t('Delete Connected Account?'),
        description: t('Any domain using this account will be disconnected as well.'),
        action: () => this.onRemoveClick(account.id, account.type),
      },
    });
  };

  isReady = () =>
    !underdash.graphqlError({ ...this.props }) &&
    !underdash.graphqlLoading({ ...this.props }) &&
    !(this.props.fromCallback && !this.props.shouldRefetch);

  renderGroup = (account, type, group): number | string =>
    account.type === type ? (group[account.id] && group[account.id].length) || 0 : '-';

  renderBody() {
    if (!this.isReady()) {
      return this.renderSkeleton();
    }

    const { accounts, gaGroup, gscGroup, adobeGroup } = this.props;
    return (
      <StickyContainer name={StickyIDs.containers.CONNECTED_ACCOUNTS} tag="tbody">
        {accounts.map(account => (
          <tr key={account.id}>
            <td>{account.description}</td>
            <td>{account.type}</td>
            <td>{account.createdBy}</td>
            <td>{moment(account.createdAt).format('lll')}</td>
            <td>{this.renderGroup(account, ADOBE_ACCOUNT, adobeGroup)}</td>
            <td>{this.renderGroup(account, GOOGLE_ACCOUNT, gaGroup)}</td>
            <td>{this.renderGroup(account, GOOGLE_ACCOUNT, gscGroup)}</td>
            <td className="text-right">
              <OptionsDropdown items={this.getDropdownOptions(account)} />
            </td>
          </tr>
        ))}
      </StickyContainer>
    );
  }

  renderHead = () => (
    <Sticky
      containerName={StickyIDs.containers.CONNECTED_ACCOUNTS}
      name={StickyIDs.items.TABLE_HEADER}
      stickToTopContainer={StickyIDs.containers.DASHBOARD}
      stickToTopItem={StickyIDs.items.HEADER}
      showPlaceholder
      tag="thead"
    >
      {({ isSticky, style, getRef }) => (
        <tr className={cn({ sticky: isSticky })} ref={getRef} style={style}>
          <th>{t('Description')}</th>
          <th>{t('Type')}</th>
          <th>{t('Added By')}</th>
          <th>{t('Linked At')}</th>
          <th>{t('Times Used for Adobe Marketing')}</th>
          <th>{t('Times Used for Google Analytics')}</th>
          <th>{t('Times Used for Google Search Console')}</th>
          <th />
        </tr>
      )}
    </Sticky>
  );

  renderSkeleton() {
    return (
      <SkeletonTableBody>
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '80%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '55%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '40%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '25%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '25%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '25%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '25%', marginBottom: '10px' } }]}
        />
      </SkeletonTableBody>
    );
  }

  render() {
    const { accounts } = this.props;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={ACCOUNT_CONNECTED_ACCOUNTS}>
          <Actions.AddAction onClick={this.handleAdd} label={t('Connect integration')} />
        </ActionsMenu>
        <Container fluid className="content-container">
          <Row>
            <Col>
              <Table hover className="data-table">
                {this.renderHead()}
                {this.renderBody()}
              </Table>
              {this.isReady() && (
                <TableEmptyState list={accounts} title={t('No Connected Integrations')} />
              )}
            </Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

const accountsQuery = gql`
  query connectedAccounts_accounts {
    user {
      id
      organization {
        id
        googleConnections {
          id
          description
          createdAt
          createdBy
          type
        }
        adobeMarketingConnections {
          id
          description
          createdAt
          createdBy
        }
      }
    }
    domainsList {
      id
      googleOauthConnectionGa {
        id
      }
      googleOauthConnectionGsc {
        id
      }
      adobeMarketingConnection {
        id
      }
    }
  }
`;

const removeGoogleAccessQuery = gql`
  mutation connectedAccounts_updateGoogleConnection($input: UpdateGoogleConnectionInput!) {
    updateGoogleConnection(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const removeAdobeAccessQuery = gql`
  mutation connectedAccounts_updateAdobeMarketingConnection(
    $input: UpdateAdobeMarketingConnectionInput!
  ) {
    updateAdobeMarketingConnection(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  connect(
    ({ googleAccounts }) => googleAccounts,
    {
      showModal,
      gaToggleRefetch,
      gaSetFromCallback,
    },
  ),
  graphql(accountsQuery, {
    // options: { fetchPolicy: 'network-only' },
    props: ({ data, data: { loading, error } }) => {
      if (loading || error) {
        return {
          accountsData: data,
          loading,
          error,
        };
      }

      const {
        user: {
          organization: { googleConnections, adobeMarketingConnections },
        },
        domainsList,
      } = data;
      const gaGroup = groupBy(domainsList, 'googleOauthConnectionGa.id');
      const gscGroup = groupBy(domainsList, 'googleOauthConnectionGsc.id');
      const adobeGroup = groupBy(domainsList, 'adobeMarketingConnection.id');

      const integrationsMap = transform(
        Integrations,
        (acc, item) => {
          acc[item.type] = item.name;
          return acc;
        },
        {},
      );

      const accounts = googleConnections
        .map(item => ({ ...item, type: integrationsMap[item.type] }))
        .concat(adobeMarketingConnections.map(item => ({ ...item, type: ADOBE_ACCOUNT })));

      return {
        accountsData: data,
        accounts,
        gaGroup,
        gscGroup,
        adobeGroup,
      };
    },
    skip: props => props.fromCallback && !props.shouldRefetch,
  }),
  graphql(removeGoogleAccessQuery, { name: 'removeGoogleAccess' }),
  graphql(removeAdobeAccessQuery, { name: 'removeAdobeAccess' }),
)(ConnectedAccounts);
