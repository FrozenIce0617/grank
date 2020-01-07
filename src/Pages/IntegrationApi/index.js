// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import { Container, Row, Col, Table } from 'reactstrap';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { INTEGRATIONS_API } from 'Pages/Layout/ActionsMenu';
import { showModal } from 'Actions/ModalAction';
import { t, tct } from 'Utilities/i18n';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import './integration-api.scss';
import underdash from 'Utilities/underdash';
import { encodeFilters } from 'Components/Filters/serialization';

type Props = {
  showModal: Function,
};

class IntegrationApiPage extends Component<Props> {
  getFilters() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return [];
    }

    return this.props.apiFilters.user.organization.apiFilters;
  }

  renderBody() {
    return (
      <tbody>
        {this.getFilters().map(filter => {
          // let filters = JSON.parse(filter.filters);
          // const filterHash = encodeFilters(filters);

          return (
            <tr key={filter.id}>
              <td>{filter.id}</td>
              <td>{filter.name}</td>
              <td />
            </tr>
          );
        })}
      </tbody>
    );
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={INTEGRATIONS_API} />
        <Container fluid className="integration-api content-container">
          <div className="p-3">
            <p className="alert alert-info">
              {tct(
                'API filters can be used to setup filters that you can apply on API call. You create an API filter by creating a normal keywords filter and then converting it to an API filter. Learn how to use API filters in the [link:API docs].',
                {
                  link: <Link to={'/api#section/Using-filter'} />,
                },
              )}
            </p>
          </div>

          <Table className="data-table">
            <thead>
              <tr>
                <th>{t('ID')}</th>
                <th>{t('Name')}</th>
                <th />
              </tr>
            </thead>
            {this.renderBody()}
          </Table>
        </Container>
      </DashboardTemplate>
    );
  }
}

const options: Object = { fetchPolicy: 'network-only' };

const apiFiltersQuery = gql`
  query integrationApiPage_apiFilters {
    user {
      id
      apiToken
      organization {
        id
        apiFilters {
          id
          name
          createdAt
          filters
        }
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal },
  ),
  graphql(apiFiltersQuery, {
    name: 'apiFilters',
    options,
  }),
)(IntegrationApiPage);
