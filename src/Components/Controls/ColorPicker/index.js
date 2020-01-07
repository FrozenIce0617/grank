// @flow
import * as React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { ChromePicker } from 'react-color';
import ArrowsIcon from 'icons/arrows.svg?inline';
import './color-picker.scss';

type Props = {
  value: string,
  onChange: Function,
};

type Stats = {
  isOpen: boolean,
};

class ColorPicker extends React.Component<Props, Stats> {
  static defaultProps = {
    value: '#20bbd7',
  };

  state = {
    isOpen: false,
  };

  handleToggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  handleChange = (color: { hex: string }) => {
    this.props.onChange(color.hex);
  };

  render() {
    const { value } = this.props;
    const isOpen = this.state.isOpen;
    return (
      <Dropdown className="color-picker" isOpen={isOpen} toggle={this.handleToggle}>
        <DropdownToggle tag="div">
          <div className="color-picker-toggle">
            <div className="color-value" style={{ background: value }} />
            <div className="dropdown-button">
              <ArrowsIcon />
            </div>
          </div>
        </DropdownToggle>
        <DropdownMenu flip={false} right>
          <ChromePicker disableAlpha={true} color={value} onChange={this.handleChange} />
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default ColorPicker;
