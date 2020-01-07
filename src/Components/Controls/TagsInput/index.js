// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Creatable } from 'react-select';
import { chain } from 'lodash';
import { t } from 'Utilities/i18n/index';
import underdash from 'Utilities/underdash';
import CustomValueRenderer from './CustomValueRenderer';
import CustomClearRenderer from './CustomClearRenderer';
import { connect } from 'react-redux';
import { showModal } from 'Actions/ModalAction';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import FakeFiltersContext from 'Components/Filters/FakeFiltersContext';
import './form-tags-input.scss';

type Props = {
  domainId: Array<string> | null,
  autoFocus?: boolean,
  value: Array<string>,
  onChange: Function,
  placeholder: string,
  showError: boolean,
  tags: any,
  disabled?: boolean,
};

// Ugly bugfix for https://github.com/JedWatson/react-select/issues/1464
// This prevents from prompt text being part of the newly created option
Creatable.prototype.onOptionSelect = function(option) {
  if (option.className === 'Select-create-option-placeholder') {
    this.createNewOption();
  } else {
    this.select.selectValue(option);
  }
};

// This prevents submitting form before creating new option
// Without this hitting enter when "Create tag" prompt appeats just closes dialog
// rather than adding new option
Creatable.prototype.onInputKeyDown = function(event) {
  const { shouldKeyDownEventCreateNewOption, onInputKeyDown } = this.props;
  const focusedOption = this.select.getFocusedOption();
  if (
    focusedOption &&
    focusedOption.className === 'Select-create-option-placeholder' &&
    shouldKeyDownEventCreateNewOption({ keyCode: event.keyCode })
  ) {
    this.createNewOption();

    // Prevent decorated Select from doing anything additional with this keyDown event
    event.preventDefault();
    event.stopPropagation();
  } else if (onInputKeyDown) {
    onInputKeyDown(event);
  }
};

class TagsInput extends Component<Props> {
  static defaultProps = {
    value: [],
    onChange: () => {},
    showError: false,
    options: [],
    disabled: false,
  };

  handleChange = (selectVal: Array<*>) => {
    const newValue = selectVal.map(item => item.value);
    this.props.onChange(newValue);
  };

  render() {
    const { value, placeholder, showError } = this.props;
    const selectVal = value.map(optionValue => ({ value: optionValue, label: optionValue }));
    const isLoading =
      underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props });

    return (
      <FakeFiltersContext.Consumer>
        {({ domainId }) => {
          let options = [];

          let domainIds = domainId || this.props.domainId;
          if (domainIds) {
            domainIds = Array.isArray(domainIds) ? domainIds : [domainIds];
          }

          if (!isLoading) {
            options = domainIds
              ? this.props.tags.domainsList.filter(val => domainIds.includes(val.id))
              : this.props.tags.domainsList;

            options = chain(options)
              .flatMap('tags')
              .uniq()
              .sort()
              .map(val => ({ label: val, value: val }))
              .value();
          } else {
            options = [];
          }

          return (
            <Creatable
              className={`form-tags-input ${showError ? 'error' : ''}`}
              placeholder={placeholder}
              multi={true}
              disabled={this.props.disabled}
              value={selectVal}
              options={options}
              onChange={this.handleChange}
              valueComponent={CustomValueRenderer}
              promptTextCreator={label => `${t('Create tag "%s"', label)}`}
              clearRenderer={CustomClearRenderer}
            />
          );
        }}
      </FakeFiltersContext.Consumer>
    );
  }
}

const tagsQuery = gql`
  query tagsInput_domainsTags {
    domainsList {
      id
      tags
    }
  }
`;

const domainsFilterSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainFilter = domainsFilterSelector(state);
  return {
    domainId: !!domainFilter && domainFilter.value.length === 1 ? domainFilter.value[0] : null,
  };
};

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(tagsQuery, { name: 'tags', options: { fetchPolicy: 'network-only' } }),
)(TagsInput);
