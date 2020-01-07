// @flow
import * as React from 'react';
import { uniqueId } from 'lodash';
import './radiobutton-group.scss';

type Props = {
  name: string,
  onChange: Function,
  value: string,
  children: React.Node,
  disabled?: boolean,
};

class RadioButtonGroup extends React.Component<Props> {
  static defaultProps = {
    children: null,
    disabled: false,
  };

  getRadioButtonProps(optionProps: any) {
    const { name, value } = this.props;
    return {
      checked: optionProps.value === value,
      name: name == null ? this.defaultGroupName : name,
      onChange: this.handleOptionChange,
      disabled: this.props.disabled,
    };
  }

  handleOptionChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange(event.currentTarget.value);
  };

  isRadio(child: any): boolean {
    return child != null && child.type.displayName === 'RadioButton';
  }

  defaultGroupName = uniqueId('radiobuttongroup');

  renderChildren() {
    return React.Children.map(this.props.children, child => {
      if (this.isRadio(child)) {
        return React.cloneElement(child, this.getRadioButtonProps(child.props));
      }
      return child;
    });
  }

  render() {
    return <div className="radiobutton-group">{this.renderChildren()}</div>;
  }
}

export default RadioButtonGroup;
