// @flow
import * as React from 'react';
import { Field, reduxForm } from 'redux-form';
import { TextAreaField, DateField, Select, TextField } from 'Components/Forms/Fields';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import Validation from 'Utilities/validation';

type Props = {
  inProgress: boolean,
  handleSubmit: Function,
  onCancel: Function,
};

class AddGoalForm extends React.Component<Props> {
  render() {
    const { inProgress, onCancel, handleSubmit } = this.props;

    return (
      <form className="add-note-form">
        <div className="form-label required">{t('Date')}</div>
        <Field component={DateField} name="date" validate={Validation.required} />

        <div className="form-label required">{t('Metric')}</div>
        <Field
          component={Select}
          defaultBehaviour
          useFirstOptionAsDefault
          options={[
            { value: 'mrr.total', label: 'MRR' },
            // { value: 'arr', label: 'ARR', disabled: true },
            // { value: 'arpa', label: 'ARPA', disabled: true },
          ]}
          validate={Validation.required}
          name="metric"
        />

        <div className="form-label required">{t('Value')}</div>
        <Field component={TextField} type="number" validate={Validation.required} name="value" />

        <div className="form-label required">{t('Note')}</div>
        <Field
          placeholder={t('Enter note')}
          component={TextAreaField}
          validate={Validation.required}
          name="note"
        />

        <div className="footer">
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

export default reduxForm({
  form: 'AddGoalForm',
})(AddGoalForm);
