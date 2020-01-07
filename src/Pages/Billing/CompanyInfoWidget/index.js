// @flow
import React, { Component } from 'react';
import { Field, reduxForm, getFormValues } from 'redux-form';
import { Col, FormGroup } from 'reactstrap';
import Select from 'react-select';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { setVatStatus } from 'Actions/OrderPlanAction';
import Skeleton from 'Components/Skeleton';
import LocaleSelector from 'Selectors/LocaleSelector';
import Validator from 'Utilities/validation';
import { t } from 'Utilities/i18n/index';
import { typeStr } from 'Utilities/underdash';

import LoadingSpinner from 'Components/LoadingSpinner';

type Props = {
  dispatch: Function,
  companyInfoError: any,
  countriesError: any,
  initialCountryHasVat: boolean,
  initialVatEntered: boolean,
  formValues: any,
  companyInfoLoading: boolean,
  countriesLoading: boolean,
  vatOptions: Array<Object>,
  countryOptions: Array<Object>,
  setVatStatus: Function,
  change: Function,
  setFormValidStatus: Function,
  valid: boolean,
  registrationMode: boolean,
};

type State = {
  showVatFields: boolean,
  braintreeUniqueId: any,
  formSubmitting: boolean,
  braintreeInstance: any,
  registrationMode: boolean,
};

class CompanyInfoWidget extends Component<Props, State> {
  renderField: Function;
  handleCountrySelectOnChange: Function;
  handleSelectOnBlur: Function;

  constructor(props) {
    super(props);
    this.state = {
      showVatFields: true,
      braintreeUniqueId: +new Date(),
      formSubmitting: false,
      braintreeInstance: false,
      registrationMode: props.registrationMode !== undefined ? props.registrationMode : false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.valid && this.props.valid !== prevProps.valid) {
      this.props.setFormValidStatus(this.props.valid);
    }
    if (
      this.props.initialCountryHasVat &&
      this.props.initialCountryHasVat !== prevProps.initialCountryHasVat
    ) {
      this.handleCountrySelectOnChange(this.props.initialCountryHasVat);
    }
    if (
      this.props.initialVatEntered &&
      this.props.initialVatEntered !== prevProps.initialVatEntered
    ) {
      this.props.setVatStatus(this.props.initialVatEntered);
    }
  }

  getVatOptionAndSetToField(countryCode) {
    const { vatOptions, change, formValues } = this.props;
    if (!vatOptions) return;
    const option = vatOptions.filter(vatOption => vatOption.countryCode === countryCode) || [];
    if (!formValues.vatNumber && option.length) change('vatPrefix', option[0]);
  }

  handleCountrySelectOnChange = data => {
    let shouldShow = true;
    if (typeStr(data) === 'boolean') {
      shouldShow = data;
    } else {
      shouldShow = typeStr(data) === 'object' ? !!data.vatCode : !!data;
    }
    this.setState({ showVatFields: shouldShow }, this.getVatOptionAndSetToField(data.value));
  };

  handleSelectOnBlur = field => {
    const {
      input,
      input: { value },
    } = field;
    input.onBlur(value);
  };

  renderOption({ label, countryCode }) {
    countryCode = countryCode.toLowerCase();
    const flagClassName = `inline-icon flag-icon flag-icon-${countryCode}`;
    return (
      <div>
        <span className={flagClassName} />
        {label}
      </div>
    );
  }

  renderCompanyName() {
    return (
      <FormGroup row className="indented-form-group">
        <Col xs={12} lg={12}>
          <Field
            label={t('Company name')}
            labelClassname="required"
            name="companyName"
            id="companyName"
            elementType="input"
            type="text"
            placeholder={t('Enter your company name')}
            component={this.renderField}
            validate={Validator.string}
          />
        </Col>
      </FormGroup>
    );
  }

