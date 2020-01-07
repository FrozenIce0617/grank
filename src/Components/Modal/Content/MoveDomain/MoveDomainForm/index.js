// @flow
import React, { Component } from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { compose, graphql, withApollo } from 'react-apollo';
import { FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import LoadingSpinner from 'Components/LoadingSpinner';
import { SelectAsync } from 'Components/Forms/Fields';
import Validator from 'Utilities/validation';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';
import Toast from 'Components/Toast';
import { showModal } from 'Actions/ModalAction';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';

type Props = {
  handleSubmit: Function,
  submitting: boolean,
  invalid: boolean,

  moveDomain: Function,
};

const groupAndDomainQuery = gql`
  query moveDomainForm_groupAndDomain($clientId: String!, $domainId: String!) {
    domainsSearch(query: $domainId) {
      id
      domain
      client {
        id
        organization {
          id
          name
        }
      }
    }
    clientsSearch(query: $clientId) {
      id
      name
      organization {
        id
        name
      }
    }
  }
`;

const domainsQuery = gql`
  query reportABugForm_domains($searchQuery: String!) {
    domainsSearch(query: $searchQuery) {
      id
      domain
      displayName
    }
  }
`;

const groupsQuery = gql`
  query reportABugForm_groups($searchQuery: String!) {
    clientsSearch(query: $searchQuery) {
      id
      name
    }
  }
`;

class MoveDomainForm extends Component<Props> {
  handleConfirm = data => {
    return this.props
      .moveDomain({
        variables: {
          input: {
            id: data.domain.id,
            client: data.client.id,
          },
        },
      })
      .then(({ data: { moveDomain: { errors } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        }
        Toast.success(t('Domain moved'));
      }, throwNetworkError);
  };

  handleSubmit = data => {
    return this.props.client
      .query({
        query: groupAndDomainQuery,
        variables: {
          domainId: data.domain.value,
          clientId: data.group.value,
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data: { domainsSearch: domains, clientsSearch: clients } }) => {
        const domain = domains[0];
        const client = clients[0];
        this.props.showModal({
          modalType: 'Confirmation',
          modalProps: {
            cancelLabel: t('Back'),
            confirmLabel: t('Move domain'),
            lockDuration: 0,
            title: t('Move domain?'),
            description: t(
              'Are you sure you wish to move: %s (%s) from organization %s (%s) to %s (%s) on organization %s (%s).',
              domain.domain,
              domain.id,
              domain.client.organization.name,
              domain.client.organization.id,
              client.name,
              client.id,
              client.organization.name,
              client.organization.id,
            ),
            action: () => this.handleConfirm({ domain, client }),
            cancelAction: () =>
              this.props.showModal({
                modalType: 'MoveDomain',
                modalProps: {
                  initialValues: data,
                },
              }),
          },
        });
      });
  };

  domainOptionsLoader = (query: string) => {
    return this.props.client
      .query({
        query: domainsQuery,
        variables: {
          searchQuery: query,
        },
      })
      .then(({ data: { domainsSearch } }) => ({
        options: domainsSearch.map(domain => ({
          label: `(${domain.id}) ${domain.displayName ? `${domain.displayName} ` : ''}${
            domain.domain
          }`,
          value: domain.id,
        })),
        complete: true,
      }));
  };

  groupOptionsLoader = (query: string) => {
    return this.props.client
      .query({
        query: groupsQuery,
        variables: {
          searchQuery: query,
        },
      })
      .then(({ data: { clientsSearch } }) => ({
        options: clientsSearch.map(client => ({
          label: `(${client.id}) ${client.name}`,
          value: client.id,
        })),
        complete: true,
      }));
  };

  render() {
    const { handleSubmit, invalid, submitting } = this.props;

    const loadingSpinner = submitting ? <LoadingSpinner /> : null;
    return (
      <form className="move-domain-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <FormGroup className="indented-form-group">
          {t('Use this form to move domain to the group.')}
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="form-label required">{t('Domain')}</div>
          <Field
            name="domain"
            type="text"
            placeholder={t('Select domain')}
            loadOptions={this.domainOptionsLoader}
            component={SelectAsync}
            validate={[Validator.required]}
          />
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="form-label required">{t('Group')}</div>
          <Field
            name="group"
            type="text"
            placeholder={t('Select group')}
            loadOptions={this.groupOptionsLoader}
            component={SelectAsync}
            validate={[Validator.required]}
          />
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="confirmation-button-wrapper text-right">
            {loadingSpinner}
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Move domain')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

const moveDomainMutations = gql`
  mutation moveDomainForm_moveDomain($input: MoveDomainInput!) {
    moveDomain(input: $input) {
      errors {
        messages
        field
      }
    }
  }
`;

export default compose(
  withApollo,
  connect(
    null,
    { showModal },
  ),
  graphql(moveDomainMutations, { name: 'moveDomain' }),
  reduxForm({
    form: 'MoveDomainForm',
  }),
)(MoveDomainForm);
