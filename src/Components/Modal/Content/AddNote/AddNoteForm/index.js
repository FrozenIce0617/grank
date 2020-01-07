// @flow
import React, { Fragment } from 'react';
import { Field, formValueSelector, reduxForm } from 'redux-form';
import { TextAreaField, DateField, KeywordsInputField, Checkbox } from 'Components/Forms/Fields';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import Validation from 'Utilities/validation';
import { uniqueId } from 'lodash';
import LoadingSpinner from 'Components/LoadingSpinner';

import './add-note-form.scss';
import connect from 'react-redux/es/connect/connect';

type Keyword = {
  id: string,
  keyword: string,
};

type Props = {
  inProgress: boolean,
  handleSubmit: Function,
  keywords: Keyword[],
  onCancel: Function,
  shouldExclude: boolean,
  enableAddingKeywords: boolean,
};

class AddNoteForm extends React.Component<Props> {
  render() {
    const {
      inProgress,
      onCancel,
      handleSubmit,
      shouldExclude,
      keywords,
      enableAddingKeywords,
    } = this.props;
    return (
      <form className="add-note-form">
        <div className="form-label required">{t('Date')}</div>
        <Field component={DateField} name="createdAt" />
        <div className="form-label required">{t('Note')}</div>
        <Field
          placeholder={t('Enter note')}
          component={TextAreaField}
          validate={Validation.required}
          name="note"
        />
        {enableAddingKeywords ? (
          <Fragment>
            <Field name="forAllKeywords" component={Checkbox} defaultChecked={shouldExclude}>
              {t('Add for all keywords')}
            </Field>
            <div className="form-label">
              {!shouldExclude ? t('Keywords') : t('Keywords to exclude')}
            </div>
            <Field name="keywords" component={KeywordsInputField} />
          </Fragment>
        ) : (
          <Fragment>
            <div key="label" className="form-label">
              {!shouldExclude
                ? t('The note will reference the following keywords:')
                : keywords.length
                  ? t('The note will reference all keywords excluding these:')
                  : t('The note will reference all keywords') // TODO rename it when we will be able to add note for excluded keywords with filters
              }
            </div>
            {!!keywords.length && (
              <div key="keywords" className="keywords">
                {keywords.map(keyword => (
                  <span key={uniqueId('related-keyword')}>{keyword.keyword}</span>
                ))}
              </div>
            )}
          </Fragment>
        )}
        <div className="text-right confirmation-button-wrapper">
          {inProgress && <LoadingSpinner />}
          <Button theme="grey" disabled={inProgress} onClick={onCancel}>
            {t('Cancel')}
          </Button>
          <Button theme="orange" disabled={inProgress} onClick={handleSubmit}>
            {t('Add note')}
          </Button>
        </div>
      </form>
    );
  }
}

const formName = 'AddNoteForm';
const formSelector = formValueSelector(formName);

const mapStateToProps = (state, props) => ({
  initialValues: {
    createdAt: new Date(),
    keywords: props.keywords.map(({ id, keyword }) => ({ value: id, label: keyword })),
    forAllKeywords: props.shouldExclude,
  },
  shouldExclude: props.shouldExclude || formSelector(state, 'forAllKeywords'),
});

export default connect(mapStateToProps)(
  reduxForm({
    form: formName,
  })(AddNoteForm),
);
