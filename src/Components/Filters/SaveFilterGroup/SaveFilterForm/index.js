// @flow
import React, { Component } from 'react';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import EditForm from 'Components/Forms/EditForm';
import { TextField } from 'Components/Forms/Fields';
import type { FilterGroup } from 'Types/Filter';
import { t } from 'Utilities/i18n/index';

type Props = {
  filterGroup: FilterGroup,
  filterGroups: Array<FilterGroup>,
  handleSubmit: Function,
  error: string,
  onSubmit: Function,
  onCancel: Function,
};

class SaveFilterForm extends Component<Props> {
  onSubmit = (data: { name: string }) => {
    const filterGroup = this.props.filterGroup;
    if (filterGroup.filters.length === 0) {
      throw new SubmissionError({
        _error: t('No filters added'),
      });
    }
    if (!data.name) {
      throw new SubmissionError({
        name: t('Name can not be empty'),
      });
    }
    const filterGroups = this.props.filterGroups;
    const isNameTaken = filterGroups.find(
      currentFilterGroup => currentFilterGroup.name.toLowerCase() === data.name.toLowerCase(),
    );
    if (isNameTaken) {
      throw new SubmissionError({
        name: t('Name already taken'),
      });
    }
    this.props.onSubmit(data);
  };

  render() {
    const { handleSubmit, onCancel, error } = this.props;
    return (
      <EditForm
        title={t('Save segment')}
        submitLabel={t('Save')}
        error={error}
        onCancel={onCancel}
        onSubmit={handleSubmit(this.onSubmit)}
      >
        <Field name="name" component={TextField} placeholder={t('Enter name')} />
      </EditForm>
    );
  }
}

export default reduxForm({
  form: 'save-filter-form',
})(SaveFilterForm);
