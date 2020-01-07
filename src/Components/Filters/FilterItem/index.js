// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { deleteFilterGroup } from 'Actions/FilterAction';
import { showModal } from 'Actions/ModalAction';
import type { FilterBase, FilterGroup } from 'Types/Filter';
import toast from 'Components/Toast';
import { t } from 'Utilities/i18n';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withFiltersEditor from 'Components/HOC/withFiltersEditor';
import type { FiltersEditorProps } from 'Components/HOC/withFiltersEditor';
import FilterItemComponent from './component';

type Props = {
  filter: FilterBase,
  filters: FilterBase[],
  filterGroup: FilterGroup,
  showModal: Function,
  deleteFilterMutation: Function,
  deleteFilterGroup: Function,
} & FiltersEditorProps;

type State = {
  isOpen: boolean,
  filterHovered: boolean,
};

class FilterItem extends Component<Props, State> {
  state = {
    isOpen: false,
    filterHovered: false,
  };

  handleUpdate = (filter: FilterBase) => {
    this.props.filtersEditor.updateFilters(filter);
  };

  handleDelete = () => {
    const { filter, filters, filterGroup } = this.props;

    // Not the last filter of the non empty/default segment
    if (filters.length !== 1 || !filterGroup.id || filterGroup.id === 'default') {
      this.props.filtersEditor.removeFilter(filter.attribute);
      return;
    }

    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: t('Delete Filter?'),
        lockDuration: 0,
        description: t('The filter and current segment will be permanently deleted.'),
        cancelLabel: t('Cancel'),
        confirmLabel: t('Delete'),
        action: () => {
          this.props
            .deleteFilterMutation({
              variables: {
                input: {
                  id: filterGroup.id,
                },
              },
            })
            .then(
              ({
                data: {
                  deleteFilter: { errors },
                },
              }) => {
                if (errors && errors.length) {
                  toast.error(t('Unable to delete filter'));
                  return;
                }

                this.props.deleteFilterGroup(filterGroup.id);
                toast.success(t('Segment deleted'));
                this.props.filtersEditor.removeFilter(filter.attribute);
              },
              () => {
                toast.error(t('Unable to delete filter'));
              },
            );
        },
      },
    });
  };

  render() {
    return (
      <FilterItemComponent
        filter={this.props.filter}
        onUpdate={this.handleUpdate}
        onDelete={this.handleDelete}
      />
    );
  }
}

const deleteFilterMutation = gql`
  mutation filterItem_deleteFilter($input: DeleteUserFilterInput!) {
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

export default compose(
  graphql(deleteFilterMutation, { name: 'deleteFilterMutation' }),
  withFiltersEditor,
  connect(
    null,
    {
      deleteFilterGroup,
      showModal,
    },
  ),
)(FilterItem);
