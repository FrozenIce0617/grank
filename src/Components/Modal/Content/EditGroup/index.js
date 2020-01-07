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
import toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import Validator from 'Utilities/validation';
import './edit-group.scss';

type Props = {
  hideModal: Function,
  editGroup: Function,
  groupId: string,
  handleSubmit: Function,
  refetch: Function,
  organizationId: string,
};

type State = {
  inProgress: boolean,
};

class EditGroup extends Component<Props, State> {
  state = {
    inProgress: false,
  };

  handleSubmit = (values: any) => {
    const input = {
      id: this.props.groupId,
      name: values.groupName,
      organization: this.props.organizationId,
      delete: false,
    };
    this.setState({ inProgress: true });
    this.props
      .editGroup({ variables: { input } })
      .then(
        () => {
          this.props.refetch();
          this.props.hideModal();
        },
        () => {
          toast.error(t('Failed to edit group'));
        },
      )
      .then(() => {
        this.setState({ inProgress: false });
      });
  };

  render() {
    const inProgress = this.state.inProgress;
    return (
      <ModalBorder className="edit-group" title={t('Edit group')} onClose={this.props.hideModal}>
        <form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
          <div className="form-label required">{t('Group name')}</div>
          <Field
            name="groupName"
            placeholder={t('Group name')}
            component={TextField}
            validate={[Validator.required]}
          />
          <div className="footer">
            <Button theme="grey" disabled={inProgress} onClick={this.props.hideModal}>
              {t('Cancel')}
            </Button>
            <Button theme="orange" submit disabled={inProgress}>
              {t('Save')}
            </Button>
          </div>
        </form>
      </ModalBorder>
    );
  }
}

const editGroupQuery = gql`
  mutation editGroup_updateClient($input: UpdateClientInput!) {
    updateClient(input: $input) {
      client {
        id
        name
      }
    }
  }
`;

const mapStateToProps = state => ({
  organizationId: state.user.organization.id,
});

const EditGroupForm = reduxForm({
  form: 'AddGroupForm',
})(EditGroup);

export default compose(
  graphql(editGroupQuery, { name: 'editGroup' }),
  connect(
    mapStateToProps,
    { hideModal },
  ),
)(EditGroupForm);
