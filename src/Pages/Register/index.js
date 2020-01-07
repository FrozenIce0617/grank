/* eslint-disable react/no-did-update-set-state */
// @flow
import config from 'config';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { Container, Col, Row, FormGroup } from 'reactstrap';
import Validator from 'Utilities/validation';
import LocaleSelector from 'Selectors/LocaleSelector';
import cn from 'classnames';
import cookie from 'react-cookies';
import { partition } from 'lodash';
import { withRouter } from 'react-router-dom';
import { hotjar } from 'react-hotjar';
import Raven from 'raven-js';

// actions
import { showModal } from 'Actions/ModalAction';
import { startLoading, finishLoading } from 'Actions/LoadingAction';

// components
import Select from 'react-select';
import { Checkbox } from 'Components/Forms/Fields';
import PaymentWidget from 'Pages/Billing/PaymentWidget';
import PhoneInput from 'Components/Forms/PhoneInput';
import Button from 'Components/Forms/Button';
import LoadingSpinner from 'Components/LoadingSpinner';
import FooterEmpty from '../Layout/FooterEmpty';

// icons
import Logo from 'icons/logo.svg';
import CheckIcon from 'icons/check.svg?inline';
import InformationIcon from 'icons/information.svg?inline';

// utils
import { t, tct } from 'Utilities/i18n';
import { graphqlOK, redirectToExternalUrl } from 'Utilities/underdash';
import { filterCompanySizesOptions } from 'Types/CompanySize';

import './register.scss';

const TRIAL = 'A_1';
const TRIAL_CC_AND_PAY = 'A_2';
const PAY = 'A_3';

type CountryOption = {
  label: string,
  value: string,
  vatCode: string,
  countryCode: string,
};

type PricingPlan = {
  id: string,
  maxKeywords: number,
  nextPlanAfterTrial?: PricingPlan,
  category?: string,
  priceMonthly: number,
};

type Props = {
  // automatic
  dispatch: Function,
  userData: Object,
  formValues: Object,
  countryOptions: Object[],
  vatOptions: Object[],
  countriesError: any,
  showModal: Function,
  startLoading: Function,
  finishLoading: Function,
  invalid: boolean,
  submitting: boolean,
  change: Function,
  initialValues: Object,
  performRegister: Function,
  handleSubmit: Function,
  location: Object,
  match: Object,
  pricingPlan: Object,
  organizationsChoices: Object,
};

type State = {
  showVatFields: boolean,
  braintreeInstance: any,
  braintreeUniqueId: any,
  firstLoad: boolean,
};

const formName = 'RegisterForm';

class RegisterPage extends Component<Props, State> {
  constructor(props) {
    super(props);
    hotjar.initialize(config.hotjarId, 6);
  }

  state = {
    braintreeInstance: false,
    braintreeUniqueId: +new Date(),

    showVatFields: false,
    firstLoad: true,
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

    if (
      this.props.initialValues &&
      prevProps.initialValues &&
      this.props.initialValues.country &&
      prevProps.initialValues.country &&
      this.props.initialValues.country.value !== prevProps.initialValues.country.value
    ) {
      this.handleCountrySelectOnChange(this.props.initialValues.country);
    }
  }

  handleSelectOnBlur = ({ input }) => input.onBlur(input.value);

  getVatOptionAndSetToField = countryCode => {
    const { vatOptions, change, formValues } = this.props;
    if (!vatOptions) {
      return;
    }

    const option = vatOptions.filter(vatOption => vatOption.countryCode === countryCode) || [];
    if (!formValues.vatNumber && option.length) {
      change('vatPrefix', option[0]);
    }
  };

  handleCountrySelectOnChange = (data: CountryOption) =>
    this.setState({ showVatFields: !!data.vatCode }, this.getVatOptionAndSetToField(data.value));