  renderEmailInvoiceTo() {
    if (this.state.registrationMode) return;
    return (
      <FormGroup row className="indented-form-group">
        <Col xs={12} lg={12}>
          <Field
            label={t('Email address for invoices')}
            name="emailInvoiceTo"
            id="emailInvoiceTo"
            elementType="input"
            type="text"
            placeholder={t('Enter your email')}
            component={this.renderField}
            validate={Validator.email}
          />
        </Col>
      </FormGroup>
    );
  }

  renderVatFields() {
    if (!this.state.showVatFields) return;
    const { formValues } = this.props;
    const country = (formValues.country && formValues.country.countryCode) || '';
    let helpInfo = null;
    if (country !== 'DK') {
      helpInfo = (
        <span className="help-info">{t('Enter your VAT number to avoid VAT charges')}</span>
      );
    }
    return (
      <FormGroup row className="indented-form-group no-margin-bottom">
        <Col xs={5}>
          <Field
            label={t('EU vat number')}
            name="vatPrefix"
            id="vatPrefix"
            elementType="customSelect"
            type="text"
            placeholder={''}
            component={this.renderField}
            options={this.props.vatOptions}
            supressErrorMessage
          />
        </Col>
        <Col xs={7}>
          <Field
            label="&nbsp;"
            name="vatNumber"
            id="vatNumber"
            elementType="input"
            type="text"
            placeholder={t('Enter your vat number')}
            component={this.renderField}
          />
        </Col>
        {helpInfo}
      </FormGroup>
    );
  }

  renderField = field => {
    const {
      supressErrorMessage,
      meta: { asyncValidating, touched, error },
    } = field;
    const className = `${touched && error ? 'invalid' : ''}`;
    const asyncValidatingClassName = `${asyncValidating ? 'loading' : ''}`;
    const inputClassName = `form-control custom-form-control ${asyncValidatingClassName}`;
    const loadingSpinner = asyncValidating ? <LoadingSpinner /> : '';
    const errorMessage = !supressErrorMessage ? error : '';
    let element;

    if (field.elementType === 'customSelect') {
      element = (
        <Select
          name={field.input.id}
          className={asyncValidatingClassName}
          options={field.options}
          placeholder={field.placeholder}
          clearable={false}
          searchable={true}
          backspaceRemoves={false}
          deleteRemoves={false}
          {...field.input}
          onBlur={() => this.handleSelectOnBlur(field)}
          optionRenderer={field.optionRenderer}
        />
      );
    } else {
      element = (
        <field.elementType
          className={inputClassName}
          type={field.type}
          placeholder={field.placeholder}
          {...field.input}
        />
      );
    }
    return (
      <div className={className}>
        <label htmlFor={field.input.id} className={field.labelClassname}>
          {field.label}
        </label>
        {element}
        {loadingSpinner}
        <span className="error-message">{touched ? errorMessage : ''}</span>
      </div>
    );
  };

