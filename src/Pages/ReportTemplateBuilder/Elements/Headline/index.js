// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n/index';
import type { Headline } from 'Types/ReportElement';
import TextInput from 'Components/Controls/TextInput';

type Props = {
  value: Headline,
  onChange: Function,
};

class HeadlineEditor extends React.Component<Props> {
  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange({
      ...this.props.value,
      headline: event.currentTarget.value,
    });
  };

  render() {
    const value = this.props.value;
    return (
      <div>
        <TextInput
          placeholder={t('Insert a custom headline')}
          value={value.text}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default HeadlineEditor;