  handleRegister = (values, nonce) => {
    // Set up the payload
    const {
      location: { search: queryString },
      userData: { unconfirmedUser },
      match,
    } = this.props;
    const queryParams = new URLSearchParams(queryString);
    const refCode = queryParams.get('ref_code') || cookie.load('ref_code') || '';
    const campaignId = queryParams.get('ar_campaign') || cookie.load('ar_campaign') || '';
    const referrer = // Check for the corret spelling of referrer and for the http spec spelling (referer)
      queryParams.get('ar_referrer') ||
      queryParams.get('ar_referer') ||
      cookie.load('ar_referrer') ||
      cookie.load('ar_referer') ||
      '';

    const inputValues = {
      unconfirmedUserId: match.params.id,
      planId: unconfirmedUser.adminCampaign
        ? unconfirmedUser.adminCampaign.plan.id
        : config.trialId,
      billingCycle: 1,
      organizationName: values.companyName,
      fullName: values.fullName,
      phone: values.phone,
      password: values.password,
      campaignId,
      refCode,
      referrer,
      captcha: 'this-is-not-a-hack', // values.captcha,
      paymentNonce: nonce,
      companyInfoStreet: values.street,
      companyInfoZipcode: values.zipcode,
      companyInfoCity: values.city,
      companyInfoState: values.state,
      companyInfoCountryIso: values.country ? values.country.value : null,
      companyInfoVatPrefix: values.vatPrefix ? values.vatPrefix.vatCode : null,
      companyInfoVatNumber: values.vatNumber ? values.vatNumber.trim() : null,
      companySize: values.companySize ? values.companySize.value : null,
      companyType: values.companyType ? values.companyType.value : null,
      keywordsSize: values.keywordsSize,
    };

    return this.props
      .performRegister({
        variables: {
          input: inputValues,
        },
      })
      .then(({ data: { userRegister: { token, errors } } }) => {
        if (token !== null) {
          cookie.save('sessionid', token, { path: '/', domain: config.baseUrl });
          redirectToExternalUrl('/app/welcome');
        } else {
          this.props.finishLoading();

          const [fieldErrors, otherErrors] = partition(
            errors,
            e => !~['__all__', 'payment', 'captcha'].indexOf(e.field),
          );
          if (fieldErrors && fieldErrors.length) {
            Validator.setResponseErrors(Validator.throwSubmissionError, fieldErrors || []);
          }

          if (otherErrors) {
            this.setState({
              braintreeUniqueId: +new Date(),
            });

            this.props.showModal({
              modalType: 'RegisterFailed',
              modalProps: {
                errors: otherErrors,
              },
            });
          }
        }
      });
  };

  handleSubmit = values => {
    const {
      userData: { unconfirmedUser },
    } = this.props;

    this.props.startLoading();

    // const captcha = values.captcha;
    // if (!captcha) {
    //   this.props.finishLoading();
    //   return;
    // }

    if (unconfirmedUser.signupType === TRIAL_CC_AND_PAY || unconfirmedUser.signupType === PAY) {
      return this.state.braintreeInstance.requestPaymentMethod((braintreeError, payload) => {
        if (braintreeError) {
          try {
            throw braintreeError;
          } catch (e) {
            Raven.captureException(e);
          }

          this.props.finishLoading();
          this.setState({
            braintreeUniqueId: +new Date(),
          });
          this.props.showModal({
            modalType: 'PaymentFailed',
            modalProps: {
              errorType: braintreeError.message,
            },
          });
          return;
        }

        return this.handleRegister(values, payload.nonce);
      });
    }

    return this.handleRegister(values, null);
  };

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

