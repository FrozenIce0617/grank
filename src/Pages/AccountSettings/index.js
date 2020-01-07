// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Container, Col, Row, FormGroup } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Dropzone from 'react-dropzone';
import ActionsMenu from 'Pages/Layout/ActionsMenu';
import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import Toast from 'Components/Toast';
import { TextField, Checkbox } from 'Components/Forms/Fields';
import Button from 'Components/Forms/Button';
import Skeleton from 'Components/Skeleton';
import LabelWithHelp from 'Components/LabelWithHelp';
import { changeIsPartner } from 'Actions/UserAction';
import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import { isEmpty, merge } from 'lodash';
import { SubmissionError } from 'redux-form';

import './account-settings.scss';

type Props = {
  handleSubmit: Function,
  invalid: boolean,
  performUpdateAccount: Function,
  submitting: boolean,
  initialValues: Object,
  changeIsPartner: Function,
  organization: Object,
};

type State = {
  logo: Object,
  logoRemoved: boolean,
};

class AccountSettings extends Component<Props, State> {
  handleSubmit: Function;
  dropzoneRef;

  state = {
    logo: {},
    logoRemoved: false,
  };

  onDrop = files => {
    this.setState({ logo: files[0] });
  };

  removeFile = () => {
    URL.revokeObjectURL(this.state.logo.preview);
    this.setState({
      logo: {},
      logoRemoved: true,
    });
  };

  handleSubmit = ({ name, isPartner }) => {
    const {
      organization: { id },
    } = this.props;
    const updateAccountPromise = this.props
      .performUpdateAccount({
        variables: {
          input: {
            id,
            name,
            isPartner,
          },
        },
      })
      .then(({ data: { updateOrganization: { errors } } }) => {
        if (errors && errors.length) {
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          this.props.changeIsPartner(isPartner);
        }
      });

    const { logo, logoRemoved } = this.state;
    let imagePromise = Promise.resolve();
    if (logoRemoved && isEmpty(logo)) {
      imagePromise = this.removeUpload();
    } else if (!isEmpty(logo)) {
      imagePromise = this.upload();
    }
    imagePromise = imagePromise.then((resp?: Response) => {
      if (resp && !resp.ok) {
        // TODO update submission error
        throw new SubmissionError({});
      }
    });

    return Promise.all([updateAccountPromise, imagePromise].map(p => p.catch(error => error))).then(
      errResult => {
        if (errResult.every(item => !item)) {
          Toast.success(t('Account updated'));
        } else {
          Toast.error('Something went wrong');
          Validator.throwSubmissionError(errResult.reduce((acc, errors) => merge(acc, errors), {}));
        }
      },
    );
  };

  upload = () => {
    const { logo } = this.state;

    const formData = new FormData();
    formData.append('logo', logo);

    return fetch('/org/update_logo/', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });
  };

  removeUpload = () =>
    fetch('/org/update_logo/', {
      method: 'POST',
      credentials: 'same-origin',
    });

  renderImage = () => {
    const { organization } = this.props;
    const { logo, logoRemoved } = this.state;

    const resultLogo =
      (logo && logo.preview) || (organization && !logoRemoved && organization.logo);
    if (resultLogo) {
      return (
        <div>
          <img className="preview" src={resultLogo} />
          <div>
            <Button theme="red" type="button" onClick={this.removeFile}>
              {t('Delete file')}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div>
        <Dropzone
          className="dropzone"
          multiple={false}
          name="logo"
          accept="image/*"
          onDrop={this.onDrop}
          ref={ref => (this.dropzoneRef = ref)}
        >
          <h3 className="dropzone-content">{t('Drag file or click here to upload logo')}</h3>
        </Dropzone>
        <span
          className="btn btn-brand-green"
          onClick={() => this.dropzoneRef && this.dropzoneRef.open()}
        >
          {t('Select file')}
        </span>
      </div>
    );
  };

  renderSkeleton() {
    return (
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'text', options: { width: '60%' } },
          { type: 'input' },
          { type: 'input' },
          { type: 'input' },
          { type: 'input' },
          { type: 'input' },
          { type: 'text', options: { width: '25%' } },
          { type: 'button', options: { width: '45%', alignment: 'center' } },
        ]}
      />
    );
  }

  renderContent() {
    const { handleSubmit, invalid, submitting, initialValues } = this.props;
    return !initialValues ? (
      this.renderSkeleton()
    ) : (
      <form className="account-settings-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Account Name')}</div>
            <Field
              name="name"
              type="text"
              placeholder={t('Enter account name')}
              component={TextField}
              validate={Validator.required}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <Field name="isPartner" component={Checkbox} defaultChecked={initialValues.isPartner}>
              <LabelWithHelp
                className="form-label"
                tag="div"
                helpTitle={t('Sub-Accounts')}
                help={t(
                  'Check this to enable the sub-accounts feature. With this enabled you can access and create other AccuRanker accounts from your own account.',
                )}
              >
                {t('Enable sub-accounts')}
              </LabelWithHelp>
            </Field>
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label">{t('Account Logo')}</div>
            {this.renderImage()}
          </Col>
        </FormGroup>
        <FormGroup className="indented-form-group">
          <hr />
          <div className="confirmation-button-wrapper text-right">
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Save')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor="account" />
        <Container className="account-settings content-container with-padding" fluid>
          <Row>
            <Col lg={4}>{this.renderContent()}</Col>
          </Row>
        </Container>
      </DashboardTemplate>
    );
  }
}

const getAccountDataQuery = gql`
  query accountSettings_getOrgData {
    user {
      id
      organization {
        id
        name
        isPartner
        logo
      }
    }
  }
`;

const performUpdateAccountQuery = gql`
  mutation accountSettings_updateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { changeIsPartner },
  ),
  graphql(performUpdateAccountQuery, { name: 'performUpdateAccount' }),
  graphql(getAccountDataQuery, {
    name: 'getAccountData',
    props: ({ getAccountData: { error, loading, user } }) => {
      if (error || loading) {
        return undefined;
      }
      return { initialValues: user.organization, organization: user.organization };
    },
  }),
)(reduxForm({ form: 'AccountSettings' })(AccountSettings));
