// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showModal, hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import EditNotesTable from './Table';
import { isEmpty } from 'lodash';

type Props = {
  notes: Array<any>,
  showModal: Function,
  hideModal: Function,
  onBack?: Function,
};

class EditNotes extends Component<Props> {
  handleBack = note => {
    const { onBack, notes } = this.props;
    const newNotes =
      notes[0].createdAt === note.createdAt
        ? notes
        : notes.filter(noteItem => noteItem.id !== note.id);

    !isEmpty(newNotes)
      ? this.props.showModal({
          modalType: 'EditNotes',
          modalProps: {
            theme: 'light',
            notes: newNotes,
            onBack,
          },
        })
      : (onBack || this.props.hideModal)();
  };

  render() {
    const { notes, onBack } = this.props;
    return (
      <ModalBorder
        className="keyword-history"
        title={`${t('Edit Notes')}`}
        onClose={this.props.hideModal}
      >
        <EditNotesTable showModal={this.props.showModal} notes={notes} onBack={this.handleBack} />
        {onBack && (
          <div className="confirmation-button-wrapper text-right mt-2">
            <Button theme="grey" onClick={onBack}>
              {t('Back')}
            </Button>
          </div>
        )}
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { showModal, hideModal },
)(EditNotes);
