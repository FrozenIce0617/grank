// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Col, Row, FormGroup, Container } from 'reactstrap';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import { TextField, Select, Checkbox } from 'Components/Forms/Fields';
import { t, tct } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import LoadingSpinner from 'Components/LoadingSpinner';
import FormatNumber from 'Components/FormatNumber';
import LabelWithHelp from 'Components/LabelWithHelp';

import './add-sub-account-form.scss';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';
import FormErrors from 'Components/Forms/FormErrors';

type Plan = {
  id: string,
  name: string,
};

type Props = {
  handleSubmit: Function,
  invalid: boolean,
  submitting: boolean,
  createAndPaySubAccount: Function,
  createSubAccount: Function,
  plans: Array<Plan>,
  onClose: Function,
  refresh: Function,
  whoPays: Object,
};

type State = {
  isLoading: boolean,
};

class AddSubAccountForm extends Component<Props, State> {
  static defaultProps = {
    whoPays: {
      value: 1,
    },
  };

  state = {
    isLoading: false,
  };

  billingCycleOptions = [
    {
      label: t('Monthly'),
      value: 1,
    },
    {
      label: t('Annually'),
      value: 2,
    },
  ];

  payerOptions = [
    {
      label: t('My account'),
      value: 1,
    },
    {
      label: t('New sub-account'),
      value: 2,
    },
  ];

  handleSubmit = ({ organizationName, fullName, email, plan, billingCycle }) => {
    this.setState({ isLoading: true });
    const { whoPays, createAndPaySubAccount, createSubAccount } = this.props;

    if (whoPays.value === 1) {
      return createAndPaySubAccount({
        variables: {
          input: {
            organizationName,
            plan: plan.value,
            billingCycle: billingCycle.value,
          },
        },
      })
        .then(({ data: { createAndPaySubAccount: { success, errors } } }) => {
          if (!success) {
            throwSubmitErrors(errors);
          } else {
            Toast.success(t('New sub-account created and paid'));
            this.setState({ isLoading: false });
            this.props.refresh();
            this.props.onClose();
          }
        }, throwNetworkError)
        .catch(error => {
          this.setState({ isLoading: false });
          throw error;
        });
    }

    return createSubAccount({
      variables: {
        input: {
          organizationName,
          fullName,
          email,
        },
      },
    })
      .then(({ data: { createSubAccount: { success, errors } } }) => {
        if (!success) {
          throwSubmitErrors(errors);
        } else {
          Toast.success(t('New sub-account created'));
          this.setState({ isLoading: false });
          this.props.refresh();
          this.props.onClose();
        }
      }, throwNetworkError)
      .catch(error => {
        this.setState({ isLoading: false });
        throw error;
      });
  };

  renderFromOrgPays() {
    const { plans, submitting } = this.props;

    return (
      <div>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Plan')}</div>
            <Field
              name="plan"
              defaultBehaviour
              component={Select}
              disabled={submitting}
              placeholder={t('Select plan')}
              options={plans}
              validate={[Validator.required]}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Billing Cycle')}</div>
            <Field
              name="billingCycle"
              defaultBehaviour
              component={Select}
              disabled={submitting}
              placeholder={t('Select billing cycle')}
              options={this.billingCycleOptions}
              useFirstOptionAsDefault
              searchable={false}
              validate={[Validator.required]}
            />
          </Col>
        </FormGroup>
      </div>
    );
  }

  renderSubAccountPays() {
    const { submitting } = this.props;

    return (
      <div>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Users Full Name')}</div>
            <Field
              name="fullName"
              placeholder={t('Users Full Name')}
              disabled={submitting}
              component={TextField}
              validate={[Validator.required]}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Users Email Address')}</div>
            <Field
              name="email"
              type="email"
              placeholder={t('Users Email Address')}
              disabled={submitting}
              component={TextField}
              validate={[Validator.required]}
            />
          </Col>
        </FormGroup>
      </div>
    );
  }

