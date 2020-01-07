// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import linkWithFilters from 'Components/Filters/linkWithFilters';
import { FilterAttribute, FilterComparison, FilterValueType } from 'Types/Filter';
import type { ClientsFilter } from 'Types/Filter';

import { DOMAINS_FILTER_SET } from 'Types/FilterSet';

type Props = {
  groupData: Object,
};

class GroupCell extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.groupData !== this.props.groupData;
  }

  makeDomainsLink = (clientId: string) => {
    const clientsFilter: ClientsFilter = {
      attribute: FilterAttribute.CLIENTS,
      type: FilterValueType.LIST,
      comparison: FilterComparison.CONTAINS,
      value: [clientId],
    };
    return linkWithFilters('/domains', [clientsFilter], DOMAINS_FILTER_SET);
  };

  render() {
    const {
      groupData: { id, name },
    } = this.props;
    return <Link to={this.makeDomainsLink(id)}>{name}</Link>;
  }
}

export default GroupCell;
