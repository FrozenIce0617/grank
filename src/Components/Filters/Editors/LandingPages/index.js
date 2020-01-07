// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import LandingPagesInput from './LandingPagesInput';
import { Field } from 'redux-form';
import Validator from 'Utilities/validation';
import { FilterAttribute } from 'Types/Filter';
import type { DomainsFilter } from 'Types/Filter';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { withApollo } from 'react-apollo';
import toFormField from 'Components/Forms/toFormField';

type Props = {
  domains: string[],
};

const LandingPagesField = toFormField(LandingPagesInput);

class LandingPagesEditor extends Component<Props> {
  render() {
    return (
      <div>
        <Field
          name="value"
          domains={this.props.domains}
          component={LandingPagesField}
          validate={Validator.array}
        />
      </div>
    );
  }
}

const domainsSelector = SpecificFilterSelector(FilterAttribute.DOMAINS);

const mapStateToProps = state => {
  const domainsFilter: DomainsFilter = (domainsSelector(state): any);
  return {
    domains: domainsFilter.value,
  };
};

export default compose(
  connect(mapStateToProps),
  withApollo,
)(LandingPagesEditor);
