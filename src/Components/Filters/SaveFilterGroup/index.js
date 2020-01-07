// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import IconButton from 'Components/IconButton';
import { connect } from 'react-redux';
import type { FilterBase, FilterGroup } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import { saveFilterGroup } from 'Actions/FilterAction';
import CheckIcon from 'icons/check-rounded.svg?inline';
import { t } from 'Utilities/i18n/index';
import SaveFilterForm from './SaveFilterForm';
import toast from 'Components/Toast';
import { NonRequiredFiltersSelector } from 'Selectors/FiltersSelector';
import generateCreateUserFilterInput from 'Components/Filters/generateCreateUserFilterInput';

type Props = {
  saveFilterGroup: Function,
  saveUserSegment: Function,
  filters: Array<FilterBase>,
  filterSet: FilterSet,
  filterGroup: FilterGroup,
  filterGroups: FilterGroup[],
};

type State = {
  isOpen: boolean,
};

class SaveFilter extends Component<Props, State> {
  state = {
    isOpen: false,
  };

  onAdd = () => {
    this.toggleDropdown();
  };

  onSave = ({ name }) => {
    const { filters, filterSet } = this.props;
    const createUserFilterInput = generateCreateUserFilterInput(name, filters, filterSet);
    this.props
      .saveUserSegment({
        variables: {
          input: createUserFilterInput,
        },
      })
      .then(
        ({
          data: {
            createFilter: { errors, filter },
          },
        }) => {
          if (errors && errors.length) {
            toast.error(t('Failed to save segment'));
            return;
          }
          const filterGroup = {
            id: filter.id,
            name: filter.name,
            type: filter.type,
            filters,
          };
          this.props.saveFilterGroup(filterGroup);
        },
        () => {
          toast.error(t('Failed to save segment'));
        },
      );
    this.toggleDropdown();
  };

  toggleDropdown = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  render() {
    const { isOpen } = this.state;
    return (
      <Dropdown isOpen={isOpen} toggle={this.toggleDropdown} className="simple-dropdown">
        <DropdownToggle tag="div">
          <IconButton className="save-filter-group-icon" icon={<CheckIcon />} bold>
            {t('Save segment')}
          </IconButton>
        </DropdownToggle>
        <DropdownMenu flip={false} className="dropdown-menu-overlap">
          {isOpen ? (
            <SaveFilterForm
              filterGroup={this.props.filterGroup}
              filterGroups={this.props.filterGroups}
              onSubmit={this.onSave}
              onCancel={this.toggleDropdown}
            />
          ) : (
            ''
          )}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

const mapStateToProps = state => ({
  ...state.filter,
  filters: NonRequiredFiltersSelector(state),
  filterSet: state.filter.filterSet,
  filterGroup: state.filter.filterGroup,
  filterGroups: state.filter.filterGroups,
});

const saveUserSegment = gql`
  mutation saveFilter_createUserFilter($input: CreateUserFilterInput!) {
    createFilter(input: $input) {
      errors {
        field
        messages
      }
      filter {
        id
        name
        type
        filters
      }
    }
  }
`;

export default compose(graphql(saveUserSegment, { name: 'saveUserSegment' }))(
  connect(
    mapStateToProps,
    {
      saveFilterGroup,
    },
  )(SaveFilter),
);
