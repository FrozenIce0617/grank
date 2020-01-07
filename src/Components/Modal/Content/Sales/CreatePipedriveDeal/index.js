// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Field, reduxForm } from 'redux-form';
import { Select } from 'Components/Forms/Fields';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import Validator from 'Utilities/validation';
import { throwNetworkError } from 'Utilities/errors';
import underdash from 'Utilities/underdash';

type Props = {
  hideModal: Function,
  onSuccess: Function,
  handleSubmit: Function,
  organizationId: number,
};

class SalesCreatePipedriveDeal extends Component<Props> {
  onSubmit = ({ pipelineId }) => {
    return this.props
      .pipedriveCreateDealMutation({
        variables: {
          input: {
            organizationId: this.props.organizationId,
            pipelineId: pipelineId.value,
          },
        },
      })
      .then(({ data: { pipedriveCreateDeal: { errors } } }) => {
        if (errors.length > 0) {
          Toast.error(errors[0].messages[0]);
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('Pipedrive updated'));
          this.props.hideModal();
          this.props.onSuccess && this.props.onSuccess();
        }
      }, throwNetworkError);
  };

  renderBody() {
    const { invalid, submitting, handleSubmit, adminSalesPipedrivePipelinesQuery } = this.props;

    if (underdash.graphqlLoading({ ...this.props })) {
      return <div>loading</div>;
    }

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <div className="form-label">{t('Select Pipeline')}</div>
        <Field
          name="pipelineId"
          defaultBehaviour
          component={Select}
          options={adminSalesPipedrivePipelinesQuery.adminSalesPipedrivePipelines
            .filter(e => e.name !== 'Churn')
            .map(e => ({
              value: e.id,
              label: e.name,
            }))}
          validate={Validator.required}
        />

        <div className="footer">
          <Button theme="orange" submit disabled={invalid || submitting}>
            {t('Create')}
          </Button>
        </div>
      </form>
    );
  }

  render() {
    return (
      <ModalBorder
        className="edit-group"
        title={t('Create Pipedrive Deal')}
        onClose={this.props.hideModal}
      >
        {this.renderBody()}
      </ModalBorder>
    );
  }
}

const pipedriveCreateDealMutation = gql`
  mutation salesPipedrivePipelineForm_pipedriveCreateDeal($input: PipeDriveCreateDealInput!) {
    pipedriveCreateDeal(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const adminSalesPipedrivePipelinesQuery = gql`
  query salesOrganizationPlan_adminSalesPipedrivePipelines {
    adminSalesPipedrivePipelines {
      id
      name
    }
  }
`;

const SalesPipedrivePipelineForm = reduxForm({
  form: 'SalesPipedrivePipelineForm',
  enableReinitialize: true,
})(SalesCreatePipedriveDeal);

export default compose(
  connect(
    null,
    { hideModal },
  ),
  graphql(pipedriveCreateDealMutation, { name: 'pipedriveCreateDealMutation' }),
  graphql(adminSalesPipedrivePipelinesQuery, {
    name: 'adminSalesPipedrivePipelinesQuery',
  }),
)(SalesPipedrivePipelineForm);
