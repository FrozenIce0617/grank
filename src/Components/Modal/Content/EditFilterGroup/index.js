// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import EditFilterGroupForm from './EditFilterGroupForm';
import { t } from 'Utilities/i18n';
import type { FilterSet } from 'Types/FilterSet';

type Props = {
  hideModal: Function,
  filterGroup: Object,
  filterSet: FilterSet,
  onEdit: Function,
};

class EditFilterGroup extends Component<Props> {
  render() {
    const { onEdit, filterSet, filterGroup } = this.props;
    return (
      <ModalBorder
        className="edit-filter-group"
        title={t('Edit segment')}
        onClose={this.props.hideModal}
      >
        <EditFilterGroupForm
          onClose={this.props.hideModal}
          onEdit={onEdit}
          filterGroup={filterGroup}
          filterSet={filterSet}
        />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(EditFilterGroup);
