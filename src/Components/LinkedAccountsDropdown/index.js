// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AsyncSelect } from 'Components/Controls/Select';
import { compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { redirectToExternalUrl } from 'Utilities/underdash';
import AtoDjango from 'Utilities/django';
import { t } from 'Utilities/i18n';
import { clearEverything } from 'Actions/ResetAction';
import toast from 'Components/Toast';
import './linked-account-dropdown.scss';

type Props = {
  client: Object,
  user: Object,
  clearEverything: Function,
};

const linkedOrganizationsQuery = gql`
  query linkedAccountsDropdown_linkedOrganizations($searchQuery: String!) {
    linkedOrganizations(name: $searchQuery) {
      id
      name
      multiAccountLink {
        id
      }
    }
  }
`;

class LinkedAccountsDropdown extends Component<Props> {
  getOptions = query => {
    if (!query || query.length < 3) {
      return Promise.resolve({
        options: [],
        complete: true,
      });
    }
    return this.props.client
      .query({
        query: linkedOrganizationsQuery,
        variables: {
          searchQuery: query,
        },
      })
      .then(({ data }) => ({
        options: data.linkedOrganizations.map(organization => ({
          value: organization.id,
          label: organization.name,
          ...organization,
        })),
        complete: true,
      }));
  };

  handleChange = (selectedItem: any) => {
    if (selectedItem.multiAccountLink) {
      this.props.clearEverything();
      redirectToExternalUrl(`/org/multiaccount/change/${selectedItem.multiAccountLink.id}/`);
    } else {
      toast.error(t('You are already on the selected account.'));
    }
  };

  logoutClick = () => this.props.clearEverything();

  renderArrow = () => <div className="dropdown-arrow" />;

  renderLogoutButton = () => (
    <AtoDjango
      onClick={this.logoutClick}
      href={'/org/multiaccount/logout/'}
      className="btn btn-red"
    >
      {t('Logout from account')}
    </AtoDjango>
  );

  renderSelect() {
    return (
      <AsyncSelect
        name="linked-account"
        className={'linked-account-select'}
        onChange={this.handleChange}
        clearable={false}
        searchable={true}
        arrowRenderer={this.renderArrow}
        loadOptions={this.getOptions}
        placeholder={t('Change account')}
        cache={false}
        hideLabel
        debounceInterval={300}
        minQueryLength={3}
        autoload={false}
      />
    );
  }

  render() {
    if (this.props.user.isOnMultiaccount) {
      return (
        <span className="linked-account-select-wrapper">
          {this.renderLogoutButton()}
          {this.renderSelect()}
        </span>
      );
    }
    if (!this.props.user.organization.isPartner) return null;
    return <span className="linked-account-select-wrapper">{this.renderSelect()}</span>;
  }
}

const mapStateToProps = ({ user }) => ({
  user,
});

export default compose(withApollo)(
  connect(
    mapStateToProps,
    { clearEverything },
  )(LinkedAccountsDropdown),
);