  getPhoneElement = field => {
    const {
      userData: {
        unconfirmedUser: { createdByCountry },
      },
    } = this.props;
    return (
      <PhoneInput
        inputClassName="form-control text-input-control"
        defaultCountry={createdByCountry ? createdByCountry.toLowerCase() : ''}
        placeholder={field.placeholder}
        type={field.type}
        id={field.id}
        input={field.input}
        name={field.name}
        {...field.input}
      />
    );
  };

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
      backspaceRemoves={false}
      deleteRemoves={false}
      filterOptions={field.filterOptions}
      inputProps={{
        type: field.type,
      }}
      arrowRenderer={() => <div className="dropdown-arrow" />}
      {...field.input}
      onBlur={() => this.handleSelectOnBlur(field)}
      optionRenderer={field.optionRenderer}
    />
  );

  getElement = field => {
    switch (field.type) {
      case 'password':
        return this.getPasswordElement(field);
      case 'tel':
        return this.getPhoneElement(field);
      default:
        if (field.elementType === 'customSelect') {
          return this.getCustomSelect(field);
        }
        return this.getDefaultElement(field);
    }
  };

  fieldRenderer = (field): any => {
    const {
      supressErrorMessage,
      meta: { asyncValidating, touched, error },
    } = field;
    const loadingSpinner = asyncValidating ? <LoadingSpinner /> : '';
    return (
      <div className={cn('inline-form-field', { invalid: touched && error })}>
        <label
          htmlFor={field.input.id}
          className={cn(field.labelClassname, {
            'inline-form-label': field.label,
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

  renderWarning() {
    const {
      invalid,
      formValues,
      userData: { unconfirmedUser },
      pricingPlan: { pricingPlan },
    } = this.props;

    const { braintreeInstance } = this.state;

    let companyMissing = false;
    const companyRequiredFields = ['companyName', 'companySize', 'companyType', 'keywordsSize'];

    let contactMissing = false;
    const contactRequiredFields = ['email', 'fullName', 'password', 'phone'];

    let addressMissing = false;
    const addressRequiredFields = ['country', 'street', 'zipcode', 'city'];

    for (const av in addressRequiredFields) {
      if (!formValues[contactRequiredFields[av]]) {
        addressMissing = true;
      }
    }

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
      address:
        unconfirmedUser.signupType === TRIAL_CC_AND_PAY || unconfirmedUser.signupType === PAY
          ? addressMissing
          : false,
      payment:
        unconfirmedUser.signupType === TRIAL_CC_AND_PAY || unconfirmedUser.signupType === PAY
          ? braintreeInstance === false
          : false,
    };

    const errorMessages = [];

    if (missing.company) {
      errorMessages.push(t('Please enter your company information.'));
    }

    if (missing.contact) {
      errorMessages.push(t('Please enter your contact information.'));
    } else if (invalid) {
      errorMessages.push(t('Please fill out the missing fields marked with red.'));
    }

    if (missing.address) {
      errorMessages.push(t('Please enter your address information.'));
    }

    if (missing.payment) {
      errorMessages.push(t('Please enter your payment information.'));
    }

    if (missing.terms) {
      errorMessages.push(t('Please agree to our Terms and Conditions.'));
    }

    return (
      <Col xs={12} md={8}>
        {(invalid || missing.payment || unconfirmedUser.signupType === TRIAL_CC_AND_PAY) && (
          <div className="warning">
            <div className="icon">
              <InformationIcon />
            </div>
            <div className="text">
              {unconfirmedUser.signupType === TRIAL_CC_AND_PAY && (
                <p>
                  {t(
                    'After your trial, you will be charged $%s per month. You can cancel or change your plan at any time on your account page.',
                    pricingPlan.nextPlanAfterTrial
                      ? pricingPlan.nextPlanAfterTrial.priceMonthly
                      : pricingPlan.priceMonthly,
                  )}
                </p>
              )}

              {(invalid || missing.payment) && (
                <div style={{ paddingTop: 10 }}>
                  <p>
                    <strong>{t('Missing required fields')}</strong>
                  </p>

                  <ul>{errorMessages.map(e => <li key={e}>{e}</li>)}</ul>
                </div>
              )}
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
              name="fullName"
              id="fullName"
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
              label={t('Phone')}
              labelClassname="required"
              name="phone"
              id="phone"
              elementType="input"
              type="tel"
              placeholder={t('Enter your phone number')}
              component={this.bigFieldRenderer}
              validate={[Validator.required, Validator.phone]}
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
              readOnly
              type="email"
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
      </Fragment>
    );
  }

  countryOptionRenderer = ({ label, countryCode }) => (
    <div>
      <span className={`inline-icon flag-icon flag-icon-${countryCode.toLowerCase()}`} />
      {label}
    </div>
  );

  renderAddress() {
    const { countryOptions } = this.props;
    return (
      <Fragment>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('Address (street)')}
              labelClassname="required"
              name="street"
              id="street"
              elementType="input"
              type="text"
              placeholder={t('Enter your street')}
              component={this.bigFieldRenderer}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('City')}
              labelClassname="required"
              name="city"
              id="city"
              elementType="input"
              type="text"
              placeholder={t('Enter your city')}
              component={this.bigFieldRenderer}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('State')}
              name="state"
              id="state"
              elementType="input"
              type="text"
              placeholder={t('Enter your state/province/region')}
              component={this.bigFieldRenderer}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('ZIP')}
              labelClassname="required"
              name="zipcode"
              id="zipcode"
              elementType="input"
              type="text"
              placeholder={t('Enter your ZIP')}
              component={this.bigFieldRenderer}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12}>
            <Field
              label={t('Country')}
              labelClassname="required"
              name="country"
              id="country"
              elementType="customSelect"
              type="text"
              placeholder={t('Select your country')}
              component={this.bigFieldRenderer}
              onChange={this.handleCountrySelectOnChange}
              options={countryOptions}
              optionRenderer={this.countryOptionRenderer}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        {this.renderVatFields()}
      </Fragment>
    );
  }

  renderVatFields() {
    if (!this.state.showVatFields) {
      return null;
    }

    const { vatOptions } = this.props;
    return (
      <Fragment>
        <FormGroup row className="indented-form-group no-margin-bottom">
          <Row className="vat-row">
            <label htmlFor="vatPrefix" className="inline-form-label">
              {t('EU vat number')}
            </label>
            <div className="vat-field-group">
              <Field
                name="vatPrefix"
                id="vatPrefix"
                elementType="customSelect"
                type="text"
                placeholder={'Enter your vat prefix'}
                component={this.bigFieldRenderer}
                options={vatOptions}
                supressErrorMessage
              />
              <Field
                name="vatNumber"
                id="vatNumber"
                elementType="input"
                type="text"
                placeholder={t('Enter your vat number')}
                component={this.bigFieldRenderer}
              />
            </div>
          </Row>
        </FormGroup>
        <span className="help-info">{t('Enter your VAT number to avoid VAT charges')}</span>
      </Fragment>
    );
  }

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

  renderPlanInfo(plan: PricingPlan) {
    const {
      userData: { unconfirmedUser },
    } = this.props;

    return (
      <Fragment>
        {plan.nextPlanAfterTrial ? (
          <div className="header-message">
            <h1 className="mb-2">
              {t(
                '%s trial plan with %s keywords',
                plan.nextPlanAfterTrial.category,
                plan.maxKeywords,
              )}
            </h1>
            <h2 className="mb-5">
              {unconfirmedUser.signupType === TRIAL_CC_AND_PAY || unconfirmedUser.signupType === PAY
                ? t(
                    'First %s days free, then $%s monthly',
                    unconfirmedUser.trialDays,
                    plan.nextPlanAfterTrial.priceMonthly,
                  )
                : t('First %s days free', unconfirmedUser.trialDays)}
            </h2>
          </div>
        ) : (
          <div className="header-message">
            <h1 className="mb-2">
              {t('%s plan with %s keywords', plan.category, plan.maxKeywords)}
            </h1>
            <h2 className="mb-5">
              {unconfirmedUser.signupType === TRIAL_CC_AND_PAY || unconfirmedUser.signupType === PAY
                ? unconfirmedUser.signupType === TRIAL_CC_AND_PAY
                  ? t(
                      'First %s days free, then $%s monthly',
                      unconfirmedUser.trialDays,
                      plan.priceMonthly,
                    )
                  : plan.signonDiscountMonths > 0
                    ? t(
                        '%s months $%s, then $%s monthly',
                        plan.signonDiscountMonths,
                        plan.priceMonthly - plan.signonDiscount,
                        plan.priceMonthly,
                      )
                    : t('$%s monthly', plan.priceMonthly)
                : t('First %s days free', unconfirmedUser.trialDays)}
            </h2>
          </div>
        )}
      </Fragment>
    );
  }

  renderFooter() {
    return <FooterEmpty />;
  }

  createBraintreeInstance = instance =>
    this.setState({
      braintreeInstance: instance,
    });

  renderContent() {
    if (!graphqlOK(this.props)) {
      return null;
    }

    const {
      handleSubmit,
      invalid,
      submitting,
      userData: { unconfirmedUser },
      pricingPlan: { pricingPlan },
    } = this.props;

    const { braintreeUniqueId, braintreeInstance } = this.state;
    const missingPayment =
      unconfirmedUser.signupType === TRIAL_CC_AND_PAY || unconfirmedUser.signupType === PAY
        ? braintreeInstance === false
        : false;

    return (
      <main role="main">
        <Container>
          <Row>
            <Col md={12} lg={8}>
              {this.renderPlanInfo(pricingPlan)}
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
                </Col>
              </Row>

              {(unconfirmedUser.signupType === TRIAL_CC_AND_PAY ||
                unconfirmedUser.signupType === PAY) && (
                <Row className="form-section">
                  <Col className="form-section-title" xs={12}>
                    <strong className="form-title">{t('Address Information')}</strong>
                  </Col>
                  <Col xs={12} md={8}>
                    {this.renderAddress()}
                  </Col>
                </Row>
              )}

              {(unconfirmedUser.signupType === TRIAL_CC_AND_PAY ||
                unconfirmedUser.signupType === PAY) && (
                <Row className="form-section" id="payment-information">
                  <Col className="form-section-title" xs={12} style={{ marginBottom: '0' }}>
                    <strong className="form-title">{t('Payment Information')}</strong>
                  </Col>
                  <Col xs={12} md={8} className="payment-container">
                    <PaymentWidget
                      onCreate={this.createBraintreeInstance}
                      uniqueid={braintreeUniqueId}
                    />
                  </Col>
                </Row>
              )}

              <Row className="form-section">
                {this.renderWarning()}

                <Col className="terms-container" xs={12} md={12}>
                  {this.renderTerms()}
                </Col>

                <Col xs={12} md={8} style={{ paddingTop: 20 }}>
                  <div className="text-center confirmation-button-wrapper">
                    <Button submit disabled={submitting || missingPayment || invalid}>
                      {unconfirmedUser.signupType === TRIAL_CC_AND_PAY ||
                      unconfirmedUser.signupType === TRIAL
                        ? t('START TRIAL')
                        : t('PAY')}
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
      <div className="register-container">
        {this.renderHeader()}
        {this.renderContent()}
        {this.renderFooter()}
      </div>
    );
  }
}

