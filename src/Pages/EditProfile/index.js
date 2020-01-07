// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Col, FormGroup, Container } from 'reactstrap';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { showModal } from 'Actions/ModalAction';
import { changeLanguage, updateUserGoogleConnections } from 'Actions/UserAction';
import { gaToggleRefetch, gaSetFromCallback } from 'Actions/GoogleAccountsAction';
import { updateDefaultCompareTo } from 'Actions/FilterAction';
import User from 'Queries/user';

import ActionsMenu from 'Pages/Layout/ActionsMenu';
import Button from 'Components/Forms/Button';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import FacebookButton from 'Components/SocialConnect/Facebook';
import GooglePlusButton from 'Components/SocialConnect/Google';
import Toast from 'Components/Toast';
import { TextField, Select } from 'Components/Forms/Fields';
import { getButtonsConfigs } from 'Components/PeriodFilter/buttons';

import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';

import RefreshIcon from 'icons/refresh.svg?inline';

import './edit-profile.scss';

type Props = {
  client: Object,
  APIToken: Object,
  handleSubmit: Function,
  invalid: Boolean,
  performEditProfile: Function,
  resetAPIToken: Function,
  submitting: Boolean,
  initialValues: Object,
  changeLanguage: Function,
  initialValues: Object,
  showModal: Function,
  gaToggleRefetch: Function,
  gaSetFromCallback: Function,
  setUser: Function,
  shouldRefetch: boolean,
  removeDriveConnection: Function,
  updateUserGoogleConnections: Function,
  updateDefaultCompareTo: Function,
  defaultCompareTo: string,
};

class EditProfile extends Component<Props> {
  handleSubmit: Function;
  resetAPIToken: Function;
  getElement: Function;
  renderField: Function;

  languageOptions = [{ value: 'da', label: t('Danish') }, { value: 'en', label: t('English') }];
  defaultKeywordsPageOptions = [
    { value: 'overview', label: t('Overview') },
    { value: 'keywords', label: t('Keywords') },
    { value: 'competitors', label: t('Competitors') },
    { value: 'competitors_ranking', label: t('Competitors ranking') },
    { value: 'landing_pages', label: t('Landing pages') },
    { value: 'tags', label: t('Tags') },
    { value: 'notes', label: t('Notes') },
  ];

