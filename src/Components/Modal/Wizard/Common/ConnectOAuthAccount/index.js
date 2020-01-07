// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import { Field, reduxForm } from 'redux-form';
import { FormGroup } from 'reactstrap';
import Button from 'Components/Forms/Button';
import { TextField } from 'Components/Forms/Fields';
import Validator from 'Utilities/validation';
import config from 'config';
import { join as joinPaths } from 'path';
import { resolve as resolveUrl } from 'url';
import Toast from 'Components/Toast';
import { IntegrationOAuthProviders } from 'Types/Integration';

type FormValues = {
  description: string,
};

type Props = {
  modalParams: Object,
  handleSubmit: Function,
  onSubmit?: Function,
  googleConnectionUrl: Function,
  onCancel: Function,
  submitting: boolean,
  passedState: Object,
};

export const redirectUri = resolveUrl(
  config.baseUrl,
  joinPaths(config.basename, '/account/googleoauth/callback'),
);

export const generateState = () => {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(40);
  window.crypto.getRandomValues(array);
  array = array.map(x => validChars.charCodeAt(x % validChars.length));
  return String.fromCharCode.apply(null, array);
};

class ConnectOAuthAccount extends React.Component<Props> {
  onSubmit = (values: FormValues) =>
    this.props
      .googleConnectionUrl({
        variables: {
          input: {
            redirectUri,
            type: this.props.modalParams.modalProps.integration.type,
          },
        },
      })
      .then(
        ({
          data: {
            googleConnectionUrl: { authorizeUrl },
          },
        }) => {
          const state = generateState();
          sessionStorage.setItem(
            'oAuthData',
            JSON.stringify({
              url: window.location.pathname.replace(config.basename, ''),
              description: values.description,
              state,
              passedState: this.props.passedState,
              modalParams: this.props.modalParams,
              redirectUri,
              type: this.props.modalParams.modalProps.integration.type,
            }),
          );

          window.location = `${authorizeUrl}&state=${state}`;
          this.props.onSubmit && this.props.onSubmit();
        },
        () => {
          Toast.error(t('Failed to add connection'));
        },
      );

  render() {
    const { handleSubmit, submitting } = this.props;
    let style = {};

    if (
      this.props.modalParams.modalProps.integration.type ===
      IntegrationOAuthProviders.GOOGLE_DRIVE.type
    ) {
      style = {
        display: 'none',
      };
    }

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <div style={style}>
          <div className="form-label required">{t('Description')}</div>
          <FormGroup>
            <Field
              name="description"
              placeholder={t('Description')}
              component={TextField}
              disabled={submitting}
              validate={Validator.required}
            />
          </FormGroup>
        </div>
        <div className="form-actions">
          <Button theme="grey" disabled={submitting} onClick={this.props.onCancel}>
            {t('Cancel')}
          </Button>
          <Button theme="orange" disabled={submitting} submit>
            {t('Add connection')}
          </Button>
        </div>
      </form>
    );
  }
}

const googleConnectionUrlQuery = gql`
  mutation connectOAuthAccount_oAuthUrls($input: GoogleAccountUrlInput!) {
    googleConnectionUrl(input: $input) {
      authorizeUrl
    }
  }
`;

export default compose(
  graphql(googleConnectionUrlQuery, { name: 'googleConnectionUrl' }),
  reduxForm({ form: 'ConnectOAuthAccount' }),
)(ConnectOAuthAccount);
