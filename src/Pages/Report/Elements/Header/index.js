// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import getFiltersPeriod from '../../getFiltersPeriod';

import './report-header.scss';

type Settings = {
  show_your_logo: { value: boolean },
};

type Props = {
  onLoad: Function,
  loading: boolean,
  name: string,
  logo: string,
  filters: FilterBase[],
  settings: Settings,
};

class Header extends React.Component<Props> {
  render() {
    const { loading, settings, logo, name } = this.props;
    const showLogo = settings.show_your_logo.value && logo !== '';
    if (loading) {
      return null;
    }
    const filterPeriod = getFiltersPeriod(this.props.filters);
    this.props.onLoad();
    return (
      <div className="report-header">
        {showLogo && (
          <div className="logo-container">
            <img className="logo" src={logo} />
          </div>
        )}
        <h5>
          {t('Report for')}
          <br />
          {name}
        </h5>
        <div className="date-range ">{filterPeriod}</div>
        <hr />
      </div>
    );
  }
}

const userQuery = gql`
  query header_user {
    user {
      id
      organization {
        id
        name
        logo
      }
    }
  }
`;

export default graphql(userQuery, {
  props: ({ ownProps, data: { loading, user } }) => ({
    ...ownProps,
    loading,
    name: user ? user.organization.name : '',
    logo: user ? user.organization.logo : '',
  }),
})(Header);
