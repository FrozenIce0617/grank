// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import type { FilterGroup } from 'Types/Filter';
import DeleteIcon from 'icons/remove.svg?inline';
import EditIcon from 'icons/edit.svg?inline';
import StarIcon from 'icons/star.svg?inline';
import IconButton from 'Components/IconButton';
import { t } from 'Utilities/i18n/index';
import generateCreateUserFilterInput from 'Components/Filters/generateCreateUserFilterInput';
import { isRequiredFilter, DOMAINS_FILTER_SET, KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import type { FilterSet } from 'Types/FilterSet';
import { showModal } from 'Actions/ModalAction';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import toast from 'Components/Toast';
import { FilterAttribute } from 'Types/Filter';

type Props = {
  filterGroup: FilterGroup,
  filterSet: FilterSet,
  onSelect: Function,
  onEdit: Function,
  onDelete: Function,
  onToggleDefault: Function,
  index: number,
  deleteUserFilter: Function,
  updateUserFilter: Function,
  showModal: Function,
  toggleDropdown: Function,
  canBeDefault: boolean,
  isDefault: boolean,
  domainId: string | null,
};

class SavedFilterGroup extends Component<Props> {
  handleSelect = () => {
    this.props.onSelect(this.props.filterGroup);
  };

  handleDelete = () => {
    const {
      filterGroup,
      filterGroup: { id },
    } = this.props;
    this.props
      .deleteUserFilter({
        variables: {
          input: { id },
        },
      })
      .then(
        ({
          data: {
            deleteFilter: { errors },
          },
        }) => {
          if (errors && errors.length) {
            toast.error(t('Unable to delete segment'));
            return;
          }
          toast.success(t('Segment deleted'));
          this.props.onDelete(filterGroup.id);
        },
        () => {
          toast.error(t('Unable to delete segment'));
        },
      );
  };

  showModal(action) {
    this.props.toggleDropdown();
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: t('Delete Segment?'),
        lockDuration: 0,
        description: t('The segment will be permanently deleted.'),
        cancelLabel: t('Cancel'),
        confirmLabel: t('Delete segment'),
        action,
      },
    });
  }

  handleEdit = () => {
    const { filterGroup, filterSet, onEdit } = this.props;
    this.props.toggleDropdown();
    this.props.showModal({
      modalType: 'EditFilterGroup',
      modalProps: {
        filterGroup,
        filterSet,
        onEdit,
      },
    });
  };

  toggleDefault = () => {
    const { filterGroup, filterSet, domainId } = this.props;
    const isDefault = !this.props.isDefault;
    const availableFilters = filterGroup.filters.filter(
      filter => !isRequiredFilter(filter.attribute, filterSet),
    );
    // Quite tricky logic to toggle default depending on the current filter set and domain
    let defaultForDomains = filterGroup.defaultForDomains || false;
    let defaultForKeywords = filterGroup.defaultForKeywords || [];
    if (filterSet === DOMAINS_FILTER_SET) {
      defaultForDomains = isDefault;
    } else if (filterSet === KEYWORDS_FILTER_SET && domainId) {
      defaultForKeywords = defaultForKeywords.filter(
        defaultDomainId => defaultDomainId !== domainId,
      );
      if (isDefault) {
        defaultForKeywords.push(domainId);
      }
    }
    const updateUserFilterInput = generateCreateUserFilterInput(
      filterGroup.name,
      availableFilters,
      filterSet,
      {
        id: filterGroup.id,
        defaultForDomains,
        defaultForKeywords,
      },
    );
    this.props
      .updateUserFilter({
        variables: {
          input: updateUserFilterInput,
        },
      })
      .then(
        ({
          data: {
            updateFilter: { errors },
          },
        }) => {
          if (errors && errors.length) {
            toast.error(t('Unable to set default segment'));
            return;
          }
          this.props.onToggleDefault(filterGroup.id, isDefault);
        },
        () => {
          toast.error(t('Unable to set default segment'));
        },
      );
  };

  render() {
    const { filterGroup, index, canBeDefault, isDefault } = this.props;
    return (
      <div className="dropdown-item saved-filter-group">
        <span className="label" onClick={this.handleSelect}>
          {filterGroup.name}
        </span>
        {index !== 0 && <IconButton onClick={this.handleEdit} icon={<EditIcon />} />}
        {index !== 0 &&
          canBeDefault && (
            <IconButton
              icon={<StarIcon />}
              brand={isDefault ? 'orange' : ''}
              onClick={this.toggleDefault}
            />
          )}
        {index !== 0 && (
          <IconButton onClick={() => this.showModal(this.handleDelete)} icon={<DeleteIcon />} />
        )}
      </div>
    );
  }
}

const updateUserFilter = gql`
  mutation savedFilterGroup_updateUserFilter($input: UpdateUserFilterInput!) {
    updateFilter(input: $input) {
      errors {
        field
        messages
      }
      filter {
        id
        name
        defaultForDomains
        defaultForKeywords
        filters
      }
    }
  }
`;

const deleteUserFilter = gql`
  mutation savedFilterGroup_deleteUserFilter($input: DeleteUserFilterInput!) {
    deleteFilter(input: $input) {
      errors {
        field
        messages
      }
      filter {
        id
      }
    }
  }
`;

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = (state, ownProps: Props) => {
  let canBeDefault = false;
  let isDefault = false;
  let domainId = null;
  // Quite tricky logic to determine is current filter group is default
  // or can be set to be default
  if (state.filter.filterSet === DOMAINS_FILTER_SET) {
    canBeDefault = true;
    isDefault = !!ownProps.filterGroup.defaultForDomains;
  } else if (state.filter.filterSet === KEYWORDS_FILTER_SET) {
    const domainsFilter = domainsFilterSelector(state);
    if (domainsFilter.value.length === 1) {
      canBeDefault = true;
      domainId = domainsFilter.value[0];
      isDefault = !!(
        ownProps.filterGroup.defaultForKeywords &&
        ownProps.filterGroup.defaultForKeywords.indexOf(domainId) !== -1
      );
    }
  }
  return {
    isDefault,
    canBeDefault,
    domainId,
  };
};

export default compose(
  graphql(updateUserFilter, { name: 'updateUserFilter' }),
  graphql(deleteUserFilter, { name: 'deleteUserFilter' }),
)(
  connect(
    mapStateToProps,
    {
      showModal,
    },
  )(SavedFilterGroup),
);
