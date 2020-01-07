// @flow
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import { isEmpty, noop, debounce, isEqual } from 'lodash';
import gql from 'graphql-tag';
import { connect } from 'react-redux';

import SearchDropdownList from 'Components/Controls/Dropdowns/SearchDropdownList';
import { t } from 'Utilities/i18n/index';
import Skeleton from 'Components/Skeleton';
import { graphqlError, graphqlLoading } from 'Utilities/underdash';
import { FilterAttribute } from 'Types/Filter';
import type { DomainsFilter } from 'Types/Filter';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { linkToPageWithDomains } from 'Components/Filters/LinkToDomain';
import { showModal } from 'Actions/ModalAction';
import Toast from 'Components/Toast';
import DomainItem from 'Components/DomainItem';
import { subscribeToDomain, subscribeToGroup } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import { updateTitleTag } from 'Utilities/titleTag';

type Props = {
  data: any,
  history: Object,
  domainsFilter: DomainsFilter,
  showModal: Function,
  match: Object,
  deleteDomainMutation: Function,
  deleteClientMutation: Function,
};

const buildGroups = (clients = []) =>
  clients.map(client => {
    const domainsIds = client.domains.reduce((domainIds, { id }) => [...domainIds, id], []);
    return {
      ...client,
      domainsIds,
    };
  });

class GroupsAndDomains extends Component<Props> {
  _subHandles: SubscriptionHandle[];

  componentDidMount() {
    const { data } = this.props;

    if (data) {
      const { clients } = data;

      const { selectedGroupItem, selectedDomainItem } = this.getSelectedItems(buildGroups(clients));
      if (selectedDomainItem) {
        updateTitleTag({ prefix: selectedDomainItem.domain });
      } else if (selectedGroupItem) {
        updateTitleTag({ prefix: selectedGroupItem.name });
      }
    }

    const cb = debounce(() => this.props.data.refetch(), 1000);
    this._subHandles = [subscribeToDomain(cb), subscribeToGroup(cb)];
  }

  componentDidUpdate(prevProps) {
    const {
      data: { clients: prevClients },
    } = prevProps;
    const {
      selectedGroupItem: prevSelectedGroupItem,
      selectedDomainItem: prevSelectedDomainItem,
    } = this.getSelectedItems(buildGroups(prevClients), prevProps);

    const {
      data: { clients },
    } = this.props;
    const { selectedGroupItem, selectedDomainItem } = this.getSelectedItems(buildGroups(clients));

    const domainChanged =
      selectedDomainItem && !isEqual(prevSelectedDomainItem, selectedDomainItem);
    if (domainChanged) {
      updateTitleTag({ prefix: selectedDomainItem.domain });
    } else {
      const groupChanged = selectedGroupItem && !isEqual(prevSelectedGroupItem, selectedGroupItem);
      if (selectedGroupItem && groupChanged) {
        updateTitleTag({ prefix: selectedGroupItem.name });
      }
    }
  }

  componentWillUnmount() {
    this._subHandles.forEach(handle => handle.unsubscribe());
  }

  getDomainLink = domainObj => this.makeDomainsLink([domainObj.id]);
  getGroupLink = group => !isEmpty(group.domainsIds) && this.makeDomainsLink(group.domainsIds);

  makeDomainsLink = (domainsIds: string[]) => {
    return linkToPageWithDomains('/keywords/overview', domainsIds, KEYWORDS_FILTER_SET, [], true);
  };

  handleSelectGroup = (group: { domainsIds: string[] }) => {
    if (isEmpty(group.domainsIds)) {
      this.openAddDropdownModal();
    }
  };

  openAddDropdownModal = () => {
    this.props.showModal({
      modalType: 'AddDomain',
      modalTheme: 'light',
      modalProps: {
        refresh: this.props.data.refetch,
      },
    });
  };

  handleAddGroup = () => {
    this.props.showModal({
      modalType: 'AddGroup',
      modalTheme: 'light',
      modalProps: {
        refetch: this.props.data.refetch,
      },
    });
  };

