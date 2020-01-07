/* eslint-disable react/no-did-update-set-state */
// @flow
import config from 'config';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { change as changeFormValue, Field, getFormValues, reduxForm } from 'redux-form';
import { Container, Col, Row, FormGroup, UncontrolledTooltip } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { hotjar } from 'react-hotjar';
import cn from 'classnames';
import cookie from 'react-cookies';
import { partition } from 'lodash';
import { filterCompanySizesOptions } from 'Types/CompanySize';

// actions
import { showModal } from 'Actions/ModalAction';
import { startLoading, finishLoading } from 'Actions/LoadingAction';

// components
import Button from 'Components/Forms/Button';
import FooterEmpty from '../Layout/FooterEmpty';
import Captcha from 'Components/Captcha';
import Select from 'react-select';

// icons
import Logo from 'icons/logo.svg';
import AddIcon from 'icons/plus.svg?inline';
import RemoveIcon from 'icons/bin.svg?inline';
import CheckIcon from 'icons/check.svg?inline';
import InformationIcon from 'icons/information.svg?inline';

// utils
import { t, tct } from 'Utilities/i18n';
import { graphqlOK, redirectToExternalUrl } from 'Utilities/underdash';
import Validator from 'Utilities/validation';
import { uniqueId } from 'lodash';

import './redeem.scss';
import LoadingSpinner from '../Register';
import { Checkbox } from '../../Components/Forms/Fields';

type Props = {
  // automatic
  resetFormValue: Function,
  showModal: Function,
  startLoading: Function,
  finishLoading: Function,
  invalid: boolean,
  submitting: boolean,
  performRegister: Function,
  handleSubmit: Function,
  match: Object,
  pricingPlan: Object,
  prepaidVoucherCampaignData: Object,
  organizationsChoices: Object,
};

type State = {
  firstLoad: boolean,
  vouchers: string[],
};

const formName = 'RedeemForm';

class RedeemPage extends Component<Props, State> {
  constructor(props) {
    super(props);
    hotjar.initialize(config.hotjarId, 6);
  }

  state = {
    firstLoad: true,
    vouchers: [],
  };

  componentDidMount() {
    this.props.startLoading({ loadingText: '', noBackdrop: true });
  }

  componentDidUpdate(prevProps) {
    if (this.state.firstLoad && !graphqlOK(prevProps) && graphqlOK(this.props)) {
      this.props.finishLoading();

      this.setState({
        firstLoad: false,
      });
    }
  }

  handleSubmit = values => {
    const inputValues = {
      name: values.name,
      email: values.email,
      password: values.password,
      vouchers: this.state.vouchers,
      captcha: values.captcha,
      companySize: values.companySize ? values.companySize.value : null,
      companyType: values.companyType ? values.companyType.value : null,
      keywordsSize: values.keywordsSize,
    };

    this.props.startLoading();

    return this.props
      .performRegister({
        variables: {
          input: inputValues,
        },
      })
      .then(
        ({
          data: {
            userSignup: { token, errors },
          },
        }) => {
          if (this.captcha) {
            this.captcha.reset();
            this.captcha.execute();
          }

          if (token !== null) {
            cookie.save('sessionid', token, { path: '/', domain: config.baseUrl });
            redirectToExternalUrl('/app/welcome');
          } else {
            this.props.finishLoading();

            const [fieldErrors, otherErrors] = partition(
              errors,
              e => !~['__all__', 'captcha'].indexOf(e.field),
            );
            if (fieldErrors && fieldErrors.length) {
              Validator.setResponseErrors(Validator.throwSubmissionError, fieldErrors || []);
            }

            if (otherErrors) {
              this.props.showModal({
                modalType: 'RegisterFailed',
                modalProps: {
                  errors: otherErrors,
                },
              });
            }
          }
        },
        () => {
          if (this.captcha) {
            this.captcha.reset();
            this.captcha.execute();
          }
        },
      );
  };

  handleAddVoucher = () => {
    const {
      formValues,
      prepaidVoucherCampaignData: {
        prepaidVoucherCampaign: { maxVouchersPerOrganization },
      },
    } = this.props;
    if (
      formValues.voucher &&
      formValues.voucher.trim().length > 0 &&
      this.state.vouchers.length < maxVouchersPerOrganization
    ) {
      this.setState(
        {
          vouchers: [...this.state.vouchers, formValues.voucher.trim()],
        },
        () => {
          this.props.resetFormValue(formName, 'voucher');
          this.props.change('_validationHack', Date.now());
        },
      );
    }
  };

