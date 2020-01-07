// @flow
import * as React from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import RemoveIcon from 'icons/close-2.svg?inline';
import './location-field.scss';

type Props = {
  placeholder: string,
  value: string,
  onChange: Function,
  onDelete?: Function,
  canDelete?: boolean,
  selectedCountry?: Object,
  disabled?: boolean,
};

class LocationInput extends React.Component<Props> {
  static defaultProps = {
    canDelete: false,
    disabled: false,
  };

  renderDeleteButton() {
    if (!this.props.onDelete || !this.props.canDelete) return;
    return <RemoveIcon className="remove-icon" onClick={this.props.onDelete} />;
  }

  render() {
    const { selectedCountry } = this.props;

    const inputProps = {
      placeholder: this.props.placeholder,
      value: this.props.value,
      onChange: this.props.onChange,
      disabled: this.props.disabled,
    };

    const cssClasses = {
      input: 'text-input-control',
      autocompleteContainer: 'autocomplete-container',
      autocompleteItem: 'autocomplete-item',
    };

    const options: Object = {
      types: ['(cities)'],
    };

    if (selectedCountry) {
      options.componentRestrictions = { country: selectedCountry };
    }

    return (
      <span>
        <PlacesAutocomplete options={options} inputProps={inputProps} classNames={cssClasses} />
        {this.renderDeleteButton()}
      </span>
    );
  }
}

export default LocationInput;
