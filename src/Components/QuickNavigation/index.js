// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Select from 'Components/Controls/Select';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { graphqlError, graphqlLoading } from 'Utilities/underdash';
import DomainItem from 'Components/DomainItem';
import { showModal } from 'Actions/ModalAction';
import { isEmpty, debounce } from 'lodash';
import linkWithFilters from 'Components/Filters/linkWithFilters';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import { FilterAttribute, FilterComparison, FilterValueType } from 'Types/Filter';
import type { DomainsFilter } from 'Types/Filter';
import { getGroupOrDomainLink } from 'Utilities/navigation';
import cn from 'classnames';
import { t } from 'Utilities/i18n';
import { doAnyway } from 'Utilities/promise';

import { subscribeToDomain, subscribeToGroup } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';

import './quick-navigation.scss';
import * as Mousetrap from 'Utilities/mousetrap';

type DomainOption = {
  id: string,
  domain: string,
  displayName: string,
  header?: boolean,
  headerText?: string,
  domainIds?: string[],
  type: string,
};

type Props = {
  history: Object,
  match: Object,
  data: Object,
  showModal: Function,
};

type State = {
  isSilentUpdate: boolean,
};

const DOMAIN_ITEM = 'domain_item';

const ACTION_ADD_DOMAIN = 'add_domain';
const ACTION_ADD_GROUP = 'add_group';

class QuickNavigation extends Component<Props, State> {
  select: any;
  _subHandles: SubscriptionHandle[];

  state = {
    isSilentUpdate: false,
  };

  componentDidMount() {
    const cb = debounce(() => this.handleUpdate(), 1000);
    this._subHandles = [subscribeToDomain(cb), subscribeToGroup(cb)];

    Mousetrap.bind(
      'd',
      'Open quick navigation',
      () => {
        this.select.focus();
      },
      'keyup',
    );
  }

  componentWillUnmount() {
    this._subHandles.forEach(handle => handle.unsubscribe());
    Mousetrap.unbind(['d']);
  }

  handleUpdate = () => {
    this.setState({
      isSilentUpdate: true,
    });
    this.props.data.refetch().then(
      ...doAnyway(() => {
        this.setState({
          isSilentUpdate: false,
        });
      }),
    );
  };

  getGroupsAndDomains = () =>
    !graphqlError(this.props) &&
    ((!graphqlLoading(this.props) && this.props.data.clients) ||
      (graphqlLoading(this.props) && this.state.isSilentUpdate && this.props.data.clients))
      ? this.props.data.clients.reduce((acc, client) => {
          acc.push(
            {
              type: DOMAIN_ITEM,
              key: `group-${client.id}`,
              displayName: client.name,
              headerText: client.name,
              header: true,
              domainIds: client.domains.map(item => item.id),
            },
            ...client.domains.map(item => ({
              ...item,
              type: DOMAIN_ITEM,
              key: `domain-${item.id}`,
            })),
          );
          return acc;
        }, [])
      : [];

  getQuickAddOptions = () => [
    {
      displayName: 'Add domain',
      key: `action-add-domain`,
      type: ACTION_ADD_DOMAIN,
      className: 'quick-navigation-action',
    },
    {
      displayName: 'Add group',
      key: `action-add-group`,
      type: ACTION_ADD_GROUP,
      className: 'quick-navigation-action',
    },
  ];

  getOptions = () => this.getQuickAddOptions().concat(this.getGroupsAndDomains());

  getDomainGroupLink = (domainObj: DomainOption) =>
    this.makeDomainsLink(!domainObj.header ? [domainObj.id] : domainObj.domainIds || []);

  optionsHandlers = {
    [DOMAIN_ITEM]: option => {
      if (option.header && isEmpty(option.domainIds)) {
        this.openAddDomainModal();
        return;
      }

      const { history } = this.props;
      history.push(this.getDomainGroupLink(option));
    },
    [ACTION_ADD_DOMAIN]: () => this.openAddDomainModal(),
    [ACTION_ADD_GROUP]: () => this.openAddGroupModal(),
  };

  makeDomainsLink = (domainsIds: string[]) => {
    const {
      match: { path },
    } = this.props;
    const domainsFilter: DomainsFilter = {
      attribute: FilterAttribute.DOMAINS,
      type: FilterValueType.LIST,
      comparison: FilterComparison.CONTAINS,
      value: domainsIds,
    };
    const urlPath = domainsIds.length > 1 ? '/keywords/overview' : getGroupOrDomainLink(path);
    return linkWithFilters(urlPath, [domainsFilter], KEYWORDS_FILTER_SET, [], true);
  };

  handleChange = option => this.optionsHandlers[option.type](option);

  openAddDomainModal = () => {
    this.props.showModal({
      modalType: 'AddDomain',
      modalTheme: 'light',
      modalProps: {
        refresh: this.props.data.refetch,
      },
    });
  };

  openAddGroupModal = () => {
    this.props.showModal({
      modalType: 'AddGroup',
      modalTheme: 'light',
      modalProps: {
        refresh: this.props.data.refetch,
      },
    });
  };

  filterOptions = (options, filterString) => {
    const pattern = filterString.toLowerCase();
    return options
      .filter(
        // filter domains first
        option =>
          option.header ||
          (option.domain && option.domain.toLowerCase().includes(pattern)) ||
          (option.displayName && option.displayName.toLowerCase().includes(pattern)),
      )
      .filter(
        // then filter groups and hide groups with no domains and that's doesn't fit to filter pattern
        (option, idx, opts) =>
          !(
            option.header &&
            ((opts.length > idx + 1 && opts[idx + 1].header) || opts.length === idx + 1)
          ) ||
          (option.header &&
            (option.displayName && option.displayName.toLowerCase().includes(pattern))),
      );
  };

  menuRenderer = ({ focusedOption, focusOption, options, onOptionRef, selectValue }) =>
    options.map(option => {
      const isActive = focusedOption && focusedOption.key === option.key;
      return (
        <div
          key={option.key}
          onClick={() => selectValue(option)}
          onMouseOver={() => focusOption(option)}
          role="option"
          ref={ref => onOptionRef(ref, isActive)}
          className={cn(
            'Select-option',
            {
              'is-selected': isActive,
              'is-focused': isActive,
              'border-bottom': option.type !== DOMAIN_ITEM,
            },
            option.className,
          )}
        >
          {option.type === DOMAIN_ITEM ? (
            <DomainItem {...option} />
          ) : (
            <div>
              <span style={{ marginRight: '5px' }}>+</span> {option.displayName}
            </div>
          )}
        </div>
      );
    });

  renderArrow = () => <div className="dropdown-arrow" />;

  render() {
    return (
      <Select
        ref={ref => {
          this.select = ref;
        }}
        className="quick-navigation-select expandLeft"
        arrowRenderer={this.renderArrow}
        placeholder={t('Quick navigate')}
        hideLabel
        clearable={false}
        searchable
        backspaceRemoves={false}
        deleteRemoves={false}
        options={this.getOptions()}
        openOnFocus
        filterOptions={this.filterOptions}
        onChange={this.handleChange}
        valueKey="key"
        menuRenderer={this.menuRenderer}
      />
    );
  }
}

const mapStateToProps = ({ user }) => ({
  user,
});

const dataQuery = gql`
  query quickNavigation_clients {
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

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  withRouter,
  graphql(dataQuery),
)(QuickNavigation);