  handleRemoveVoucher = idx => {
    const vouchers = [...this.state.vouchers];
    vouchers.splice(idx, 1);

    this.setState(
      {
        vouchers,
      },
      () => this.props.change('_validationHack', Date.now()),
    );
  };

  handleAddOnEnterVoucher = evt => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      this.handleAddVoucher(evt);
    }
  };

  handleSelectOnBlur = ({ input }) => input.onBlur(input.value);

  getDefaultElement = field => (
    <field.elementType
      className={cn('form-control text-input-control', {
        loading: field.asyncValidating,
      })}
      type={field.type}
      readOnly={field.readOnly}
      placeholder={field.placeholder}
      data-hj-whitelist={'true'}
      {...field.input}
    />
  );

  getPasswordElement = field => {
    const {
      meta: { touched, error },
    } = field;
    return (
      <Fragment>
        <input
          className={cn('form-control text-input-control', {
            'password-confirm-padding': touched && !error,
          })}
          type={field.type}
          placeholder={field.placeholder}
          {...field.input}
        />
        {touched && !error ? <CheckIcon className="password-confirm-icon" /> : null}
      </Fragment>
    );
  };

  getVoucherElement = field => {
    const {
      prepaidVoucherCampaignData: {
        prepaidVoucherCampaign: { maxVouchersPerOrganization },
      },
    } = this.props;

    const {
      meta: { error },
    } = field;

    field.input.onBlur = () => this.handleAddVoucher();
    return (
      <Fragment>
        <input
          className="form-control text-input-control"
          type={field.type}
          onKeyDown={this.handleAddOnEnterVoucher}
          placeholder={field.placeholder}
          {...field.input}
        />
        {!error && field.input.value && this.state.vouchers.length < maxVouchersPerOrganization ? (
          <div onClick={this.handleAddVoucher} className="add-voucher-icon-container">
            <AddIcon className="add-voucher-icon" />
          </div>
        ) : null}
      </Fragment>
    );
  };

  getElement = field => {
    switch (field.type) {
      case 'password':
        return this.getPasswordElement(field);
      default:
        if (field.input.name === 'voucher') {
          return this.getVoucherElement(field);
        }
        if (field.elementType === 'customSelect') {
          return this.getCustomSelect(field);
        }
        return this.getDefaultElement(field);
    }
  };

  fieldRenderer = (field): any => {
    const {
      supressErrorMessage,
      meta: { touched, error },
    } = field;
    return (
      <div
        className={cn('inline-form-field', { invalid: !supressErrorMessage && touched && error })}
      >
        <label
          htmlFor={field.input.id}
          className={cn(field.labelClassname, {
            'inline-form-label': field.label,
          })}
        >
          {field.label}
        </label>
        {this.getElement(field)}
        {!supressErrorMessage && <span className="error-message">{touched ? error : null}</span>}
      </div>
    );
  };

  bigFieldRenderer = (field): any => {
    const {
      supressErrorMessage,
      meta: { asyncValidating, touched, error },
    } = field;
    const loadingSpinner = asyncValidating ? <LoadingSpinner /> : '';
    return (
      <div className={cn('form-field', { invalid: touched && error })}>
        <label
          htmlFor={field.input.id}
          className={cn(field.labelClassname, {
            'form-label': field.label,
          })}
        >
          {field.label}
        </label>
        {this.getElement(field)}
        {loadingSpinner}
        <span className="error-message">{!supressErrorMessage && touched ? error : null}</span>
      </div>
    );
  };

  renderTerms() {
    return (
      <Field
        name="termsAccepted"
        className="terms-checkbox"
        component={Checkbox}
        validate={Validator.required}
      >
        {tct('I agree to the [termsLink:Terms and Conditions] and [policyLink:Privacy Policy] *', {
          termsLink: (
            <a href="https://www.accuranker.com/terms" rel="noopener noreferrer" target="_blank" />
          ),
          policyLink: (
            <a
              href="https://www.accuranker.com/privacy"
              rel="noopener noreferrer"
              target="_blank"
            />
          ),
        })}
      </Field>
    );
  }

  renderHeader() {
    return (
      <header className="nav-bar-top">
        <div className="logo">
          <a href="https://app.accuranker.com/">
            <img src={Logo} alt={'AccuRanker'} />
          </a>
        </div>
      </header>
    );
  }

  getCustomSelect = field => (
    <Select
      name={field.input.id}
      className={cn('square-select', {
        loading: field.asyncValidating,
      })}
      options={field.options}
      placeholder={field.placeholder}
      clearable={false}
      searchable={true}
      filterOptions={field.filterOptions}
      backspaceRemoves={false}
      deleteRemoves={false}
      inputProps={{
        type: field.type,
      }}
      arrowRenderer={() => <div className="dropdown-arrow" />}
      {...field.input}
      onBlur={() => this.handleSelectOnBlur(field)}
      optionRenderer={field.optionRenderer}
    />
  );

  renderWarning() {
    const { invalid, formValues } = this.props;

    let contactMissing = false;
    const contactRequiredFields = ['email', 'name', 'password'];

    let companyMissing = false;
    const companyRequiredFields = ['companyName', 'companySize', 'companyType', 'keywordsSize'];

    for (const cv in contactRequiredFields) {
      if (!formValues[contactRequiredFields[cv]]) {
        contactMissing = true;
      }
    }

    for (const cv in companyRequiredFields) {
      if (!formValues[companyRequiredFields[cv]]) {
        companyMissing = true;
      }
    }

    const missing = {
      terms: formValues.termsAccepted ? formValues.termsAccepted === false : true,
      contact: contactMissing,
      company: companyMissing,
      vouchers: this.state.vouchers.length === 0,
    };

    const errorMessages = [];

    if (missing.company) {
      errorMessages.push(t('Please enter your company information.'));
    }
    if (missing.contact) {
      errorMessages.push(t('Please enter your contact information.'));
    }

    if (missing.vouchers) {
      errorMessages.push(t('Please enter and add vouchers.'));
    }

    if (missing.terms) {
      errorMessages.push(t('Please agree to our Terms and Conditions.'));
    }

    return (
      <Col xs={12} md={8}>
        {(invalid || missing.vouchers || missing.contact) && (
          <div className="warning">
            <div className="icon">
              <InformationIcon />
            </div>
            <div className="text">
              <div style={{ paddingTop: 10 }}>
                <p>
                  <strong>{t('Missing required fields')}</strong>
                </p>

                <ul>{errorMessages.map(e => <li key={e}>{e}</li>)}</ul>
              </div>
            </div>
          </div>
        )}
      </Col>
    );
  }

  renderCompany() {
    const {
      organizationsChoices: { organizationChoices: choices },
    } = this.props;

    return (
      <Fragment>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('Company name')}
              labelClassname="required"
              name="companyName"
              id="companyName"
              elementType="input"
              type="text"
              placeholder={t('Enter your company name')}
              component={this.bigFieldRenderer}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('How many employees work in the company?')}
              labelClassname="required"
              name="companySize"
              id="companySize"
              elementType="customSelect"
              type="number"
              filterOptions={filterCompanySizesOptions}
              placeholder={t('Select company size')}
              component={this.bigFieldRenderer}
              options={choices.companySizes.map(({ name: label, value }) => ({ label, value }))}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('Which of the following best describes the company?')}
              labelClassname="required"
              name="companyType"
              id="companyType"
              elementType="customSelect"
              type="text"
              placeholder={t('Select company type')}
              component={this.bigFieldRenderer}
              options={choices.companyTypes.map(({ name: label, value }) => ({ label, value }))}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('How many keywords do you track?')}
              labelClassname="required"
              name="keywordsSize"
              id="keywordsSize"
              elementType="input"
              type="number"
              placeholder={t('Enter amount of keywords you track or plan to track')}
              component={this.bigFieldRenderer}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
      </Fragment>
    );
  }

  renderContact() {
    return (
      <Fragment>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('Full name')}
              labelClassname="required"
              name="name"
              id="name"
              elementType="input"
              type="text"
              placeholder={t('Enter your full name')}
              component={this.bigFieldRenderer}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('Email')}
              labelClassname="required"
              name="email"
              id="email"
              elementType="input"
              type="email"
              placeholder={t('Enter your email')}
              component={this.bigFieldRenderer}
              validate={[Validator.required, Validator.email]}
            />
          </Col>
        </FormGroup>
        <FormGroup key="password" row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('Password')}
              labelClassname="required"
              name="password"
              id="password"
              elementType="input"
              type="password"
              placeholder={t('Enter your password')}
              component={this.bigFieldRenderer}
              validate={[Validator.required, Validator.password]}
            />
          </Col>
        </FormGroup>

        {/*
        Disable captcha
        <Field
          refName={ref => {
            this.captcha = ref;
          }}
          name="captcha"
          component={Captcha}
        />
        */}
      </Fragment>
    );
  }

  renderVouchers() {
    return (
      <Fragment>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('Vouchers')}
              labelClassname="required"
              name="voucher"
              id="voucher"
              elementType="input"
              type="text"
              placeholder={t('Enter voucher')}
              component={this.bigFieldRenderer}
              validate={this.validateVouchers}
            />
            <div>
              {this.state.vouchers.map((voucher, idx) => {
                return (
                  <div key={`voucher-${idx}`} className="voucher-item-container">
                    <div className="voucher-item">{voucher}</div>
                    <div onClick={() => this.handleRemoveVoucher(idx)}>
                      <RemoveIcon className="remove-voucher-icon" id={`voucher-${idx}`} />
                    </div>

                    <UncontrolledTooltip
                      delay={{ show: 0, hide: 0 }}
                      placement="top"
                      target={`voucher-${idx}`}
                    >
                      {t('Click to remove voucher')}
                    </UncontrolledTooltip>
                  </div>
                );
              })}
            </div>
          </Col>
        </FormGroup>
      </Fragment>
    );
  }

  validateVouchers = value =>
    !value && !this.state.vouchers.length ? t('This field is required') : undefined;

  renderFooter() {
    return <FooterEmpty />;
  }

  renderContent() {
    if (!graphqlOK(this.props)) {
      return null;
    }

    const {
      handleSubmit,
      invalid,
      submitting,
      prepaidVoucherCampaignData: {
        prepaidVoucherCampaign: { plan },
      },
    } = this.props;

    return (
      <main role="main">
        <Container>
          <Row>
            <Col md={12} lg={8}>
              <div className="header-message">
                <h1 className="mb-2">{t('Lifetime plan with %s keywords', plan.maxKeywords)}</h1>
                <h2 className="mb-5">
                  {t('Add %s additional keywords for each voucher redeemed', plan.maxKeywords)}
                </h2>
              </div>
            </Col>
          </Row>
          <form className="row" onSubmit={handleSubmit(this.handleSubmit)}>
            <Col md={12} lg={10} className="inner-container">
              <Row className="form-section">
                <Col className="form-section-title" xs={12}>
                  <strong className="form-title">{t('Company Information')}</strong>
                </Col>
                <Col xs={12} md={8}>
                  {this.renderCompany()}
                </Col>
              </Row>
              <Row className="form-section">
                <Col className="form-section-title" xs={12}>
                  <strong className="form-title">{t('Contact Information')}</strong>
                </Col>
                <Col xs={12} md={8}>
                  {this.renderContact()}
                  {this.renderVouchers()}
                </Col>
              </Row>

              <Row className="form-section">
                {this.renderWarning()}

                <Col className="terms-container" xs={12} md={12}>
                  {this.renderTerms()}
                </Col>

                <Col xs={12} md={8} style={{ paddingTop: 20 }}>
                  <div className="text-center confirmation-button-wrapper">
                    <Button
                      submit
                      disabled={submitting || invalid || this.state.vouchers.length === 0}
                    >
                      {'Sign up'}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Col>
          </form>
        </Container>
      </main>
    );
  }

  render() {
    return (
      <div className="register-container redeem-page">
        {this.renderHeader()}
        {this.renderContent()}
        {this.renderFooter()}
      </div>
    );
  }
}

