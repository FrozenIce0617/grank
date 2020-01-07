// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Field, reduxForm } from 'redux-form';
import { TextField, Checkbox } from 'Components/Forms/Fields';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import Validator from 'Utilities/validation';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';
import underdash from 'Utilities/underdash';

type Props = {
  hideModal: Function,
  handleSubmit: Function,

  planId: number,
};

class SalesOrganizationPlan extends Component<Props> {
  handleSubmit = ({ maxKeywords, maxCompetitors, featureAdvancedMetrics, featureApiAccess }) => {
    const input = {
      planId: this.props.planId,
      maxKeywords,
      maxCompetitors,
      featureAdvancedMetrics,
      featureApiAccess,
    };

    return this.props
      .updateOrganizationPlanMutation({
        variables: {
          input,
        },
      })
      .then(({ data: { updateOrganizationPlan: { errors } } }) => {
        if (errors.length > 0) {
          throwSubmitErrors(errors);
        } else {
          Toast.success(t('Plan updated'));
          window.location.reload();
          this.props.hideModal();
        }
      }, throwNetworkError);
  };

  render() {
    const { invalid, submitting, initialValues } = this.props;
    if (underdash.graphqlLoading({ ...this.props }) | !initialValues) {
      return <div>loading</div>;
    }

    return (
      <ModalBorder
        className="edit-group"
        title={t('Edit Organization Plan')}
        onClose={this.props.hideModal}
      >
        <form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
          <div className="form-label">{t('Max keywords')}</div>
          <Field
            name="maxKeywords"
            helpText={t('Amount of keywords available on this plan.')}
            component={TextField}
            disabled={submitting}
            validate={[Validator.required]}
          />

          <div className="form-label">{t('Max competitors')}</div>
          <Field
            name="maxCompetitors"
            helpText={t('Amount of competitors per domain available on this plan.')}
            component={TextField}
            disabled={submitting}
            validate={[Validator.required]}
          />

          <div className="form-label">{t('Advanced metrics')}</div>
          <Field
            name="featureAdvancedMetrics"
            helpText={t('Enable advanced metrics on this plan.')}
            component={Checkbox}
            disabled={submitting}
            defaultChecked={initialValues.featureAdvancedMetrics}
          />

          <div className="form-label">{t('API')}</div>
          <Field
            name="featureApiAccess"
            helpText={t('Enable API on this plan.')}
            component={Checkbox}
            disabled={submitting}
            defaultChecked={initialValues.featureApiAccess}
          />

          <div className="footer">
            <Button theme="orange" submit disabled={invalid || submitting}>
              {t('Save')}
            </Button>
          </div>
        </form>
      </ModalBorder>
    );
  }
}

const updateOrganizationPlanMutation = gql`
  mutation($input: UpdateOrganizationPlanInput!) {
    updateOrganizationPlan(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

const organizationPlanQuery = gql`
  query salesOrganizationPlan_organizationPlan($id: ID!) {
    adminOrganizationPlan(id: $id) {
      id
      maxKeywords
      maxCompetitors
      featureAdvancedMetrics
      featureApiAccess
    }
  }
`;

const SalesOrganizationPlanForm = reduxForm({
  form: 'SalesOrganizationPlanForm',
  enableReinitialize: true,
})(SalesOrganizationPlan);

export default compose(
  graphql(updateOrganizationPlanMutation, { name: 'updateOrganizationPlanMutation' }),
  graphql(organizationPlanQuery, {
    name: 'organizationPlan',
    options: (props: Props) => ({
      fetchPolicy: 'network-only',
      variables: {
        id: props.planId,
      },
    }),
    props: ({ ownProps, organizationPlan }) => {
      return {
        ...ownProps,
        initialValues: organizationPlan.adminOrganizationPlan,
      };
    },
  }),
  connect(
    null,
    { hideModal },
  ),
)(SalesOrganizationPlanForm);
