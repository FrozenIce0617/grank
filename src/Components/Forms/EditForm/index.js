// @flow
import * as React from 'react';
import IconButton from 'Components/IconButton';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n/index';
import DeleteIcon from 'icons/remove.svg?inline';
import './edit-form.scss';

export type Props = {
  title: string,
  icon?: React.Node,
  children: React.Node,
  onCancel: Function,
  onSubmit: Function,
  submitLabel: string,
  cancelLabel?: string,
  onDelete?: ?Function,
  error?: string,
};

class EditForm extends React.Component<Props> {
  static defaultProps = {
    icon: null,
    onDelete: null,
    isAdd: false,
    submitLabel: 'OK',
    cancelLabel: 'Cancel',
    error: '',
  };

  handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.onSubmit();
    }
  };

  render() {
    const {
      title,
      icon,
      children,
      onDelete,
      onCancel,
      submitLabel,
      cancelLabel,
      error,
      onSubmit,
    } = this.props;
    let deleteButton = null;
    if (onDelete) {
      deleteButton = (
        <IconButton icon={<DeleteIcon />} onClick={onDelete}>
          {t('Delete')}
        </IconButton>
      );
    }
    return (
      <form className="edit-form" onKeyDown={this.handleKeydown}>
        <div className="title">
          {icon}
          {title}
        </div>
        <div>{children}</div>
        {error && <div className="error-message">{error}</div>}
        <div className="action-buttons">
          {deleteButton}
          <div className="spacer" />
          {onCancel && (
            <Button onClick={onCancel} theme="grey">
              {cancelLabel}
            </Button>
          )}
          <Button onClick={onSubmit} theme="orange">
            {submitLabel}
          </Button>
        </div>
      </form>
    );
  }
}

export default EditForm;