  render() {
    const { plans, invalid, submitting, handleSubmit, whoPays } = this.props;
    const { isLoading } = this.state;
    const loadingSpinner = submitting || isLoading ? <LoadingSpinner /> : null;

    return (
      <Container>
        <form className="row add-sub-account-form" onSubmit={handleSubmit(this.handleSubmit)}>
          <Col xs={12} style={{ padding: '0' }}>
            <Row>
              <Col xs={12}>
                <FormErrors />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div>
                  <FormGroup row className="indented-form-group">
                    <Col lg={12}>
                      <div className="form-label required">{t('Who Pays?')}</div>
                      <Field
                        name="payer"
                        defaultBehaviour
                        disabled={submitting}
                        component={Select}
                        options={this.payerOptions}
                        useFirstOptionAsDefault
                        validate={[Validator.required]}
                        searchable={false}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row className="indented-form-group">
                    <Col lg={12}>
                      <div className="form-label required">{t('Company Name')}</div>
                      <Field
                        name="organizationName"
                        placeholder={t('Company Name')}
                        disabled={submitting}
                        component={TextField}
                        validate={[Validator.required]}
                      />
                    </Col>
                  </FormGroup>
                  {whoPays.value === 1 ? this.renderFromOrgPays() : this.renderSubAccountPays()}
                  <FormGroup row className="indented-form-group">
                    <Col lg={12}>
                      <Field
                        name="terms"
                        component={Checkbox}
                        disabled={submitting}
                        validate={[Validator.required]}
                      >
                        {tct('I agree to the [link:Terms and Conditons]', {
                          link: <a href="https://www.accuranker.com/terms" target="_blank" />,
                        })}
                      </Field>
                    </Col>
                  </FormGroup>
                  <span>
                    {whoPays.value === 1
                      ? t(
                          'The account will be created and billed instantly using the credit card that is already on your account.',
                        )
                      : t(
                          'The account will be created and the user entered will receive an email with login info. There is no trial period on the account, and it must be paid to be usable.',
                        )}
                  </span>
                  <hr />
                  <div className="confirmation-button-wrapper text-right">
                    {loadingSpinner}
                    <Button disabled={invalid || submitting || isLoading} submit theme="orange">
                      {whoPays.value === 1 ? t('Create and pay') : t('Create and send email')}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </form>
      </Container>
    );
  }
}

const createAndPaySubAccountQuery = gql`
  mutation addSubAccountForm_createAndPaySubAccount($input: CreateAndPaySubAccountInput!) {
    createAndPaySubAccount(input: $input) {
      errors {
        field
        messages
      }
      success
    }
  }
`;

const createSubAccountQuery = gql`
  mutation addSubAccountForm_createSubAccount($input: CreateSubAccountInput!) {
    createSubAccount(input: $input) {
      errors {
        field
        messages
      }
      success
    }
  }
`;

const pricingPlansQuery = gql`
  query addSubAccountForm_pricingPlansSubaccounts {
    pricingPlansSubaccounts {
      id
      name
      priceMonthly
      priceYearly
      currency
    }
  }
`;

const formatPrice = (price, currency) => <FormatNumber currency={currency}>{price}</FormatNumber>;

const formatPlanLabel = plan => (
  <span>
    {plan.name} ({formatPrice(plan.priceMonthly, plan.currency)} /{' '}
    {formatPrice(plan.priceYearly, plan.currency)})
  </span>
);

const selector = formValueSelector('AddSubAccountForm');
const mapStateToProps = state => ({
  whoPays: selector(state, 'payer'),
});

export default compose(
  graphql(createAndPaySubAccountQuery, { name: 'createAndPaySubAccount' }),
  graphql(createSubAccountQuery, { name: 'createSubAccount' }),
  graphql(pricingPlansQuery, {
    props: ({ ownProps, data: { loading, error, pricingPlansSubaccounts } }) => ({
      ...ownProps,
      loading,
      error,
      plans: pricingPlansSubaccounts
        ? pricingPlansSubaccounts.reduce((acc, plan) => {
            acc.push({
              label: formatPlanLabel(plan),
              value: plan.id,
            });
            return acc;
          }, [])
        : [],
    }),
  }),
)(
  connect(mapStateToProps)(
    reduxForm({
      form: 'AddSubAccountForm',
    })(AddSubAccountForm),
  ),
);
