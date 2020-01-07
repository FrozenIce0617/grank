// @flow
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import EditForm from 'Components/Forms/EditForm';
import type { FilterBase } from 'Types/Filter';
import getFilterData from '../getFilterData';
import { t } from 'Utilities/i18n/index';

type Props = {
  filter: FilterBase,
  handleSubmit: Function,
  isNew: boolean,
  onCancel: Function,
  onDelete?: Function,
  isOpen: boolean,
};

class FilterEditorForm extends Component<Props> {
  render() {
    const { filter, handleSubmit, onCancel, isNew, onDelete } = this.props;
    const filterViewData = getFilterData(filter.attribute);
    const Editor = filterViewData.editor;
    const Icon = filterViewData.icon;
    const editorProps = filterViewData.editorProps || {};

    return (
      <EditForm
        title={filterViewData.title}
        icon={<Icon />}
        submitLabel={isNew ? t('Add') : t('Update')}
        cancelLabel={t('Back')}
        onDelete={onDelete}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      >
        {Editor ? <Editor {...editorProps} /> : ''}
      </EditForm>
    );
  }
}

export default reduxForm({
  form: 'filter-editor-form',
})(FilterEditorForm);
