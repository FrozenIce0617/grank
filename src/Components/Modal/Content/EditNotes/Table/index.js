// @flow
import * as React from 'react';
import OptionsDropdown from 'Components/Controls/Dropdowns/OptionsDropdown';
import { t } from 'Utilities/i18n';
import { Table } from 'reactstrap';

import Ellipsis from 'Components/Ellipsis';
import EditIcon from 'icons/edit.svg?inline';

import './edit-notes-table.scss';

type User = {
  fullName: string,
};

type NoteEntry = {
  id: string,
  user: User,
  note: string,
};

type Props = {
  notes: NoteEntry[] | null,
  showModal: Function,
  onBack?: Function,
};

class EditNotesTable extends React.Component<Props> {
  getDropdownOptions = (id: string) => [
    {
      onSelect: () => this.handleEditNode(id),
      label: t('Edit'),
      icon: <EditIcon />,
    },
  ];

  handleEditNode = (noteId: string) => {
    const { onBack } = this.props;
    this.props.showModal({
      modalType: 'EditNote',
      modalProps: {
        theme: 'light',
        noteId,
        onBack,
      },
    });
  };

  renderBody() {
    const { notes } = this.props;
    return (
      <tbody>
        {notes &&
          notes.map(note => (
            <tr key={note.id}>
              <td className="ellipsis">
                <Ellipsis>{note.note}</Ellipsis>
              </td>
              <td>{note.user && note.user.fullName}</td>
              <td className="text-right">
                <OptionsDropdown items={this.getDropdownOptions(note.id)} />
              </td>
            </tr>
          ))}
      </tbody>
    );
  }

  render() {
    return (
      <Table className="data-table edit-notes-table">
        <thead>
          <tr>
            <th className="note">{t('Note')}</th>
            <th>{t('Created by')}</th>
            <th />
          </tr>
        </thead>
        {this.renderBody()}
      </Table>
    );
  }
}

export default EditNotesTable;
