// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Field, reduxForm } from 'redux-form';
import { Select, TextField } from 'Components/Forms/Fields';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import Validator from 'Utilities/validation';
import { throwNetworkError } from 'Utilities/errors';
import underdash from 'Utilities/underdash';
import { Col, FormGroup } from 'reactstrap';

type Props = {
  hideModal: Function,
  handleSubmit: Function,
  organizationId: number,
};

class LockOrganization extends Component<Props> {
  onSubmit = ({ type, blockedDomainIds }) => {
    return this.props
      .lockOrganizationMutation({
        variables: {
          input: {
            organizationId: this.props.organizationId,
            type: type.value,
            blockedDomainIds: blockedDomainIds ? blockedDomainIds.map(e => e.value) : [],
          },
        },
      })
      .then(({ data: { lockOrganization: { errors } } }) => {
        if (errors.length > 0) {
          Toast.error(errors[0].messages[0]);
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('Organization locked'));
          window.location.reload();
        }
      }, throwNetworkError);
  };

  renderBody() {
    const { invalid, submitting, handleSubmit, organizationQuery } = this.props;

    if (underdash.graphqlLoading({ ...this.props })) {
      return <div>loading</div>;
    }

    const domains = [];

    organizationQuery.adminOrganization.clients.forEach(client => {
      client.domains.forEach(domain => {
        domains.push({
          value: domain.id,
          label: `[${client.name}] (${domain.displayName}) ${domain.domain}`,
        });
      });
    });

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label">{t('Type')}</div>
            <Field
              name="type"
              defaultBehaviour
              component={Select}
              options={[
                {
                  value: 1,
                  label: t('Abuse'),
                },
                {
                  value: 2,
                  label: t('No contact'),
                },
              ]}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>

        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label">{t('Blacklist domains')}</div>
            <Field
              name="blockedDomainIds"
              multi
              defaultBehaviour
              component={Select}
              options={domains}
            />
          </Col>
        </FormGroup>

        <div className="footer">
          <Button theme="orange" submit disabled={invalid || submitting}>
            {t('Lock Account')}
          </Button>
        </div>
      </form>
    );
  }

  render() {
    return (
      <ModalBorder
        className="edit-group"
        title={t('Lock Organization')}
        onClose={this.props.hideModal}
      >
        {this.renderBody()}
      </ModalBorder>
    );
  }
}

const lockOrganizationMutation = gql`
  mutation lockOrganizationForm_lockOrganizationMutation($input: LockOrganizationInput!) {
    lockOrganization(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const organizationQuery = gql`
  query lockOrganizationForm_organizationQuery($id: ID!) {
    adminOrganization(id: $id) {
      id
      clients {
        id
        name
        domains {
          id
          domain
          displayName
        }
      }
    }
  }
`;

const LockOrganizationForm = reduxForm({
  form: 'LockOrganizationForm',
  enableReinitialize: true,
})(LockOrganization);

const mapStateToProps = state => {
  return {
    user: state.user,
  };
};

export default compose(
  connect(
    mapStateToProps,
    { hideModal },
  ),
  graphql(lockOrganizationMutation, { name: 'lockOrganizationMutation' }),
  graphql(organizationQuery, {
    name: 'organizationQuery',
    options: props => ({
      fetchPolicy: 'network-only',
      variables: {
        id: props.organizationId,
      },
    }),
  }),
)(LockOrganizationForm);
