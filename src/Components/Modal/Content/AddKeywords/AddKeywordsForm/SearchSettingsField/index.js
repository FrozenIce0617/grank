// @flow
import * as React from 'react';
import toFormField from 'Components/Forms/toFormField';
import SearchEngineInput from './SearchEngineInput';
import './search-settings-input.scss';
import type { SearchEngine } from '../types';

type Props = {
  value: SearchEngine[],
  onChange: Function,
  showError?: boolean,
  disabled?: boolean,
};

class SearchSettingsInput extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  handleSearchEngineChange = (newSearchEngine: SearchEngine) => {
    this.props.onChange(
      this.props.value.map(
        searchEngine => (searchEngine.id === newSearchEngine.id ? newSearchEngine : searchEngine),
      ),
    );
  };

  render() {
    const { value, disabled, showError } = this.props;
    return (
      <div className="search-settings-input">
        {value.map(searchEngine => (
          <SearchEngineInput
            disabled={disabled}
            key={searchEngine.id}
            value={searchEngine}
            onChange={this.handleSearchEngineChange}
          />
        ))}
      </div>
    );
  }
}

export default toFormField(SearchSettingsInput);