const prepaidVoucherCampaignQuery = gql`
  query redeemPage_prepaidVoucherCampaign($slug: String!) {
    prepaidVoucherCampaign(slug: $slug) {
      id
      createdAt
      name
      slug
      endDate
      maxVouchersPerOrganization
      plan {
        id
        maxKeywords
      }
    }
  }
`;

const performRegisterMutation = gql`
  mutation redeemPage_userSignup($input: SignUpInput!) {
    userSignup(input: $input) {
      errors {
        field
        messages
      }
      token
    }
  }
`;

const organizationsChoicesQuery = gql`
  query redeemPage_organizationChoices {
    organizationChoices {
      companyTypes {
        name
        value
      }
      companySizes {
        name
        value
      }
    }
  }
`;

const mapStateToProps = state => ({
  formValues: getFormValues(formName)(state) || {}, // This basically gives us the form values in the props and it gets updated on keydown.
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    dispatch => ({
      ...bindActionCreators({ startLoading, finishLoading, showModal }, dispatch),
      resetFormValue: (form, fieldName) => dispatch(changeFormValue(formName, fieldName, '')),
    }),
  ),
  graphql(prepaidVoucherCampaignQuery, {
    name: 'prepaidVoucherCampaignData',
    options: ({ match }) => ({
      variables: {
        slug: match.params.slug,
      },
    }),
  }),
  graphql(performRegisterMutation, { name: 'performRegister' }),
  graphql(organizationsChoicesQuery, { name: 'organizationsChoices' }),
)(
  reduxForm({
    validate: values => {
      const { captcha } = values;
      const error = {};

      if (!captcha) {
        error.captcha = 'reCAPTCHA required.';
      }
      return error;
    },
    form: formName,
    enableReinitialize: true,
  })(RedeemPage),
);
