// @flow
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import IconButton from 'Components/IconButton';
import PlusIcon from 'icons/plus-rounded.svg?inline';
import SearchItemsList from 'Components/Controls/Dropdowns/SearchItemsList';
import FilterEditorForm from 'Components/Filters/FilterEditorForm';
import { isMac } from 'Utilities/underdash';
import { getFilterBarFilterAttributes } from 'Types/FilterSet';
import type { FilterSet } from 'Types/FilterSet';
import { FilterAttribute } from 'Types/Filter';
import type { FilterBase } from 'Types/Filter';
import getFilterData from '../getFilterData';
import { t } from 'Utilities/i18n/index';
import * as Mousetrap from 'Utilities/mousetrap';

type Props = {
  onAdd: (filter: FilterBase) => void,
  filters: FilterBase[],
  filterSet: FilterSet,
  dropup?: boolean,
};

type State = {
  isOpen: boolean,
  filterAttribute: ?string,
};

class AddFilter extends Component<Props, State> {
  static defaultProps = {
    dropup: false,
  };

  state = {
    isOpen: false,
    filterAttribute: null,
  };

  componentDidMount() {
    const filters = getFilterBarFilterAttributes(this.props.filterSet);
    const keywordsAttribute =
      this.getAttribute(filters, FilterAttribute.KEYWORD) ||
      this.getAttribute(filters, FilterAttribute.KEYWORDS);

    const domainsAttribute =
      this.getAttribute(filters, FilterAttribute.DOMAIN) ||
      this.getAttribute(filters, FilterAttribute.DOMAINS);

    if (keywordsAttribute || domainsAttribute) {
      const shortcut = isMac() ? 'command+f' : 'ctrl+f';
      const description = keywordsAttribute ? t('Open keywords filter') : t('Open domains filter');

      Mousetrap.bind(
        shortcut,
        description,
        () =>
          this.setState({
            isOpen: true,
            filterAttribute: keywordsAttribute || domainsAttribute,
          }) || false,
      );
    }
  }

  componentWillUnmount() {
    Mousetrap.unbind(['command+f', 'ctrl+f']);
  }

  getAttribute = (filterAttributes: string[], attribute: string): string | null =>
    filterAttributes.includes(attribute) ? attribute : null;

  onAdd = (filter: FilterBase) => {
    this.toggleDropdown();
    this.props.onAdd(filter);
  };

  onSelect = (filterItem: any) => {
    this.setState({
      filterAttribute: filterItem.defaultValue.attribute,
    });
  };

  onBack = () => {
    this.setState({
      isOpen: this.state.isOpen,
      filterAttribute: null,
    });
  };

  toggleDropdown = () => {
    this.setState({
      isOpen: !this.state.isOpen,
      filterAttribute: null,
    });
  };

  render() {
    const { filters, filterSet } = this.props;
    const { isOpen, filterAttribute } = this.state;
    let dropdownContent = null;
    if (!filterAttribute) {
      const filtersInUse = filters.reduce((current, subfilter) => {
        current[subfilter.attribute] = subfilter;
        return current;
      }, {});
      const filteredFilterList = getFilterBarFilterAttributes(filterSet)
        .filter(fAttribute => !filtersInUse[fAttribute])
        .map(fAttribute => getFilterData(fAttribute));
      dropdownContent = (
        <SearchItemsList
          items={filteredFilterList}
          labelFunc={filterItem => filterItem.title}
          iconFunc={filterItem => <filterItem.icon />}
          onSelect={this.onSelect}
          title={t('Select a type of filter')}
          closeOnSelect={false}
        />
      );
    } else {
      const filter = getFilterData(filterAttribute).defaultValue;
      dropdownContent = (
        <FilterEditorForm
          isOpen={isOpen}
          isNew={true}
          onSubmit={this.onAdd}
          filter={filter}
          initialValues={filter}
          onCancel={this.onBack}
        />
      );
    }
    return (
      <Dropdown
        direction={this.props.dropup ? 'up' : 'down'}
        isOpen={isOpen}
        toggle={this.toggleDropdown}
        className="simple-dropdown"
      >
        <DropdownToggle className="add-filter-toggle" tag="div">
          <IconButton className="add-filter-icon" icon={<PlusIcon />} bold>
            {t('Add filter')}
          </IconButton>
        </DropdownToggle>
        <DropdownMenu flip={false} className="dropdown-menu-overlap">
          {isOpen && dropdownContent}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default AddFilter;
