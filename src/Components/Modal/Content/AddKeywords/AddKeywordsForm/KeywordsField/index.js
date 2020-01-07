// @flow
import * as React from 'react';
import TextArea from 'Components/Controls/TextArea';
import toFormField from 'Components/Forms/toFormField';

type Props = {
  className?: string,
  value: string[],
  onChange: Function,
  showError?: boolean,
  placeholder: string,
  disabled?: boolean,
};

class KeywordsField extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const textValue = event.currentTarget.value;
    const value = textValue.split('\n');
    this.props.onChange(value);
  };

  render() {
    const { value, showError, placeholder, disabled, className } = this.props;
    return (
      <TextArea
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        defaultValue={value.join('\n')}
        value={value.join('\n')}
        onChange={this.handleChange}
        showError={showError}
      />
    );
  }
}

export default toFormField(KeywordsField);
