// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Field, reduxForm } from 'redux-form';
import { TextField } from 'Components/Forms/Fields';
import { FormGroup } from 'reactstrap';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n/index';
import Toast from 'Components/Toast';
import Validator from 'Utilities/validation';
import FormErrors from 'Components/Forms/FormErrors';

type Props = {
  accountId: string,
  hideModal: Function,
  updateAdobeConnection: Function,
  adobeConnection: Object,
  handleSubmit: Function,
  submitting: boolean,
  refresh?: Function,
};

class EditAdobeAccount extends Component<Props> {
  onSubmit = ({ description }) => {
    const { accountId } = this.props;
    return this.props
      .updateAdobeConnection({
        variables: {
          input: {
            id: accountId,
            description,
            delete: false,
          },
        },
      })
      .then(({ data: { updateAdobeMarketingConnection: { errors } } }) => {
        if (errors && errors.length) {
          Validator.throwSubmissionError(errors);
        } else {
          this.props.hideModal();
          this.props.refresh && this.props.refresh();
          this.props.adobeConnections.refetch();
        }
      })
      .catch(error => {
        Toast.error(t('Failed to update'));
        throw error;
      });
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <ModalBorder
        className="edit-adobe-account"
        onClose={submitting ? this.props.hideModal : null}
        title={t('Edit Adobe account')}
      >
        <form onSubmit={handleSubmit(this.onSubmit)}>
          <FormErrors />
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
            <Button theme="grey" disabled={submitting} onClick={this.props.hideModal}>
              {t('Cancel')}
            </Button>
            <Button theme="orange" disabled={submitting} submit>
              {t('Edit connection')}
            </Button>
          </div>
        </form>
      </ModalBorder>
    );
  }
}

const adobeConnectionsQuery = gql`
  query editAdobeAccount_adobeConnections {
    user {
      id
      organization {
        id
        adobeMarketingConnections {
          id
          description
        }
      }
    }
  }
`;

const updateAdobeConnectionQuery = gql`
  mutation editAdobeAccount_updateAdobeConnection($input: UpdateAdobeMarketingConnectionInput!) {
    updateAdobeMarketingConnection(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  graphql(adobeConnectionsQuery, {
    name: 'adobeConnections',
    options: (props: Props) => ({
      fetchPolicy: 'network-only',
    }),
    props: ({ ownProps, adobeConnections }) => {
      const { accountId } = ownProps;

      let description = '';
      if (!adobeConnections.loading && !adobeConnections.error) {
        const connection =
          adobeConnections.user &&
          adobeConnections.user.organization.adobeMarketingConnections.find(
            conn => conn.id === accountId,
          );
        description = connection ? connection.description : '';
      }
      return {
        ...ownProps,
        initialValues: {
          description,
        },
        adobeConnections,
      };
    },
  }),
  graphql(updateAdobeConnectionQuery, { name: 'updateAdobeConnection' }),
  connect(
    null,
    { hideModal },
  ),
)(reduxForm({ form: 'EditAdobeAccount', enableReinitialize: true })(EditAdobeAccount));
