// @flow
import * as React from 'react';
import { Field, reduxForm } from 'redux-form';
import { TagsField } from 'Components/Forms/Fields';
import { t } from 'Utilities/i18n';
import Button from 'Components/Forms/Button';
import Validation from 'Utilities/validation';

type Props = {
  handleSubmit: Function,
  onCancel: Function,
};

class AddTagsForm extends React.Component<Props> {
  render() {
    return (
      <form>
        <div className="form-label required">{t('Tags')}</div>
        <Field
          placeholder={t('Select existing tags or enter new')}
          component={TagsField}
          validate={Validation.array}
          name="tags"
        />
        <div className="footer">
          <Button theme="grey" onClick={this.props.onCancel}>
            {t('Cancel')}
          </Button>
          <Button theme="orange" onClick={this.props.handleSubmit}>
            {t('Add tags')}
          </Button>
        </div>
      </form>
    );
  }
}

export default reduxForm({
  form: 'AddTagsForm',
})(AddTagsForm);
