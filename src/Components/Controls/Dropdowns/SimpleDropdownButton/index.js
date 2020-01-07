// @flow
import * as React from 'react';
import IconButton from 'Components/IconButton';

type Props = {
  item?: ?any,
  placeholder?: string,
  labelFunc?: Function,
  icon?: React.Node,
};

class DropdownButton extends React.Component<Props> {
  static defaultProps = {
    labelFunc: item => item,
    item: null,
    placeholder: '',
  };

  render() {
    const { placeholder, item, labelFunc, icon } = this.props;
    const label = item && labelFunc ? labelFunc(item) : placeholder;
    return (
      <div className="dropdown-arrow">
        <IconButton title={item && placeholder ? placeholder : ''} icon={icon}>
          {label}
        </IconButton>
      </div>
    );
  }
}

export default DropdownButton;
