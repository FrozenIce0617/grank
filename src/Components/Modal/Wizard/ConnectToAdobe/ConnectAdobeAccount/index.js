// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { tct, t } from 'Utilities/i18n';
import { Field, reduxForm } from 'redux-form';
import { FormGroup } from 'reactstrap';
import Button from 'Components/Forms/Button';
import { TextField } from 'Components/Forms/Fields';
import Validator from 'Utilities/validation';
import Toast from 'Components/Toast';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';
import FormErrors from 'Components/Forms/FormErrors';

type FormValues = {
  username: string,
  secret: string,
  description: string,
};

type Props = {
  handleSubmit: Function,
  onSubmit?: Function,
  addAdobeMarketingConnection: Function,
  onCancel: Function,
  submitting: boolean,
  refresh?: Function,
};

class ConnectAdobeAccount extends React.Component<Props> {
  onSubmit = (values: FormValues) => {
    const { refresh } = this.props;
    const { username, secret, description } = values;
    return this.props
      .addAdobeMarketingConnection({
        variables: {
          input: {
            username,
            secret,
            description,
          },
        },
      })
      .then(({ data: { addAdobeMarketingConnection: { errors, connection } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        }
        refresh && refresh();
        this.props.onSubmit && this.props.onSubmit({ connectionId: connection.id });
      }, throwNetworkError)
      .catch(error => {
        Toast.error(t('Failed to add connection'));
        throw error;
      });
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <p className="alert alert-info">
          {tct(
            'If you are having trouble setting up your Adobe Analytics account, then we have a guide on how to get started which you can read [link:here].',
            {
              link: (
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://www.accuranker.com/help/integrations/adobe-analytics"
                />
              ),
            },
          )}
        </p>

        <FormErrors />
        <div className="form-label required">{t('User Name')}</div>
        <FormGroup>
          <Field
            name="username"
            placeholder={t('Name')}
            component={TextField}
            disabled={submitting}
            validate={Validator.required}
          />
        </FormGroup>
        <div className="form-label required">{t('Shared Secret')}</div>
        <FormGroup>
          <Field
            name="secret"
            placeholder={t('Secret')}
            component={TextField}
            disabled={submitting}
            validate={Validator.required}
          />
        </FormGroup>
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

const addAdobeMarketingConnectionQuery = gql`
  mutation connectAdobeAccount_addAdobeMarketingConnection(
    $input: AddAdobeMarketingConnectionInput!
  ) {
    addAdobeMarketingConnection(input: $input) {
      connection {
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
  graphql(addAdobeMarketingConnectionQuery, { name: 'addAdobeMarketingConnection' }),
  reduxForm({ form: 'ConnectAdobeAccount' }),
)(ConnectAdobeAccount);
