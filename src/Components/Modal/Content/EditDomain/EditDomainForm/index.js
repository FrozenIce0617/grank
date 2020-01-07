// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Col, Row, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import { formValueSelector } from 'redux-form';
import cn from 'classnames';

import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import { TextField, LocaleDropdownField, Select, Checkbox } from 'Components/Forms/Fields';
import Skeleton from '../Skeleton';
import AdvancedSettings from 'Components/Modal/Content/AddDomain/AddDomainForm/AdvancedSettings';
import { showModal, hideModal } from 'Actions/ModalAction';
import toast from 'Components/Toast';

import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import underdash from 'Utilities/underdash';

import './edit-domain-form.scss';

type Props = {
  domainId: number,
  handleSubmit: Function,
  invalid: boolean,
  submitting: boolean,
  clients: Object,
  locales: Object,
  isGAConnected: boolean,
  isGSCConnected: boolean,
  isAdobeMarketingConnected: boolean,
  updateDomain: Function,
  change: Function,
  onClose: Function,
  refresh: Function,
  showModal: Function,
  hideModal: Function,
  initialValues: Object,
  user: Object,
  domainInfoData: Object,
  pauseChecked: boolean,
  removeAdobeAccount: Function,
  removeGAAccount: Function,
  removeGSCAccount: Function,
};

type State = {
  showAdvancedSettings: boolean,
};

