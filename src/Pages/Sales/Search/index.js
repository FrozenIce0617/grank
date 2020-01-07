// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate/index';
import ActionsMenu, { SALES_SEARCH } from 'Pages/Layout/ActionsMenu/index';
import { Container } from 'reactstrap';
import { compose, withApollo, graphql } from 'react-apollo';
import { uniqueId } from 'lodash';
import { t } from 'Utilities/i18n/index';
import { Link } from 'react-router-dom';
import './sales-search.scss';
import { withRouter } from 'react-router-dom';
import Loader from 'Components/Loader';

type Props = {
  q: String,
  history: Object,
};

type State = {
  types: [String],
  results: [Obj],
  loading: Boolean,
};

// types
const AdminSearchTypes = {
  USER: 1,
  DOMAIN: 2,
  ORGANIZATION: 3,
  CLIENT: 4,
  PAYMENT_CONTACT: 5,
};

const adminSearchQuery = gql`
  query salesSearch_adminSearch($q: String!, $types: [Int]!) {
    adminSearch(q: $q, types: $types) {
      objId
      name
      type
      data
    }
  }
`;

class SalesSearch extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      types: [
        AdminSearchTypes.USER,
        AdminSearchTypes.DOMAIN,
        AdminSearchTypes.ORGANIZATION,
        AdminSearchTypes.CLIENT,
        AdminSearchTypes.PAYMENT_CONTACT,
      ],
      results: [],
      loading: false,
    };

    this.search(props.q); // initial search
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    const q = this._search_input.value;
    this.search(q);
  };

  search(q) {
    if (q.toString().length < 1) return;
    const { history } = this.props;
    history.push({
      pathname: '/sales/search',
      search: `?q=${q}`,
    });

    this.setState({
      loading: true,
      results: [],
    });

    this.props.client
      .query({
        query: adminSearchQuery,
        variables: {
          q,
          types: this.state.types,
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        this.setState({
          loading: false,
          results: data.adminSearch,
        });
      });
  }

  getOrganizationLink(data) {
    const json = JSON.parse(data.data);
    const id = json.organization_id;

    return `/sales/organization/${id}`;
  }

  handleChange = event => {
    this.setState({
      q: event.target.value,
    });
  };

  renderTypeBadge(type) {
    let className = 'badge badge-primary';
    let label = 'missing type';

    switch (type) {
      case AdminSearchTypes.USER:
        label = t('User');
        className = 'badge badge-primary';
        break;

      case AdminSearchTypes.DOMAIN:
        label = t('Domain');
        className = 'badge badge-success';
        break;

      case AdminSearchTypes.ORGANIZATION:
        label = t('Organization');
        className = 'badge badge-danger';
        break;

      case AdminSearchTypes.CLIENT:
        label = t('Group');
        className = 'badge badge-warning';
        break;

      case AdminSearchTypes.PAYMENT_CONTACT:
        label = t('Payment Contact');
        className = 'badge badge-info';
        break;

      default:
        break;
    }

    return <span className={className}>{label}</span>;
  }

  recordUserSession = id => {
    return this.props
      .shouldRecordSession({
        variables: {
          id,
        },
      })
      .then(() => {
        window.location.reload();
      });
  };

  renderOtherInfo(data) {
    const json = JSON.parse(data.data);

    switch (data.type) {
      case AdminSearchTypes.USER:
        return (
          <p>
            <span>
              {t('Email')}: {json.email}
            </span>
            <br />
            <span>
              {t('Is recording session')}:{' '}
              {json.is_recording_session ? (
                <span className="badge badge-success">{t('Yes')}</span>
              ) : (
                <button className="btn btn-link" onClick={() => this.recordUserSession(data.objId)}>
                  {t('Click to enable')}
                </button>
              )}
            </span>
            <br />
            <span>
              {t('Organization')}:{' '}
              <Link to={this.getOrganizationLink(data)}>
                #{json.organization_id} {json.organization}
              </Link>
            </span>
            <br />
            <span>
              {t('Organization Admin')}:{' '}
              {json.active ? (
                <span className="badge badge-success">{t('Yes')}</span>
              ) : (
                <span className="badge badge-danger">{t('No')}</span>
              )}
            </span>
            <br />
          </p>
        );

      case AdminSearchTypes.DOMAIN:
        return (
          <p>
            <span>
              {t('Group')}: #{json.client_id} {json.client}
            </span>
            <br />
            <span>
              {t('Organization')}:{' '}
              <Link to={this.getOrganizationLink(data)}>
                #{json.organization_id} {json.organization}
              </Link>
            </span>
          </p>
        );

      case AdminSearchTypes.ORGANIZATION:
        return (
          <p>
            <span>
              {t('Active')}:{' '}
              {json.active ? (
                <span className="badge badge-success">{t('Yes')}</span>
              ) : (
                <span className="badge badge-danger">{t('No')}</span>
              )}
            </span>
            <br />
          </p>
        );

      case AdminSearchTypes.CLIENT:
        return (
          <p>
            <span>
              {t('Organization')}:{' '}
              <Link to={this.getOrganizationLink(data)}>
                #{json.organization_id} {json.organization}
              </Link>
            </span>
          </p>
        );

      case AdminSearchTypes.PAYMENT_CONTACT:
        return (
          <p>
            <span>
              {t('VAT')}: {json.vat_no}
            </span>
            <br />
            <span>
              {t('Organization')}:{' '}
              <Link to={this.getOrganizationLink(data)}>
                #{json.organization_id} {json.organization}
              </Link>
            </span>
          </p>
        );

      default:
        break;
    }
  }

  renderResult(data) {
    return (
      <tr key={uniqueId(`adminsearch-${data.type}`)}>
        <th scope="row" className="align-middle">
          <Link to={this.getOrganizationLink(data)}>{data.objId}</Link>
        </th>
        <td className="align-middle">{this.renderTypeBadge(data.type)}</td>
        <td className="align-middle">{data.name}</td>
        <td className="align-middle">{this.renderOtherInfo(data)}</td>
      </tr>
    );
  }

  isTypeChecked(type) {
    return this.state.types.includes(type);
  }

  handleTypeChecked(type, checked) {
    let types = this.state.types;

    if (checked) {
      types.push(type);
    } else {
      types = types.filter(item => item !== type);
    }

    this.setState({
      types,
    });
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={SALES_SEARCH} hidePeriodFilter={true} />
        <Container className="generic-page sales-search" fluid>
          <input
            disabled={this.state.loading}
            placeholder={t(
              'Domain, Organization, User, Email, Name, ID, Anything... (Enter to search)',
            )}
            type="text"
            className="form-control"
            ref={input => (this._search_input = input)}
            onKeyPress={this.handleKeyPress}
          />

          <div className="row row-check">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                checked={this.isTypeChecked(AdminSearchTypes.USER)}
                onChange={e => this.handleTypeChecked(AdminSearchTypes.USER, e.target.checked)}
              />
              <label className="form-check-label">{t('User')}</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                checked={this.isTypeChecked(AdminSearchTypes.DOMAIN)}
                onChange={e => this.handleTypeChecked(AdminSearchTypes.DOMAIN, e.target.checked)}
              />
              <label className="form-check-label">{t('Domain')}</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                checked={this.isTypeChecked(AdminSearchTypes.ORGANIZATION)}
                onChange={e =>
                  this.handleTypeChecked(AdminSearchTypes.ORGANIZATION, e.target.checked)
                }
              />
              <label className="form-check-label">{t('Organization')}</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                checked={this.isTypeChecked(AdminSearchTypes.CLIENT)}
                onChange={e => this.handleTypeChecked(AdminSearchTypes.CLIENT, e.target.checked)}
              />
              <label className="form-check-label">{t('Group')}</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                checked={this.isTypeChecked(AdminSearchTypes.PAYMENT_CONTACT)}
                onChange={e =>
                  this.handleTypeChecked(AdminSearchTypes.PAYMENT_CONTACT, e.target.checked)
                }
              />
              <label className="form-check-label">{t('Payment Contact')}</label>
            </div>
          </div>

          {this.state.loading && (
            <div>
              <hr />

              <Loader style={{ height: '500px' }} />
            </div>
          )}

          {this.state.results.length > 0 && (
            <div>
              <br />

              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">{t('ID')}</th>
                    <th scope="col">{t('Type')}</th>
                    <th scope="col">{t('Name')}</th>
                    <th scope="col">{t('Other Information')}</th>
                  </tr>
                </thead>
                <tbody>{this.state.results.map(data => this.renderResult(data))}</tbody>
              </table>
            </div>
          )}
        </Container>
      </DashboardTemplate>
    );
  }
}

const mapStateToProps = (state, props) => {
  const params = new URLSearchParams(props.location.search);
  let q = params.get('q', '');

  if (!q) {
    q = '';
  }

  return {
    q,
  };
};

const shouldRecordSessionQuery = gql`
  mutation salesSearch_editUser($id: ID!) {
    shouldRecordSession(id: $id) {
      user {
        id
      }
    }
  }
`;

export default compose(
  graphql(shouldRecordSessionQuery, { name: 'shouldRecordSession' }),
  connect(
    mapStateToProps,
    null,
  ),
)(withRouter(withApollo(SalesSearch)));
