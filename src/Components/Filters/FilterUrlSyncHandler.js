// @flow
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { setFilters, selectFilterSet, setDefaultFilters } from 'Actions/FilterAction';
import type { FilterBase } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import { getRequiredFilterAttributes } from 'Types/FilterSet';
import underdash from 'Utilities/underdash';
import { decodeFilters } from './serialization';

type Props = {
  history: Object,
  match: Object,
  children: React.Node,
  filterSet?: FilterSet,
  selectFilterSet: (filterSet: FilterSet) => void,
  setDefaultFilters: () => void,
  setFilters: (filters: FilterBase[], segmentId: string) => void,
};

class FilterUrlSyncHandler extends PureComponent<Props> {
  lastFilterHash: string;

  constructor(props) {
    super(props);
    const { filterSet } = this.props;
    if (filterSet) {
      this.props.selectFilterSet(filterSet);
    }

    this.loadFilterFromHash(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Object) {
    const {
      match: { params },
    } = nextProps;
    if (params.filter && params.filter !== this.lastFilterHash) {
      this.loadFilterFromHash(nextProps);
    }
  }

  loadFilterFromHash = (props: Props) => {
    const { history, match } = props;
    const dataString = match.params.filter;

    if (dataString) {
      // Validate filters
      let isValid = underdash.base64IsValidJSON(dataString);
      if (isValid) {
        const data = decodeFilters(dataString);
        isValid = this.hasRequiredFilters(data.filters);
        if (isValid) {
          this.lastFilterHash = dataString;
          this.props.setFilters(data.filters, data.segmentId);
          return;
        }
      }

      console.log('loadFilterFromHash - filters are invalid', match); // eslint-disable-line
      // Filters are invalid, reset to homepage
      history.replace('/');
    } else {
      // No filters provided, use default filters
      this.props.setDefaultFilters();
    }
  };

  // Checks if current filters contains required filters
  hasRequiredFilters = filters => {
    const { filterSet } = this.props;
    return (
      !filterSet ||
      getRequiredFilterAttributes(filterSet).every(attribute =>
        filters.find(filter => filter.attribute === attribute),
      )
    );
  };

  render() {
    return this.props.children;
  }
}

export default withRouter(
  connect(
    null,
    { setFilters, selectFilterSet, setDefaultFilters },
  )(FilterUrlSyncHandler),
);
