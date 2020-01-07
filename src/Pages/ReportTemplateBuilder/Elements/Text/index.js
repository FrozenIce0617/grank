// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n/index';
import type { Text } from 'Types/ReportElement';
import TextArea from 'Components/Controls/TextArea';

type Props = {
  value: Text,
  onChange: Function,
};

class TextEditor extends React.Component<Props> {
  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange({
      ...this.props.value,
      text: event.currentTarget.value,
    });
  };

  render() {
    const value = this.props.value;
    return (
      <div>
        <TextArea
          placeholder={t('Insert a custom text')}
          value={value.text}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default TextEditor;
