// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AsyncSelect } from 'Components/Controls/Select';
import { compose, graphql } from 'react-apollo';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { redirectToExternalUrl } from 'Utilities/underdash';
import { FormattedNumber } from 'react-intl';
import StopImpersonating from './StopImpersonating';
import { clearEverything } from 'Actions/ResetAction';
import { t } from 'Utilities/i18n';

import './impersonate-dropdown.scss';

type Props = {
  client: Object,
  impersonateOrganizationsData: Object,
  user: Object,
  clearEverything: Function,
};

const impersonateOrganizationQuery = gql`
  query impersonateDropdown_impersonateOrganizations($searchQuery: String!) {
    organizations(name: $searchQuery) {
      id
      name
      slug
      active
      activePlan {
        id
        priceMonthly
        currency
      }
    }
  }
`;

class ImpersonateDropdown extends Component<Props> {
  getOptions = query => {
    if (!query || query.length < 3) {
      return Promise.resolve({
        options: [],
        complete: true,
      });
    }
    return this.props.client
      .query({
        query: impersonateOrganizationQuery,
        variables: {
          searchQuery: query,
        },
      })
      .then(({ data }) => ({
        options: data.organizations.map(organization => ({
          value: organization.id,
          label: `${organization.name} (${organization.id})`,
          ...organization,
        })),
        complete: true,
      }));
  };

  handleChange = (selectedItem: any) => {
    this.props.clearEverything();
    redirectToExternalUrl(`/accuranker_admin/impersonate_organization/${selectedItem.slug}/`);
  };

  renderArrow = () => <div className="dropdown-arrow" />;

  renderPrice(option: Object) {
    if (!option.active || !option.activePlan || !option.activePlan.hasOwnProperty('priceMonthly'))
      return null;
    return (
      <FormattedNumber
        style="currency"
        value={option.activePlan.priceMonthly}
        currency={option.activePlan.currency}
        currencyDisplay="symbol"
      />
    );
  }

  renderOptions = (option: any) => (
    <span>
      {option.label} {this.renderPrice(option)}
    </span>
  );

  render() {
    if (this.props.user.isImpersonating) {
      return <StopImpersonating />;
    }

    if (!this.props.user.salesManager) {
      return null;
    }

    return (
      <AsyncSelect
        name="impersonate-account"
        className={'impersonate-select'}
        onChange={this.handleChange}
        clearable={false}
        searchable={true}
        arrowRenderer={this.renderArrow}
        loadOptions={this.getOptions}
        placeholder={t('Impersonate account')}
        cache={false}
        hideLabel
        debounceInterval={300}
        optionRenderer={this.renderOptions}
        autoload={false}
      />
    );
  }
}

const options: Object = { fetchPolicy: 'network-only' };

const mapStateToProps = ({ user }) => ({
  user,
});

export default compose(
  withApollo,
  graphql(impersonateOrganizationQuery, {
    name: 'impersonateOrganizationsData',
    skip: () => true,
    options: ({ searchQuery }) => ({
      ...options,
      variables: {
        searchQuery: searchQuery || '',
      },
    }),
  }),
)(
  connect(
    mapStateToProps,
    { clearEverything },
  )(ImpersonateDropdown),
);