class EditDomainForm extends Component<Props, State> {
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
    paused,
  }) => {
    const updateDomainInput = {
      id: this.props.domainId,
      domain,
      displayName: displayName || '',
      defaultCountrylocale: defaultSearchLocale,
      client: belongsToGroup.value || belongsToGroup,
      googleBusinessName: googleBusinessName || '',
      includeSubdomains: this.state.showAdvancedSettings ? !!includeSubdomains : false,
      exactMatch: this.state.showAdvancedSettings ? !!exactMatch : false,
      defaultLocation: this.state.showAdvancedSettings ? defaultLocation || '' : '',
      shareOfVoicePercentage: !!shareOfVoicePercentage,
      paused,
    };

    return this.props
      .updateDomain({
        variables: {
          updateDomainInput,
        },
      })
      .then(({ data: { updateDomain: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error('Something went wrong');
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('Domain updated'));
          this.handleRefresh();
          this.props.onClose();
        }
      });
  };

  handleRefresh = () => {
    const { refresh, domainInfoData } = this.props;
    domainInfoData.refetch();
    refresh();
  };

  handleDisconnectFromAnalytics = () => {
    const {
      isGAConnected,
      isAdobeMarketingConnected,
      domainId,
      removeAdobeAccount,
      removeGAAccount,
    } = this.props;

    let removeAccount;
    if (isAdobeMarketingConnected) {
      removeAccount = removeAdobeAccount;
    } else if (isGAConnected) {
      removeAccount = removeGAAccount;
    }

    removeAccount &&
      removeAccount({ variables: { input: { domainId } } }).then(
        () => {
          toast.success(t('Account removed'));
          this.handleRefresh();
          this.props.onClose();
        },
        () => {
          toast.error(t('Failed to remove account'));
        },
      );
  };

  handleDisconnectFromGSC = () => {
    const { removeGSCAccount, domainId } = this.props;
    removeGSCAccount({ variables: { input: { domainId } } }).then(
      () => {
        toast.success(t('Account removed'));
        this.handleRefresh();
        this.props.onClose();
      },
      () => {
        toast.error(t('Failed to remove account'));
      },
    );
  };

  handleConnectToAnalytics = () => {
    this.props.showModal({
      modalType: 'ConnectToAnalytics',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        refresh: this.handleRefresh,
      },
    });
  };

  handleConnectToGSC = () => {
    this.props.showModal({
      modalType: 'ConnectToGSC',
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        refresh: this.handleRefresh,
      },
    });
  };

  handleChange = ({ currentTarget: { checked, name } }: SyntheticEvent<HTMLInputElement>) => {
    this.props.change(name, checked);
  };

  toggleShowAdvancedSettings = () =>
    this.setState({ showAdvancedSettings: !this.state.showAdvancedSettings });

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
      isGAConnected,
      isGSCConnected,
      isAdobeMarketingConnected,
      initialValues,
      user,
      domainInfoData,
      pauseChecked,
    } = this.props;

    const clientOptions = clients.map(client => ({ label: client.name, value: client.id }));
    const { showAdvancedSettings } = this.state;

    // TODO: use showPaused when pause feature will be enabled
    const showPaused =
      false &&
      (user.organization &&
        user.organization.activePlan &&
        user.organization.activePlan.featureCanPause);

    const { totalKeywords, pausedKeywordRate } = domainInfoData.domain || {};
    const keywordsNumberToChargeOnPause = Math.floor((totalKeywords * pausedKeywordRate) / 100);
    const shouldShowNotification =
      showPaused && pauseChecked && !initialValues.paused && keywordsNumberToChargeOnPause > 0;

    const shouldConnectToAnalytics = !isGAConnected && !isAdobeMarketingConnected;
    const { shareOfVoicePercentage } = initialValues || {};

    return (
      <form className="row edit-domain-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <Col xs={12}>
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
                      defaultChecked={shareOfVoicePercentage}
                      helpText={t('Show domain share of voice as a percentage of maximum value.')}
                    >
                      {t('Show share of voice as percentage')}
                    </Field>
                  </Col>
                </FormGroup>
                {!initialValues.paused &&
                  showPaused && (
                    <FormGroup
                      row
                      className={cn('indented-form-group', { 'mb-0': shouldShowNotification })}
                    >
                      <Col lg={12}>
                        <Field
                          name="paused"
                          component={Checkbox}
                          defaultChecked={initialValues.paused}
                          helpText={t(
                            'When a domain is paused, it cannot be un-paused for 7 days.',
                          )}
                        />
                      </Col>
                    </FormGroup>
                  )}
                {shouldShowNotification && (
                  <p className="alert alert-warning">
                    {t(
                      'Once paused you will be charged on %s keywords',
                      keywordsNumberToChargeOnPause,
                    )}
                  </p>
                )}
                <a tabIndex={0} className="masked-link" onClick={this.toggleShowAdvancedSettings}>
                  {showAdvancedSettings ? t('Hide advanced settings') : t('Show advanced settings')}
                </a>
                <hr />
                <AdvancedSettings
                  initialValues={this.props.initialValues}
                  showAdvancedSettings={showAdvancedSettings}
                  onChange={this.props.change}
                />
                <FormGroup className="indented-form-group">
                  <div className="confirmation-button-wrapper">
                    <div className="google-connect-buttons">
                      <Button
                        onClick={
                          shouldConnectToAnalytics
                            ? this.handleConnectToAnalytics
                            : this.handleDisconnectFromAnalytics
                        }
                        theme="orange"
                      >
                        {shouldConnectToAnalytics
                          ? t('Connect to analytics')
                          : t('Disconnect from analytics')}
                      </Button>
                      <Button
                        onClick={
                          !isGSCConnected ? this.handleConnectToGSC : this.handleDisconnectFromGSC
                        }
                        theme="orange"
                      >
                        {!isGSCConnected
                          ? t('Connect to search console')
                          : t('Disconnect from search console')}
                      </Button>
                    </div>
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

const getDomainInfoQuery = gql`
  query editDomainForm_getDomainInfo($id: ID!) {
    domain(id: $id) {
      id
      domain
      pausedKeywordRate
      totalKeywords
      includeSubdomains
      exactMatch
      displayName
      defaultCountrylocale {
        id
      }
      defaultLocation
      googleBusinessName
      shareOfVoicePercentage
      paused
      client {
        id
      }
      googleOauthConnectionGa {
        id
      }
      googleOauthConnectionGsc {
        id
      }
      adobeMarketingConnection {
        id
      }
    }
  }
`;

const getClientsQuery = gql`
  query editDomainForm_clients {
    clients {
      id
      name
    }
  }
`;

const localesQuery = gql`
  query editDomainForm_countrylocales {
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

const updateDomain = gql`
  mutation editDomainForm_updateDomain($updateDomainInput: UpdateDomainInput!) {
    updateDomain(input: $updateDomainInput) {
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

const removeAdobeAccountQuery = gql`
  mutation editDomainForm_removeAdobeAnalyticsAccount($input: RemoveAdobeMarketingAccountInput!) {
    removeAdobeMarketingAccount(input: $input) {
      domain {
        id
      }
    }
  }
`;

const removeGoogleAccountQuery = gql`
  mutation editDomainForm_removeGoogleAnalyticsAccount($input: RemoveGoogleAnalyticsAccountInput!) {
    removeGoogleAnalyticsAccount(input: $input) {
      domain {
        id
      }
    }
  }
`;

const removeGSCAccountQuery = gql`
  mutation editDomainForm_removeGoogleSearchConsoleAccount(
    $input: RemoveGoogleSearchConsoleAccountInput!
  ) {
    removeGoogleSearchConsoleAccount(input: $input) {
      domain {
        id
      }
    }
  }
`;

const formValuesSelector = formValueSelector('EditDomainForm');

const mapStateToProps = state => ({
  pauseChecked: formValuesSelector(state, 'paused'),
  user: state.user,
});

export default compose(
  connect(
    mapStateToProps,
    { showModal, hideModal },
  ),
  graphql(getClientsQuery, { name: 'clients', options: { fetchPolicy: 'network-only' } }),
  graphql(localesQuery, { name: 'locales' }),
  graphql(updateDomain, { name: 'updateDomain' }),
  graphql(removeAdobeAccountQuery, { name: 'removeAdobeAccount' }),
  graphql(removeGoogleAccountQuery, { name: 'removeGAAccount' }),
  graphql(removeGSCAccountQuery, { name: 'removeGSCAccount' }),
  graphql(getDomainInfoQuery, {
    name: 'domainInfo',
    options: props => ({
      variables: {
        id: props.domainId,
      },
      fetchPolicy: 'network-only',
    }),
    props: (data: Object) => {
      if (data.domainInfo.loading || data.domainInfo.error) {
        return { domainInfoData: data.domainInfo, initialValues: {} };
      }
      const { domain } = data.domainInfo;
      return {
        domainInfoData: data.domainInfo,
        isGAConnected: domain.googleOauthConnectionGa && domain.googleOauthConnectionGa.id,
        isGSCConnected: domain.googleOauthConnectionGsc && domain.googleOauthConnectionGsc.id,
        isAdobeMarketingConnected:
          domain.adobeMarketingConnection && domain.adobeMarketingConnection.id,
        initialValues: {
          ...domain,
          defaultSearchLocale: domain.defaultCountrylocale.id,
          belongsToGroup: domain.client.id,
        },
      };
    },
  }),
)(
  reduxForm({
    form: 'EditDomainForm',
    enableReinitialize: true,
  })(EditDomainForm),
);