const userQuery = gql`
  query registerPage_unconfirmedUser($id: String!) {
    unconfirmedUser(id: $id) {
      id
      email
      createdByCountry
      createdByIp
      signupType
      trialDays
      adminCampaign {
        id
        plan {
          id
        }
      }
    }
  }
`;

const performRegisterMutation = gql`
  mutation registerPage_userRegister($input: RegisterInput!) {
    userRegister(input: $input) {
      errors {
        field
        messages
      }
      token
    }
  }
`;

const countriesQuery = gql`
  query registerPage_countries {
    countries {
      id
      name
      isEu
      vatCode
    }
  }
`;

const pricingPlanQuery = gql`
  query registerPage_pricingPlan($id: ID!) {
    pricingPlan(id: $id) {
      priceMonthly
      maxKeywords
      category
      signonDiscount
      signonDiscountMonths
      nextPlanAfterTrial {
        priceMonthly
        maxKeywords
        category
        signonDiscount
        signonDiscountMonths
      }
    }
  }
`;

const organizationsChoicesQuery = gql`
  query registerPage_organizationChoices {
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
  fullLocale: LocaleSelector(state),
  formValues: getFormValues(formName)(state) || {}, //This basically gives us the form values in the props and it gets updated on keydown.
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    { startLoading, finishLoading, showModal },
  ),
  graphql(userQuery, {
    options: ({ match }) => ({
      variables: {
        id: match.params.id,
      },
    }),
    props: ({ data, data: { loading, unconfirmedUser, error } }) => {
      if (loading || error) {
        return {
          userData: data,
        };
      }

      if (!unconfirmedUser) {
        redirectToExternalUrl('/app/');
        return {
          userData: data,
        };
      }

      return {
        userData: data,
        initialValues: {
          email: unconfirmedUser.email,
          country: unconfirmedUser.createdByCountry,
        },
      };
    },
  }),
  graphql(pricingPlanQuery, {
    name: 'pricingPlan',
    options: ({ userData: { unconfirmedUser } }) => ({
      variables: {
        id:
          unconfirmedUser.adminCampaign && unconfirmedUser.adminCampaign.plan
            ? unconfirmedUser.adminCampaign.plan.id
            : config.trialId,
      },
    }),
    skip: props =>
      props.userData.loading || props.userData.error || !props.userData.unconfirmedUser,
  }),
  graphql(countriesQuery, {
    props: ({ ownProps, data, data: { loading, countries, error } }) => {
      if (loading || error) {
        return {
          countriesData: data,
        };
      }

      const country = ownProps.initialValues ? ownProps.initialValues.country : '';

      const countryOptions = countries.map(({ name, vatCode, id }) => ({
        label: name,
        value: id,
        vatCode,
        countryCode: id,
      }));

      const currentCountryOption = countryOptions.find(
        option => country && option.value.toLowerCase() === country.toLowerCase(),
      );

      return {
        countryOptions,
        vatOptions: countryOptions
          .filter(option => !!option.vatCode)
          .map(({ vatCode, countryCode }) => ({
            label: vatCode,
            value: vatCode,
            vatCode,
            countryCode,
          })),
        initialValues: {
          ...ownProps.initialValues,
          country: currentCountryOption,
        },
      };
    },
  }),
  graphql(performRegisterMutation, { name: 'performRegister' }),
  graphql(organizationsChoicesQuery, { name: 'organizationsChoices' }),
)(
  reduxForm({
    form: formName,
    enableReinitialize: true,
    asyncValidate: Validator.validVatNumber,
    asyncBlurFields: ['vatNumber', 'vatPrefix'],
    shouldAsyncValidate: ({ trigger }) => ['blur'].includes(trigger),
  })(RegisterPage),
);
