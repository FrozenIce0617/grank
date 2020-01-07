// @flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Field, formValueSelector, reduxForm } from 'redux-form';
import { uniqueId, isEmpty } from 'lodash';

import { TextAreaField, DateField, KeywordsInputField, Checkbox } from 'Components/Forms/Fields';
import Button from 'Components/Forms/Button';
import Toast from 'Components/Toast';
import Skeleton from 'Components/Skeleton';
import LoadingSpinner from 'Components/LoadingSpinner';
import { formatDate } from 'Utilities/format';

import Validation from 'Utilities/validation';
import { graphqlError, graphqlLoading } from 'Utilities/underdash';
import { t } from 'Utilities/i18n';

import './edit-note-form.scss';

type Props = {
  handleSubmit: Function,
  noteId: string,
  updateNote: Function,
  getNote: any,
  hideModal: Function,
  onBack?: Function,
  refresh: Function,
  forAllKeywords: boolean,
  enableEditingKeywords: boolean,
};

type State = {
  inProgress: boolean,
  editMode: boolean,
};

class EditNoteForm extends Component<Props, State> {
  state = {
    inProgress: false,
    editMode: false,
  };

  handleEdit = evt => {
    evt.preventDefault();
    this.setState({ editMode: true });
  };

  getKeywordsInput = (ids, shouldExclude) => {
    if (isEmpty(ids) && !shouldExclude) {
      return {};
    }

    return {
      keywordsToExclude: shouldExclude ? ids : [],
      keywords: !shouldExclude ? ids : [],
    };
  };

  handleSubmit = (values: any) => {
    const {
      getNote: { note },
      onBack,
    } = this.props;

    this.setState({ inProgress: true, editMode: false });
    this.props
      .updateNote({
        variables: {
          input: {
            ...this.getKeywordsInput(
              values.keywords.map(({ value }) => value),
              values.forAllKeywords,
            ),
            id: note.id,
            note: values.note,
            createdAt: formatDate(values.createdAt),
            delete: false,
          },
        },
      })
      .then(
        () => {},
        () => {
          Toast.error(t('Failed to update note'));
        },
      )
      .then(() => {
        this.setState({ inProgress: false });
        this.props.refresh();
        this.props.getNote.refetch();
        onBack ? onBack(note) : this.props.hideModal();
      });
  };

  renderSkeleton() {
    return (
      <div className="edit-note-form">
        <Skeleton
          className="indented-form-group form-group"
          linesConfig={[
            { type: 'text', options: { width: '20%' } },
            { type: 'input' },
            { type: 'text', options: { width: '20%' } },
            { type: 'input', options: { height: '80px' } },
            { type: 'text', options: { width: '70%' } },
            { type: 'text', options: { width: '50%' } },
          ]}
        />
        <Skeleton
          className="footer"
          linesConfig={[
            { type: 'button', options: { display: 'inline-block', width: '15%' } },
            {
              type: 'button',
              options: { display: 'inline-block', width: '15%', marginLeft: '0.5rem' },
            },
          ]}
        />
      </div>
    );
  }

  render() {
    if (graphqlError({ ...this.props }) || graphqlLoading({ ...this.props })) {
      return this.renderSkeleton();
    }

    const { inProgress, editMode } = this.state;
    const {
      getNote: { note },
      handleSubmit,
      onBack,
      enableEditingKeywords,
      forAllKeywords,
    } = this.props;

    const button = editMode ? (
      <Button theme="orange" submit disabled={inProgress}>
        {t('Save')}
      </Button>
    ) : (
      <Button theme="orange" onClick={this.handleEdit}>
        {t('Edit')}
      </Button>
    );

    return (
      <form className="edit-note-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <div className="form-label required">{t('Date')}</div>
        <Field disabled={!editMode} component={DateField} name="createdAt" />
        <div className="form-label required">{t('Note')}</div>
        <Field
          disabled={!editMode}
          placeholder={t('Enter note')}
          component={TextAreaField}
          validate={Validation.required}
          name="note"
        />
        {editMode && enableEditingKeywords ? (
          <Fragment>
            <Field name="forAllKeywords" component={Checkbox} defaultChecked={forAllKeywords}>
              {t('Add for all keywords')}
            </Field>
            <div className="form-label">
              {!forAllKeywords ? t('Keywords') : t('Keywords to exclude')}
            </div>
            <Field name="keywords" component={KeywordsInputField} />
          </Fragment>
        ) : (
          !!note.keywords.length && (
            <Fragment>
              <div className="form-label">
                {t('Is this note only related to certain keywords?')}
              </div>
              <div className="keywords">
                {note.keywords.map(keyword => (
                  <span key={uniqueId('related-keyword')}>{keyword.keyword}</span>
                ))}
              </div>
            </Fragment>
          )
        )}
        <div className="text-right confirmation-button-wrapper">
          {inProgress && <LoadingSpinner />}
          <Button
            theme="grey"
            disabled={inProgress}
            onClick={onBack ? () => onBack(note) : this.props.hideModal}
          >
            {onBack ? t('Back') : t('Close')}
          </Button>
          {button}
        </div>
      </form>
    );
  }
}

const updateNoteQuery = gql`
  mutation editNoteForm_updateNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
      note {
        id
      }
    }
  }
`;

const getNoteQuery = gql`
  query editNoteForm_getNote($id: ID!) {
    note(id: $id) {
      id
      createdAt
      note
      keywords {
        id
        keyword
      }
    }
  }
`;

const formName = 'EditNoteForm';
const formSelector = formValueSelector(formName);

const mapStateToProps = state => ({
  forAllKeywords: formSelector(state, 'forAllKeywords'),
});

export default compose(
  connect(mapStateToProps),
  graphql(updateNoteQuery, { name: 'updateNote' }),
  graphql(getNoteQuery, {
    name: 'getNote',
    options: (props: Props) => ({
      enableReinitialize: true,
      variables: {
        id: props.noteId,
      },
    }),
    props: ({ getNote, getNote: { loading, error } }) => {
      if (loading || error) {
        return { getNote };
      }

      const { note } = getNote;
      return {
        getNote,
        initialValues: {
          note: note.note,
          keywords: note.keywords
            ? note.keywords.map(({ id, keyword }) => ({ value: id, label: keyword }))
            : [],
          createdAt: new Date(note.createdAt),
        },
      };
    },
  }),
)(
  reduxForm({
    form: formName,
    enableReinitialize: true,
  })(EditNoteForm),
);
