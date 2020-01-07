// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Field, reduxForm } from 'redux-form';
import { TextField } from 'Components/Forms/Fields';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import Validator from 'Utilities/validation';
import './add-group.scss';

type Props = {
  hideModal: Function,
  addGroup: Function,
  organizationId: string,
  handleSubmit: Function,
  refetch: Function,
};

type State = {};

class AddGroup extends Component<Props, State> {
  handleSubmit = (values: any) => {
    const input = {
      organization: this.props.organizationId,
      name: values.name,
    };

    return this.props
      .addGroup({ variables: { input } })
      .then(({ data: { addClient: { client, errors } } }) => {
        if (!client) {
          Toast.error(errors[0].messages[0]);
          Validator.setResponseErrors(Validator.throwSubmissionError, errors);
        } else {
          Toast.success(t('Added'));
          this.props.refetch();
          this.props.hideModal();
        }
      });
  };

  render() {
    const { invalid, submitting, handleSubmit } = this.props;

    return (
      <ModalBorder className="add-group" title={t('Add Group')} onClose={this.props.hideModal}>
        <form onSubmit={handleSubmit(this.handleSubmit)}>
          <div className="form-label required">{t('Group Name')}</div>
          <Field
            name="name"
            placeholder={t('Group name')}
            component={TextField}
            validate={[Validator.required]}
          />
          <div className="footer">
            <Button theme="orange" submit disabled={invalid || submitting}>
              {t('Save')}
            </Button>
          </div>
        </form>
      </ModalBorder>
    );
  }
}

const addGroupQuery = gql`
  mutation addGroup_addClient($input: AddClientInput!) {
    addClient(input: $input) {
      client {
        id
      }
      errors {
        field
        messages
      }
    }
  }
`;

const mapStateToProps = state => ({
  organizationId: state.user.organization.id,
});

const AddGroupForm = reduxForm({
  form: 'AddGroupForm',
})(AddGroup);

export default compose(
  graphql(addGroupQuery, { name: 'addGroup' }),
  connect(
    mapStateToProps,
    { hideModal },
  ),
)(AddGroupForm);