  deleteDomain = domainObj => {
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

  deleteGroup = groupObj => {
    const { id, name, organization } = groupObj;
    this.props
      .deleteClientMutation({
        variables: {
          input: {
            id,
            name,
            organization: organization.id,
            delete: true,
          },
        },
      })
      .then(({ data: { updateClient: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error(t('Could not delete group'));
          return;
        }
        Toast.success(t('Group deleted'));
        this.props.data.refetch();
      });
  };

  showDeleteConfirmation = (event, type, action, groupObj) => {
    event.stopPropagation();
    const { name, displayName, domain } = groupObj;
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: type === 'group' ? t('Delete Group?') : t('Delete Domain?'),
        description:
          type === 'group'
            ? t('The group %s and all the domains within it will be permanently deleted.', name)
            : t(
                'The domain %s and all its keywords will be permanently deleted.',
                displayName || domain,
              ),
        cancelLabel: t('Cancel'),
        confirmLabel: type === 'group' ? t('Delete group') : t('Delete domain'),
        action: () => action(groupObj),
      },
    });
  };

  openEditGroupModal = (event: SyntheticEvent<*>, groupObj: Object) => {
    event.stopPropagation();
    this.props.showModal({
      modalType: 'EditGroup',
      modalTheme: 'light',
      modalProps: {
        groupId: groupObj.id,
        refetch: this.props.data.refetch,
        initialValues: {
          groupName: groupObj.name,
        },
      },
    });
  };

  openEditDomainModal = (event: SyntheticEvent<*>, domainObj: Object) => {
    event.stopPropagation();
    this.props.showModal({
      modalType: 'EditDomain',
      modalTheme: 'light',
      modalProps: {
        domainId: domainObj.id,
        refetch: this.props.data.refetch,
      },
    });
  };

  getSelectedItems = (groups, props = this.props) => {
    const selectedGroupItem = this.getSelectedGroupItem(groups, props);
    return {
      selectedGroupItem,
      selectedDomainItem: this.getSelectedDomainItem(selectedGroupItem, props),
    };
  };

  getSelectedGroupItem = (groups, props = this.props) => {
    const { domainsFilter } = props;
    const domainsIds = domainsFilter ? domainsFilter.value : [];

    // Assume that only multiple domains can be selected from one group
    return groups.find(client => client.domainsIds.indexOf(domainsIds[0]) !== -1);
  };

  getSelectedDomainItem = (selectedGroupItem, props = this.props) => {
    const { domainsFilter } = props;
    const domainsIds = domainsFilter ? domainsFilter.value : [];
    const domains = selectedGroupItem ? selectedGroupItem.domains : [];

    return domainsIds.length === 1 ? domains.find(domain => domain.id === domainsIds[0]) : null;
  };

  render() {
    if (graphqlError(this.props) || graphqlLoading(this.props) || !this.props.data.clients) {
      return (
        <Fragment>
          <div className="dropdown-arrow pt-2 pb-2 ml-2">
            <Skeleton linesConfig={[{ type: 'text', options: { width: '80%' } }]} />
          </div>
          <div className="dropdown-arrow pt-2 pb-2 ml-5">
            <Skeleton linesConfig={[{ type: 'text', options: { width: '80%' } }]} />
          </div>
        </Fragment>
      );
    }
    if (graphqlError(this.props)) {
      return <div>{t('No domains found')}</div>;
    }

    const {
      data: { clients },
    } = this.props;
    const groups = buildGroups(clients);

    const { selectedGroupItem, selectedDomainItem } = this.getSelectedItems(groups);
    return (
      <div className="groups-and-domains">
        <SearchDropdownList
          className="hidden-default special-menu"
          placeholder={t('Groups')}
          item={selectedGroupItem}
          items={groups}
          labelFunc={group => group.name}
          linkFunc={this.getGroupLink}
          onSelect={this.handleSelectGroup}
          title={t('Groups')}
          addItemLabel={t('Add new group')}
          onAdd={this.handleAddGroup}
          onEdit={(event: SyntheticEvent<*>, domainObj: Object) =>
            this.openEditGroupModal(event, domainObj)
          }
          onDelete={(event: SyntheticEvent<*>, groupObj: Object) =>
            this.showDeleteConfirmation(event, 'group', this.deleteGroup, groupObj)
          }
        />
        {selectedGroupItem && (
          <SearchDropdownList
            className="hidden-default special-menu"
            placeholder={t('Domains')}
            searchPlaceholder={t('Search for any domain')}
            item={selectedDomainItem}
            items={selectedGroupItem ? selectedGroupItem.domains : []}
            labelFunc={domainObj => <DomainItem {...domainObj} />}
            linkFunc={this.getDomainLink}
            valueFunc={domainObj => `${domainObj.displayName} (${domainObj.domain})`}
            buttonLabelFunc={domainObj => domainObj.displayName || domainObj.domain}
            title={t('Domains in %s', selectedGroupItem.name)}
            addItemLabel={t('Add new domain')}
            onAdd={this.openAddDropdownModal}
            onDelete={(event: SyntheticEvent<*>, domainObj: Object) =>
              this.showDeleteConfirmation(event, 'domain', this.deleteDomain, domainObj)
            }
            onEdit={(event: SyntheticEvent<*>, domainObj: Object) =>
              this.openEditDomainModal(event, domainObj)
            }
            onSelect={noop}
          />
        )}
      </div>
    );
  }
}

const dataQuery = gql`
  query groupsAndDomains_clients {
    clients {
      id
      name
      organization {
        id
      }
      domains {
        id
        domain
        displayName
        faviconUrl
      }
    }
  }
`;

const deleteDomainMutation = gql`
  mutation groupsAndDomains_deleteDomain($input: DeleteDomainInput!) {
    deleteDomain(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const deleteClientMutation = gql`
  mutation groupsAndDomains_updateClient($input: UpdateClientInput!) {
    updateClient(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);
const mapStateToProps = state => ({
  domainsFilter: domainsFilterSelector(state),
});

export default compose(
  withRouter,
  graphql(deleteDomainMutation, { name: 'deleteDomainMutation' }),
  graphql(deleteClientMutation, { name: 'deleteClientMutation' }),
  graphql(dataQuery),
  connect(
    mapStateToProps,
    { showModal },
  ),
)(GroupsAndDomains);
