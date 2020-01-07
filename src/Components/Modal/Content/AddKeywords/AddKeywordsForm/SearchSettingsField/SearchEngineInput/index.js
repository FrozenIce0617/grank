// @flow
import * as React from 'react';
import CheckBox from 'Components/Controls/Checkbox';
import DesktopIcon from 'icons/monitor.svg?inline';
import MobileIcon from 'icons/mobile.svg?inline';
import './search-type-input.scss';
import { MOBILE, DESKTOP } from 'Types/Filter';
import type { SearchEngine } from '../../types';

type Props = {
  value: SearchEngine,
  onChange: Function,
  showError?: boolean,
  disabled?: boolean,
};

class SearchTypeInput extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  handleDesktopChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked;
    const searchTypes = this.props.value.searchTypes;
    let newSearchTypes;
    if (checked) {
      newSearchTypes = [...searchTypes, DESKTOP];
    } else {
      newSearchTypes = searchTypes.filter(searchType => searchType !== DESKTOP);
    }
    this.props.onChange({
      ...this.props.value,
      searchTypes: newSearchTypes,
    });
  };

  handleMobileChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked;
    const searchTypes = this.props.value.searchTypes;
    let newSearchTypes;
    if (checked) {
      newSearchTypes = [...searchTypes, MOBILE];
    } else {
      newSearchTypes = searchTypes.filter(searchType => searchType !== MOBILE);
    }
    this.props.onChange({
      ...this.props.value,
      searchTypes: newSearchTypes,
    });
  };

  render() {
    const { value, showError, disabled } = this.props;
    const isMobile = value.searchTypes.indexOf(MOBILE) !== -1;
    const isDesktop = value.searchTypes.indexOf(DESKTOP) !== -1;
    return (
      <div className="search-type-input">
        <span className="search-engine-name">{value.id}</span>
        <CheckBox
          disabled={disabled}
          showError={showError}
          checked={isDesktop}
          onChange={this.handleDesktopChange}
        >
          {<DesktopIcon className="icon" />}
        </CheckBox>
        <CheckBox
          disabled={disabled}
          showError={showError}
          checked={isMobile}
          onChange={this.handleMobileChange}
        >
          {<MobileIcon className="icon" />}
        </CheckBox>
      </div>
    );
  }
}

export default SearchTypeInput;
