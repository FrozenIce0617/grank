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

type Props = {
  accountId: string,
  hideModal: Function,
  updateGoogleConnection: Function,
  googleConnection: Object,
  handleSubmit: Function,
  submitting: boolean,
  refresh?: Function,
  accountName: string,
};

class EditAccount extends Component<Props> {
  onSubmit = ({ description }) => {
    const id = this.props.accountId;
    return this.props
      .updateGoogleConnection({
        variables: {
          input: {
            id,
            description,
            delete: false,
          },
        },
      })
      .then(
        ({
          data: {
            updateGoogleConnection: { errors },
          },
        }) => {
          if (errors && errors.length) {
            Toast.error(t('Failed to update'));
            Validator.throwSubmissionError(errors);
          } else {
            this.props.hideModal();
            this.props.refresh && this.props.refresh();
            this.props.googleConnection.refetch();
          }
        },
        () => {
          Toast.error(t('Failed to update'));
        },
      );
  };

  render() {
    const { handleSubmit, submitting, accountName } = this.props;
    return (
      <ModalBorder
        className="edit-account"
        onClose={submitting ? this.props.hideModal : null}
        title={t('Edit %s account', accountName)}
      >
        <form onSubmit={handleSubmit(this.onSubmit)}>
          <div className="form-label">{t('Description')}</div>
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

const googleConnectionQuery = gql`
  query editAccount_googleConnections($id: ID!) {
    googleConnection(id: $id) {
      description
    }
  }
`;

const updateGoogleConnectionQuery = gql`
  mutation editAccount_updateGoogleConnection($input: UpdateGoogleConnectionInput!) {
    updateGoogleConnection(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export default compose(
  graphql(googleConnectionQuery, {
    name: 'googleConnection',
    options: (props: Props) => {
      const id = props.accountId;
      return ({ variables: { id }, skip: !id }: any);
    },
    props: ({ ownProps, googleConnection }) => {
      const description =
        googleConnection.loading || googleConnection.error
          ? ''
          : googleConnection.googleConnection.description;
      return {
        ...ownProps,
        initialValues: {
          description,
        },
        googleConnection,
      };
    },
  }),
  graphql(updateGoogleConnectionQuery, { name: 'updateGoogleConnection' }),
  connect(
    null,
    { hideModal },
  ),
)(reduxForm({ form: 'EditAccountForm', enableReinitialize: true })(EditAccount));
