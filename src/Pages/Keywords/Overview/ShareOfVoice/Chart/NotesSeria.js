// @flow
import colorScheme from 'Utilities/colors';
import { t } from 'Utilities/i18n/index';
import NotesIcon from 'icons/content-note.svg';
import { sortBy, uniqBy } from 'lodash';

const SERIA_ID = 'notes';
const notesColor = colorScheme.notes;

type Props = {
  notes: Object[],
  onNotesSelect: Function,
};

const getNotesSeriesData = notes =>
  sortBy(
    uniqBy(notes, 'createdAt').map(({ createdAt }) => [new Date(createdAt).getTime(), 0]),
    noteData => noteData[0],
  );

class NotesSeria {
  props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  get id() {
    return SERIA_ID;
  }

  getConfig = () => {
    const props = this.props;
    return {
      id: SERIA_ID,
      name: t('Notes'),
      yAxis: 1,
      data: getNotesSeriesData(props.notes),
      marker: {
        symbol: `url(${NotesIcon})`,
      },
      states: {
        hover: {
          lineWidthPlus: 0,
        },
      },
      color: notesColor,
      type: 'line',
      lineWidth: 0,
    };
  };

  getTooltip = (points: any) => {
    if (points.length === 0) {
      return '';
    }
    const notes = this.props.notes.filter(
      note => new Date(note.createdAt).getTime() === points[0].key,
    );
    return notes
      .map(
        note => `<div class="chart-tooltip-table-tr">
      <div class="chart-tooltip-table-td">
        ${note.note}
      </div>
    </div>`,
      )
      .join('');
  };

  onClick = (point: any) => {
    const newNotes = this.props.notes.filter(
      note => new Date(note.createdAt).getTime() === point.category,
    );
    if (newNotes.length > 0) {
      this.props.onNotesSelect(newNotes);
    }
  };
}

export default NotesSeria;