  render() {
    if (
      this.props.companyInfoLoading ||
      this.props.companyInfoError ||
      this.props.countriesLoading ||
      this.props.countriesError
    ) {
      return (
        <div>
          <Skeleton
            className="indented-form-group form-group"
            linesConfig={[
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '30%' } },
              { type: 'input' },
              { type: 'text', options: { width: '80%' } },
              { type: 'input' },
              { type: 'text', options: { width: '70%' } },
              { type: 'subtitle', options: { width: '40%' } },
            ]}
          />
        </div>
      );
    }

    return (
      <div>
        {this.renderCompanyName()}
        <FormGroup row className="indented-form-group">
          <Col xs={12} lg={6}>
            <Field
              label={t('Street')}
              labelClassname="required"
              name="street"
              id="street"
              elementType="input"
              type="text"
              placeholder={t('Enter your street')}
              component={this.renderField}
              validate={Validator.string}
            />
          </Col>
          <Col xs={12} lg={6}>
            <Field
              label={t('Zip/postal code')}
              labelClassname="required"
              name="zipcode"
              id="zipcode"
              elementType="input"
              type="text"
              placeholder={t('Enter your ZIP')}
              component={this.renderField}
              validate={Validator.string}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12} lg={6}>
            <Field
              label={t('City')}
              labelClassname="required"
              name="city"
              id="city"
              elementType="input"
              type="text"
              placeholder={t('Enter your city')}
              component={this.renderField}
              validate={Validator.string}
            />
          </Col>
          <Col xs={12} lg={6}>
            <Field
              label={t('State / Province / Region')}
              name="state"
              id="state"
              elementType="input"
              type="text"
              placeholder={t('Enter your state/province/region')}
              component={this.renderField}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col xs={12} lg={12}>
            <Field
              label={t('Country')}
              labelClassname="required"
              name="country"
              id="country"
              elementType="customSelect"
              type="text"
              placeholder={t('Select your country')}
              component={this.renderField}
              validate={Validator.required}
              onChange={this.handleCountrySelectOnChange}
              options={this.props.countryOptions}
              optionRenderer={this.renderOption}
            />
          </Col>
        </FormGroup>
        {this.renderVatFields()}
        {this.renderEmailInvoiceTo()}
        {!this.props.registrationMode && (
          <FormGroup className="indented-form-group">
            <span className="required-fields-info">* - {t('Required fields')}</span>
          </FormGroup>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  fullLocale: LocaleSelector(state),
  formValues: getFormValues('CompanyInfoForm')(state) || {}, //This basically gives us the form values in the props and it gets updated on keydown.
});

const countriesQuery = gql`
  query companyInfoWidget_countries {
    countries {
      id
      name
      isEu
      vatCode
    }
  }
`;

const companyInfoQuery = gql`
  query companyInfoWidget_paymentContact {
    paymentContact {
      companyName
      street
      zipcode
      city
      state
      country {
        id
        name
        isEu
        vatCode
      }
      vatPrefix
      vatNumber
      emailInvoiceTo
    }
  }
`;

export default withRouter(
  compose(
    graphql(countriesQuery, {
      props: ({ data: { loading, countries, error } }) => {
        if (loading || error) {
          return {
            countriesLoading: loading,
            countriesError: error,
          };
        }
        return {
          countryOptions: countries.map(({ name, vatCode, id }) => ({
            label: name,
            value: id,
            vatCode,
            countryCode: id,
          })),
          vatOptions: countries.filter(({ vatCode }) => !!vatCode).map(({ vatCode, id }) => ({
            label: vatCode,
            value: vatCode,
            vatCode,
            countryCode: id,
          })),
        };
      },
    }),
    graphql(companyInfoQuery, {
      options: {
        fetchPolicy: 'network-only',
      },
      props: ({ data: { loading, paymentContact, error } }) => {
        if (loading || error) {
          return {
            companyInfoLoading: loading,
            companyInfoError: error,
          };
        }
        const companyInfo = {
          companyInfoError: error,
          initialValues: {
            ...paymentContact,
            companyInfoLoading: loading,
            country: {
              label: paymentContact.country.name,
              value: paymentContact.country.id,
              countryCode: paymentContact.country.id,
              vatCode: paymentContact.country.vatCode,
            },
          },
          initialCountryHasVat: paymentContact.country.vatCode,
          initialVatEntered: !!paymentContact.vatNumber,
        };

        if (paymentContact.country.vatCode) {
          companyInfo.initialValues.vatPrefix = {
            label: paymentContact.country.vatCode,
            value: paymentContact.country.vatCode,
            countryCode: paymentContact.country.id,
            vatCode: paymentContact.country.vatCode,
          };
        }

        return companyInfo;
      },
    }),
    connect(
      mapStateToProps,
      { setVatStatus },
    ),
  )(
    reduxForm({
      enableReinitialize: true,
      form: 'CompanyInfoForm',
      asyncValidate: Validator.validVatNumber,
      asyncBlurFields: ['vatNumber', 'vatPrefix'],
      shouldAsyncValidate: ({ trigger }) => {
        switch (trigger) {
          case 'blur':
            return true;
          default:
            return false;
        }
      },
    })(CompanyInfoWidget),
  ),
);
