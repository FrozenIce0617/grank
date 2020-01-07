// @flow
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FormGroup, Col } from 'reactstrap';
import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import Button from 'Components/Forms/Button/index';
import type { FormProps } from 'redux-form';
import { showModal } from 'Actions/ModalAction';
import Toast from 'Components/Toast/index';
import {
  Checkbox,
  TextField,
  TextAreaField,
  DropdownField,
  DateField,
} from 'Components/Forms/Fields';
import './sales-create-plan-form.scss';

type Props = {
  onCancel: () => void,
  categories: Object[],
  createPlan: Function,
  onCreate: (planId: string) => void,
} & FormProps;

class CreatePlanForm extends Component<Props> {
  handleSubmit = (data: Object) => {
    return this.props
      .createPlan({
        variables: {
          input: {
            ...data,
            signonDiscount: data.signonDiscount || 0,
            signonDiscountMonths: data.signonDiscountMonths || 0,
          },
        },
      })
      .then(({ data: { createPlan: { plan, errors } } }) => {
        if (!plan) {
          Toast.error(errors[0].messages[0]);
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('New plan created'));
          this.props.onCreate(plan.id);
        }
      });
  };

  render() {
    const { handleSubmit, submitting, categories, initialValues } = this.props;
    return (
      <form className="sales-create-plan-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <Col md={6} xs={12}>
          <strong className="form-title not-numbered">{t('General')}</strong>
          <hr />
          <FormGroup className="indented-form-group">
            <div className="form-label required">{t('Category')}</div>
            <Field
              defaultBehaviour
              name="category"
              placeholder={t('Select category')}
              component={DropdownField}
              validate={Validator.required}
              items={categories}
              disabled
            />
          </FormGroup>
          <FormGroup className="indented-form-group">
            <div className="form-label required">{t('Name')}</div>
            <Field
              name="name"
              type="text"
              component={TextField}
              validate={[Validator.required]}
              disabled
            />
          </FormGroup>
          <FormGroup className="indented-form-group">
            <div className="form-label required">{t('Comment')}</div>
            <Field
              name="comment"
              type="text"
              placeholder={t('Client wanted a plan with 500k keywords...')}
              helpText={t('Description of why the plan is created')}
              component={TextAreaField}
              validate={[Validator.required]}
            />
          </FormGroup>
          <FormGroup className="indented-form-group">
            <div className="form-label required">{t('Message')}</div>
            <Field
              name="message"
              type="text"
              placeholder={t('500k keywords plan with 50 USD off on the first three months')}
              helpText={t('Message for the customer')}
              component={TextAreaField}
              validate={[Validator.required]}
            />
          </FormGroup>
          <strong className="form-title not-numbered">{t('Pricing')}</strong>
          <hr />
          <FormGroup className="indented-form-group">
            <div className="form-label required">{t('Price monthly')}</div>
            <Field
              name="priceMonthly"
              placeholder={'0.00'}
              type="number"
              helpText={t('Monthly price in USD')}
              component={TextField}
              validate={[Validator.required, Validator.numeric]}
            />
          </FormGroup>
          <FormGroup className="indented-form-group">
            <div className="form-label required">{t('Price yearly')}</div>
            <Field
              name="priceYearly"
              placeholder={'0.00'}
              type="number"
              helpText={t('Yearly price in USD')}
              component={TextField}
              validate={[Validator.required, Validator.numeric]}
            />
          </FormGroup>
          <strong className="form-title not-numbered">{t('Discounts')}</strong>
          <hr />
          <FormGroup className="indented-form-group">
            <div className="form-label">{t('Sign-on discount')}</div>
            <Field
              name="signonDiscount"
              placeholder={'0.00'}
              type="number"
              helpText={t('Amount to discount in USD')}
              component={TextField}
            />
          </FormGroup>
          <FormGroup className="indented-form-group">
            <div className="form-label">{t('Sign-on discount months')}</div>
            <Field
              name="signonDiscountMonths"
              placeholder={'0'}
              type="number"
              helpText={t('Total months that above discount should be applied.')}
              component={TextField}
            />
          </FormGroup>
          <strong className="form-title not-numbered">{t('Deal')}</strong>
          <hr />
          <FormGroup className="indented-form-group">
            <div className="form-label">{t('Deal starts on')}</div>
            <Field
              name="dealStartDate"
              helpText={t('Start date of deal, leave empty for always')}
              component={DateField}
              showTimeSelect
            />
          </FormGroup>
          <FormGroup className="indented-form-group">
            <div className="form-label">{t('Deal ends on')}</div>
            <Field
              name="dealEndDate"
              helpText={t('End date of deal, leave empty for always')}
              component={DateField}
              showTimeSelect
            />
          </FormGroup>
          <Field
            name="showCountdown"
            component={Checkbox}
            defaultChecked={initialValues.showCountdown}
          >
            {t('Show countdown')}
          </Field>
          <strong className="form-title not-numbered">{t('Limits')}</strong>
          <hr />
          <FormGroup className="indented-form-group">
            <div className="form-label required">{t('Max keywords')}</div>
            <Field
              name="maxKeywords"
              placeholder={'0'}
              type="number"
              component={TextField}
              validate={[Validator.required, Validator.numeric]}
            />
          </FormGroup>
          <FormGroup className="indented-form-group">
            <div className="form-label required">{t('Max competitors')}</div>
            <Field
              name="maxCompetitors"
              placeholder={'0'}
              type="number"
              component={TextField}
              validate={[Validator.required, Validator.numeric]}
            />
          </FormGroup>
          <strong className="form-title not-numbered">{t('Features')}</strong>
          <hr />
          <Field
            name="validForNewOnly"
            component={Checkbox}
            defaultChecked={initialValues.validForNewOnly}
          >
            {t('Valid for new only')}
          </Field>
          <Field
            name="featureApiAccess"
            component={Checkbox}
            defaultChecked={initialValues.featureApiAccess}
          >
            {t('API access')}
          </Field>
          <Field
            name="featureAdvancedMetrics"
            component={Checkbox}
            defaultChecked={initialValues.featureAdvancedMetrics}
          >
            {t('Advanced metrics')}
          </Field>
          <hr />
          <FormGroup className="indented-form-group">
            <div className="confirmation-button-wrapper text-right">
              <Button onClick={this.props.onCancel} disabled={submitting} theme="orange">
                {t('Cancel')}
              </Button>
              <Button disabled={submitting} submit theme="orange">
                {submitting ? t('Creating...') : t('Create')}
              </Button>
            </div>
          </FormGroup>
        </Col>
      </form>
    );
  }
}

const createPlanQuery = gql`
  mutation createPlanForm_createPlan($input: CreatePlanInput!) {
    createPlan(input: $input) {
      errors {
        field
        messages
      }
      plan {
        id
      }
    }
  }
`;

const ReduxForm = reduxForm({ form: 'CreatePlanForm', enableReinitialize: true })(CreatePlanForm);

const mapStateToProps = () => ({});

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
  graphql(createPlanQuery, { name: 'createPlan' }),
)(ReduxForm);
