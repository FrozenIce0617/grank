// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import EditNoteForm from './EditNoteForm';
import { noop } from 'lodash';

import './edit-note.scss';

type Props = {
  hideModal: Function,
  noteId: string,
  onBack?: Function,
  refresh?: Function,
  enableEditingKeywords: boolean,
};

class EditNote extends Component<Props> {
  static defaultProps = {
    refresh: noop,
  };

  render() {
    return (
      <ModalBorder className="edit-note" title={t('Update note')} onClose={this.props.hideModal}>
        <EditNoteForm
          noteId={this.props.noteId}
          onBack={this.props.onBack}
          hideModal={this.props.hideModal}
          refresh={this.props.refresh}
          enableEditingKeywords={this.props.enableEditingKeywords}
        />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(EditNote);
