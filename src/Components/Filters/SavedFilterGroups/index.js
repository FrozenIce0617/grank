// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import SimpleDropdownButton from 'Components/Controls/Dropdowns/SimpleDropdownButton';
import type { FilterGroup } from 'Types/Filter';
import {
  deleteFilterGroup,
  renameFilterGroup,
  toggleDefaultFilterGroup,
} from 'Actions/FilterAction';
import SavedFilterGroup from './SavedFilterGroup';
import FilterGroupsSelector from 'Selectors/FilterGroupsSelector';
import { t } from 'Utilities/i18n/index';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';
import './saved-filter-groups.scss';

type Props = {
  filterGroups: Array<FilterGroup>,
  deleteFilterGroup: Function,
  renameFilterGroup: Function,
  toggleDefaultFilterGroup: Function,
} & FiltersEditorProps;

type State = {
  isOpen: boolean,
};

class SavedFilterGroups extends Component<Props, State> {
  state = {
    isOpen: false,
  };

  handleSelect = (filterGroup: FilterGroup) => {
    this.props.filtersEditor.selectFilterGroup(filterGroup);
    this.toggleDropdown();
  };

  handleDelete = (id: string) => {
    this.props.deleteFilterGroup(id);
  };

  handleEdit = (id: string, name: string, isAPIFilter) => {
    if (isAPIFilter) {
      this.props.deleteFilterGroup(id);
    } else {
      this.props.renameFilterGroup(id, name);
    }
  };

  handleToggleDefault = (id: string, isDefault: boolean) => {
    this.props.toggleDefaultFilterGroup(id, isDefault);
  };

  toggleDropdown = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  render() {
    const { filterGroups, filterSet } = this.props;
    const filterGroupName = this.props.filterGroup.name;
    const { isOpen } = this.state;
    const currentFilterGroup = filterGroups.find(
      filterGroup => filterGroup.name === filterGroupName,
    );

    return (
      <Dropdown
        isOpen={isOpen}
        toggle={this.toggleDropdown}
        className="simple-dropdown saved-filter-groups"
      >
        <DropdownToggle tag="div" className="menu-toggle">
          <SimpleDropdownButton
            placeholder={t('Saved segments')}
            labelFunc={(filterGroup: FilterGroup) => filterGroup.name}
            item={currentFilterGroup}
          />
        </DropdownToggle>
        <DropdownMenu flip={false} className="dropdown-menu dropdown-menu-overlap" right={true}>
          <div className="header">
            <div className="title">{t('Saved segments')}</div>
          </div>
          {filterGroups.map((filterGroup, index) => (
            <SavedFilterGroup
              key={filterGroup.name}
              index={index}
              filterGroup={filterGroup}
              filterSet={filterSet}
              onEdit={this.handleEdit}
              onSelect={this.handleSelect}
              onDelete={this.handleDelete}
              onToggleDefault={this.handleToggleDefault}
              toggleDropdown={this.toggleDropdown}
            />
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

const mapStateToProps = state => ({
  filterGroups: FilterGroupsSelector(state),
});

export default withFiltersEditor(
  connect(
    mapStateToProps,
    {
      deleteFilterGroup,
      renameFilterGroup,
      toggleDefaultFilterGroup,
    },
  )(SavedFilterGroups),
);
