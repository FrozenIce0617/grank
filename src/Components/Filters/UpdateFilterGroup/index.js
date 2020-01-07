// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import IconButton from 'Components/IconButton';
import EditIcon from 'icons/edit-rounded.svg?inline';
import { t } from 'Utilities/i18n/index';
import { updateFilterGroupFilters } from 'Actions/FilterAction';
import type { FilterGroup } from 'Types/Filter';
import { isRequiredFilter } from 'Types/FilterSet';
import type { FilterSet } from 'Types/FilterSet';
import generateCreateUserFilterInput from 'Components/Filters/generateCreateUserFilterInput';
import { showModal } from 'Actions/ModalAction';
import toast from 'Components/Toast';

type Props = {
  filterGroup: FilterGroup,
  filterSet: FilterSet,
  updateUserFilter: Function,
  updateFilterGroupFilters: Function,
  showModal: Function,
};

class UpdateFilter extends Component<Props> {
  onUpdate = () => {
    const {
      filterGroup: { name, filters, id },
      filterSet,
    } = this.props;
    const availableFilters = filters.filter(
      filter => !isRequiredFilter(filter.attribute, filterSet),
    );
    const updateUserFilterInput = generateCreateUserFilterInput('', availableFilters, filterSet, {
      name,
      id,
    });
    this.props
      .updateUserFilter({
        variables: {
          input: updateUserFilterInput,
        },
      })
      .then(({ data: { updateFilter: { errors } } }) => {
        if (errors && errors.length) {
          toast.error(t('Unable to update segment'));
          return;
        }
        toast.success(t('Segment updated'));
        this.props.updateFilterGroupFilters(id, availableFilters);
      });
  };

  showModal(action) {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        lockDuration: 0,
        title: t('Update Segment?'),
        description: t('The segment will be permanently updated.'),
        confirmLabel: t('Update segment'),
        cancelLabel: t('Cancel'),
        action,
      },
    });
  }

  render() {
    return (
      <IconButton onClick={() => this.showModal(this.onUpdate)} icon={<EditIcon />} bold>
        {t('Update segment')}
      </IconButton>
    );
  }
}

const mapStateToProps = state => ({
  filterGroup: state.filter.filterGroup,
  filterSet: state.filter.filterSet,
});

const updateUserFilter = gql`
  mutation updateFilter_updateUserFilter($input: UpdateUserFilterInput!) {
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

export default compose(graphql(updateUserFilter, { name: 'updateUserFilter' }))(
  connect(
    mapStateToProps,
    {
      updateFilterGroupFilters,
      showModal,
    },
  )(UpdateFilter),
);
