// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Col, Row, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';

import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import { TextField, LocaleDropdownField, Select, Checkbox } from 'Components/Forms/Fields';
import Skeleton from '../Skeleton';
import AdvancedSettings from './AdvancedSettings';
import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import underdash from 'Utilities/underdash';

import './add-domain-form.scss';
import { withRouter } from 'react-router';

type Props = {
  handleSubmit: Function,
  invalid: boolean,
  submitting: boolean,
  clients: Object,
  locales: Object,
  addDomain: Function,
  change: Function,
  onClose: Function,
  refresh: Function,
};

type State = {
  showAdvancedSettings: boolean,
};

class AddDomainForm extends Component<Props, State> {
  state = {
    showAdvancedSettings: false,
  };

  handleSubmit = ({
    domain,
    displayName,
    defaultSearchLocale,
    belongsToGroup,
    googleBusinessName,
    includeSubdomains,
    exactMatch,
    defaultLocation,
    shareOfVoicePercentage,
  }) => {
    const addDomainInput = {
      domain,
      displayName: displayName || '',
      defaultCountrylocale: defaultSearchLocale,
      client: belongsToGroup.value || belongsToGroup,
      googleBusinessName: googleBusinessName || '',
      includeSubdomains: this.state.showAdvancedSettings ? !!includeSubdomains : false,
      exactMatch: this.state.showAdvancedSettings ? !!exactMatch : false,
      defaultLocation: this.state.showAdvancedSettings ? defaultLocation || '' : '',
      shareOfVoicePercentage: !!shareOfVoicePercentage,
    };

    return this.props
      .addDomain({
        variables: {
          addDomainInput,
        },
      })
      .then(({ data: { addDomain: { domain: domainObj, errors } } }) => {
        if (!domainObj) {
          Toast.error(errors[0].messages[0]);
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('Added'));
          this.props.refresh && this.props.refresh();
          this.props.onClose();
        }
      });
  };

  toggleShowAdvancedSettings = () =>
    this.setState({ showAdvancedSettings: !this.state.showAdvancedSettings });

  handleChange = ({ currentTarget: { checked, name } }: SyntheticEvent<HTMLInputElement>) => {
    this.props.change(name, checked);
  };

  render() {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return <Skeleton />;
    }
    const {
      clients: { clients },
      locales: { countrylocales },
      invalid,
      submitting,
      handleSubmit,
    } = this.props;
    const clientOptions = clients.map(client => ({ label: client.name, value: client.id }));
    const { showAdvancedSettings } = this.state;
    return (
      <form className="row add-domain-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <Col lg={12}>
          <Row>
            <Col xs={12}>
              <div>
                <FormGroup row className="indented-form-group">
                  <Col lg={12}>
                    <div className="form-label required">{t('Domain name')}</div>
                    <Field
                      name="domain"
                      placeholder={t('Domain name')}
                      component={TextField}
                      validate={[Validator.required]}
                      helpText={t(
                        'No http:// or www. You can enter a path that must be found. Eg. example.com/path. Search result must then begin with your path to match.',
                      )}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row className="indented-form-group">
                  <Col lg={12}>
                    <div className="form-label">{t('Display name')}</div>
                    <Field
                      name="displayName"
                      placeholder={t('Display name')}
                      component={TextField}
                      helpText={
                        <span>
                          <strong>{t('Optional.')}</strong>{' '}
                          {t(
                            'If set this will display instead of the domain name. Automatically set for YouTube videos.',
                          )}
                        </span>
                      }
                    />
                  </Col>
                </FormGroup>
                <FormGroup row className="indented-form-group">
                  <Col lg={12}>
                    <div className="form-label required">{t('Default search locale')}</div>
                    <Field
                      placeholder={t('Select locale')}
                      component={LocaleDropdownField}
                      locales={countrylocales}
                      name="defaultSearchLocale"
                      validate={Validator.required}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row className="indented-form-group">
                  <Col xs={12} lg={12}>
                    <div className="form-label required">{t('Belongs to group')}</div>
                    <Field
                      defaultBehaviour
                      name="belongsToGroup"
                      placeholder={t('Belongs to group')}
                      component={Select}
                      validate={Validator.required}
                      options={clientOptions}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row className="indented-form-group">
                  <Col lg={12}>
                    <div className="form-label">{t('Google Business Name')}</div>
                    <Field
                      name="googleBusinessName"
                      placeholder={t('Google Business name')}
                      component={TextField}
                      helpText={t(
                        'For some local results Google does not include a link to the website. ' +
                          'To make sure we can still find the domain on the search result page, ' +
                          'please enter the exact name of the Google Business page here.',
                      )}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row className="indented-form-group">
                  <Col lg={12}>
                    <Field
                      name="shareOfVoicePercentage"
                      component={Checkbox}
                      onChange={this.handleChange}
                      defaultChecked={false}
                      helpText={t('Show domain share of voice as a percentage of maximum value.')}
                    >
                      {t('Show share of voice as percentage')}
                    </Field>
                  </Col>
                </FormGroup>
                <a tabIndex={0} className="masked-link" onClick={this.toggleShowAdvancedSettings}>
                  {showAdvancedSettings ? t('Hide advanced settings') : t('Show advanced settings')}
                </a>
                <hr />
                <AdvancedSettings
                  showAdvancedSettings={showAdvancedSettings}
                  onChange={this.props.change}
                />
                <FormGroup className="indented-form-group">
                  <div className="confirmation-button-wrapper text-right">
                    <Button disabled={invalid || submitting} submit theme="orange">
                      {t('Save')}
                    </Button>
                  </div>
                </FormGroup>
              </div>
            </Col>
          </Row>
        </Col>
      </form>
    );
  }
}

const getClientsQuery = gql`
  query addDomainForm_clients {
    clients {
      id
      name
    }
  }
`;

const localesQuery = gql`
  query addDomainForm_getLocales {
    countrylocales {
      id
      countryCode
      region
      locale
      googleSupport
      bingSupport
      yahooSupport
    }
  }
`;

const addDomainQuery = gql`
  mutation addDomainForm_addDomain($addDomainInput: AddDomainInput!) {
    addDomain(input: $addDomainInput) {
      domain {
        id
      }
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  withRouter,
  graphql(getClientsQuery, { name: 'clients' }),
  graphql(localesQuery, { name: 'locales' }),
  graphql(addDomainQuery, { name: 'addDomain' }),
)(
  reduxForm({
    form: 'AddDomainForm',
  })(AddDomainForm),
);