  defaultCompareToOptions = getButtonsConfigs().map(({ id, label, getRange }) => ({
    value: id,
    label,
    getRange,
  }));

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.shouldRefetch && !this.props.shouldRefetch) {
      this.props.gaToggleRefetch();
      this.props.gaSetFromCallback(false);

      this.props.client
        .query({
          query: User.queries.getUser,
          fetchPolicy: 'network-only',
        })
        .then(({ data: { user: { googleConnections } } }) => {
          this.props.updateUserGoogleConnections(googleConnections);
        });
    }
  }

  handleSubmit = ({ fullName, email, language, defaultKeywordsPage, defaultCompareTo }) => {
    const { initialValues: user } = this.props;
    const lang = language.value || language;
    const updateMyUserInput = {
      fullName,
      email,
      language: lang,
      defaultKeywordsPage: defaultKeywordsPage.value || defaultKeywordsPage,
      defaultCompareTo: defaultCompareTo.value || defaultCompareTo,
      resetApiToken: false,
    };

    if (defaultCompareTo.value !== this.props.defaultCompareTo)
      this.props.updateDefaultCompareTo(defaultCompareTo.value);

    return this.props
      .performEditProfile({
        variables: {
          updateMyUserInput,
        },
      })
      .then(({ data: { updateMyUser: { errors } } }) => {
        if (errors && errors.length) {
          Toast.error('Something went wrong');
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('Profile saved'));
          if (lang !== user.language) {
            window.location.reload();
          }
        }
      });
  };

  resetAPIToken = () => {
    const {
      initialValues: { fullName, email, language, defaultKeywordsPage, defaultCompareTo },
    } = this.props;
    const updateMyUserInput = {
      fullName,
      email,
      language: language.value || language,
      defaultKeywordsPage: defaultKeywordsPage.value || defaultKeywordsPage,
      defaultCompareTo: defaultCompareTo.value || defaultCompareTo,
      resetApiToken: true,
    };
    this.props
      .resetAPIToken({ variables: { updateMyUserInput } })
      .then(this.props.APIToken.refetch);
  };

  renderAPIToken = () => {
    const { APIToken } = this.props;
    return APIToken.loading || APIToken.error ? null : (
      <FormGroup row className="indented-form-group">
        <Col lg={12}>
          <div>
            <div className="form-label">{t('API Token')}</div>
            <span className="token">{APIToken.user.apiToken}</span>{' '}
            <RefreshIcon className="refresh-token-link" onClick={this.resetAPIToken} />
            <br />
            <span className="small">
              <Link to="/api">{t('Click here to find more information about our API')}</Link>
            </span>
          </div>
        </Col>
      </FormGroup>
    );
  };

  handleRemoveDrive = () => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: t('Delete Google Drive Connection?'),
        description: t(
          'All scheduled reports that you have created and that use Google Drive will be deleted.',
        ),
        cancelLabel: t('Cancel'),
        confirmLabel: t('Delete connection'),
        action: () => {
          this.props
            .removeDriveConnection({})
            .then(({ data: { removeDriveConnection: { user: { googleConnections } } } }) => {
              this.props.updateUserGoogleConnections(googleConnections);
            });
        },
      },
    });
  };

  handleAddDrive = () => {
    this.props.showModal({
      modalType: 'ConnectToDrive',
      modalTheme: 'light',
      modalProps: {
        message: t(
          'You do not have a Google Drive connection setup with AccuRanker. Please connect to your Google account to allow AccuRanker to create spreadsheet reports. AccuRanker will only have access to the files it creates, and cannot read other files.',
        ),
        modalType: 'ConnectToDrive',
      },
    });
  };

  renderGoogleDriveAccount = () => {
    const hasDrive = this.props.initialValues.googleConnections.length > 0;
    return (
      <FormGroup row className="indented-form-group">
        <Col lg={12}>
          <div className="form-label">{t('Google Drive Connection')}</div>
          {hasDrive ? (
            <div>
              <span className="token">{t('Connected')}</span>{' '}
              <span className="small link" onClick={this.handleRemoveDrive}>
                {t('Remove connection')}
              </span>
            </div>
          ) : (
            <div>
              <span className="token">{t('No connection')}</span>{' '}
              <span className="small link" onClick={this.handleAddDrive}>
                {t('Add connection')}
              </span>
            </div>
          )}
        </Col>
      </FormGroup>
    );
  };

  render() {
    const { handleSubmit, invalid, submitting } = this.props;
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="profile" />
        <Container className="generic-page profile" fluid>
          <div style={{ width: '100%', maxWidth: '550px' }}>
            <form onSubmit={handleSubmit(this.handleSubmit)}>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('Full Name')}</div>
                  <Field
                    name="fullName"
                    placeholder={t('Enter full name')}
                    component={TextField}
                    validate={Validator.required}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('Email')}</div>
                  <Field
                    name="email"
                    type="email"
                    placeholder={t('Enter your email')}
                    component={TextField}
                    validate={[Validator.required, Validator.email]}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('Language')}</div>
                  <Field
                    defaultBehaviour
                    matchProp="label"
                    name="language"
                    placeholder={t('Select language')}
                    options={this.languageOptions}
                    component={Select}
                    searchable={false}
                    validate={[Validator.required]}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('Default keywords page')}</div>
                  <Field
                    defaultBehaviour
                    matchProp="label"
                    name="defaultKeywordsPage"
                    placeholder={t('Select page')}
                    options={this.defaultKeywordsPageOptions}
                    component={Select}
                    searchable={false}
                    validate={[Validator.required]}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="indented-form-group">
                <Col lg={12}>
                  <div className="form-label required">{t('Default "compare to" parameter')}</div>
                  <Field
                    defaultBehaviour
                    matchProp="label"
                    name="defaultCompareTo"
                    placeholder={t('Select default comparer')}
                    options={this.defaultCompareToOptions}
                    component={Select}
                    searchable={false}
                    validate={[Validator.required]}
                  />
                </Col>
              </FormGroup>
              {this.renderAPIToken()}
              {this.renderGoogleDriveAccount()}
              <br />
              <FormGroup row className="indented-form-group">
                <Col lg={6} className="text-center">
                  <FacebookButton />
                </Col>
                <Col lg={6} className="text-center">
                  <GooglePlusButton />
                </Col>
              </FormGroup>
              <FormGroup className="indented-form-group">
                <hr />
                <div className="confirmation-button-wrapper text-right">
                  <Button disabled={invalid || submitting} submit theme="orange">
                    {t('Update')}
                  </Button>
                </div>
              </FormGroup>
            </form>
          </div>
        </Container>
      </DashboardTemplate>
    );
  }
}

const performEditProfileQuery = gql`
  mutation editProfile_editMyUser($updateMyUserInput: UpdateMyUserInput!) {
    updateMyUser(input: $updateMyUserInput) {
      user {
        id
        fullName
        email
        language
        defaultKeywordsPage
        defaultCompareTo
      }
      errors {
        field
        messages
      }
    }
  }
`;

const APITokenQuery = gql`
  query editProfile_APIToken {
    user {
      id
      apiToken
    }
  }
`;

const resetAPITokenQuery = gql`
  mutation editProfile_editMyUser($updateMyUserInput: UpdateMyUserInput!) {
    updateMyUser(input: $updateMyUserInput) {
      errors {
        field
        messages
      }
    }
  }
`;

const removeDriveConnectionQuery = gql`
  mutation editProfile_editMyUser {
    removeDriveConnection {
      user {
        id
        googleConnections {
          id
        }
      }
    }
  }
`;

export default compose(
  withApollo,
  graphql(performEditProfileQuery, { name: 'performEditProfile' }),
  graphql(APITokenQuery, { name: 'APIToken' }),
  graphql(resetAPITokenQuery, { name: 'resetAPIToken' }),
  graphql(removeDriveConnectionQuery, { name: 'removeDriveConnection' }),
  connect(
    ({ user, googleAccounts, filter }) => ({
      initialValues: user,
      shouldRefetch: googleAccounts.shouldRefetch,
      defaultCompareTo: filter.defaultCompareTo,
    }),
    {
      changeLanguage,
      showModal,
      updateUserGoogleConnections,
      gaToggleRefetch,
      gaSetFromCallback,
      updateDefaultCompareTo,
    },
  ),
)(reduxForm({ form: 'EditProfile', enableReinitialize: true })(EditProfile));
