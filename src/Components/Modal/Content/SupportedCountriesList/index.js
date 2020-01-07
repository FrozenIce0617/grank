//@flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import SkeletonTableBody from 'Components/Skeleton/TableBody';
import Skeleton from 'Components/Skeleton';

import { t } from 'Utilities/i18n';
import { graphqlOK } from 'Utilities/underdash';

import { hideModal } from 'Actions/ModalAction';

type Props = {
  hideModal: Function,
  countriesData: Object,
};

class SupportedCountriesList extends Component<Props> {
  renderSkeleton() {
    return (
      <SkeletonTableBody>
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '80%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '55%', marginBottom: '10px' } }]}
        />
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '40%', marginBottom: '10px' } }]}
        />
      </SkeletonTableBody>
    );
  }

  renderHead() {
    return (
      <thead>
        <tr>
          <th>{t('Country')}</th>
          <th>{t('Language')}</th>
          <th>{t('Use in CSV')}</th>
        </tr>
      </thead>
    );
  }

  renderBody() {
    if (!graphqlOK(this.props)) {
      return this.renderSkeleton();
    }

    const {
      countriesData: { countrylocales },
    } = this.props;
    return (
      <tbody>
        {countrylocales.map(item => (
          <tr key={item.id}>
            <td>{item.region}</td>
            <td>{item.locale}</td>
            <td>{`${item.localeShort}-${item.countryCode.toLowerCase()}`}</td>
          </tr>
        ))}
      </tbody>
    );
  }

  render() {
    return (
      <ModalBorder
        className="supported-countries-list-modal"
        title={t('List of countries')}
        onClose={this.props.hideModal}
      >
        <table className="data-table table">
          {this.renderHead()}
          {this.renderBody()}
        </table>
      </ModalBorder>
    );
  }
}

const getCountriesQuery = gql`
  query supportedCountriesList_countrylocales {
    countrylocales {
      id
      countryCode
      localeShort
      region
      locale
    }
  }
`;

export default compose(
  connect(
    null,
    { hideModal },
  ),
  graphql(getCountriesQuery, {
    name: 'countriesData',
    options: {
      fetchPolicy: 'network-only',
    },
  }),
)(SupportedCountriesList);
