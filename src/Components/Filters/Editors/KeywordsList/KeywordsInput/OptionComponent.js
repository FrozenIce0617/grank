// @flow
import * as React from 'react';
import { Tooltip } from 'reactstrap';

import RankOptions from 'Components/Table/TableRow/RankOptions';

type Props = {
  children: React.ReactNode,
  className: String,
  isDisabled: Boolean,
  isFocused: Boolean,
  isSelected: Boolean,
  onFocus: Function,
  onSelect: Function,
  option: Object,
};

class OptionComponent extends React.Component<Props> {
  state = {
    showCountryTooltip: false,
  };

  handleMouseDown = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  };

  handleToggleCountryTooltip = () => {
    this.setState({
      showCountryTooltip: !this.state.showCountryTooltip,
    });
  };

  render() {
    const { showCountryTooltip } = this.state;
    const { option: keywordObj, className } = this.props;

    return (
      <div onMouseDown={this.handleMouseDown} className={`${className} Select-option`}>
        <span className="mr-2">
          <RankOptions keywordData={keywordObj} />
        </span>
        <span
          id={`country-${keywordObj.value}`}
          className={`mr-2 flag-icon flag-icon-${keywordObj.countrylocale.countryCode.toLowerCase()}`}
          onMouseEnter={this.handleToggleCountryTooltip}
          onMouseLeave={this.handleToggleCountryTooltip}
        />
        <Tooltip
          target={`country-${keywordObj.value}`}
          delay={{ show: 0, hide: 0 }}
          placement="top"
          isOpen={showCountryTooltip}
        >
          {keywordObj.location}, {keywordObj.countrylocale.region}
        </Tooltip>
        {this.props.children}
      </div>
    );
  }
}

export default OptionComponent;
