// @flow
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Col, FormGroup } from 'reactstrap';
import { compose, graphql } from 'react-apollo';
import { isEmpty } from 'lodash';
import gql from 'graphql-tag';
import Button from 'Components/Forms/Button';
import Toast from 'Components/Toast';
import { Select, UploadField } from 'Components/Forms/Fields';
import FormErrors from 'Components/Forms/FormErrors';
import Skeleton from 'Components/Skeleton';
import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';
import { graphqlOK } from 'Utilities/underdash';
import LoadingSpinner from 'Components/LoadingSpinner';

type Props = {
  handleSubmit: Function,
  invalid: boolean,
  submitting: boolean,
  groupsData: Object,
  onClose: Function,
};

class UploadCSVForm extends Component<Props> {
  getGroupOptions = () => {
    const { groupsData } = this.props;

    return groupsData
      ? groupsData.clients.map(group => ({
          label: group.name,
          value: group.id,
        }))
      : [];
  };

  handleSubmit = ({ group, bulk_file }) => {
    const { onClose } = this.props;

    const formData = new FormData();
    formData.append('group', group.value);
    formData.append('bulk_file', bulk_file[0]);

    return fetch(`/import/bulk/upload/`, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    }).then(response => {
      if (!response) {
        return;
      }

      const throwError = () => Validator.throwSubmissionError({ __all__: response.statusText });
      if (!response.ok) {
        return response
          .json()
          .then(data => {
            if (data.validationErrors) {
              Validator.setRestResponseErrors(
                Validator.throwSubmissionError,
                data.validationErrors,
              );
            }
            throwError();
          }, throwError)
          .catch(error => {
            Toast.error(t('Something went wrong'));
            throw error;
          });
      }

      Toast.success(t('CSV file uploaded'));
      onClose && onClose();
    });
  };

  renderSkeleton() {
    return (
      <Skeleton
        className="indented-form-group form-group"
        linesConfig={[
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'text', options: { width: '30%' } },
          { type: 'input' },
          { type: 'button', options: { width: '45%', alignment: 'right' } },
        ]}
      />
    );
  }

  renderForm() {
    const { handleSubmit, invalid, submitting } = this.props;
    const loadingSpinner = submitting ? <LoadingSpinner /> : '';
    return (
      <form onSubmit={handleSubmit(this.handleSubmit)}>
        <FormErrors />
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Group')}</div>
            <Field
              defaultBehaviour
              name="group"
              placeholder={t('Select group')}
              options={this.getGroupOptions()}
              component={Select}
              searchable
              validate={[Validator.required]}
            />
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('CSV File')}</div>
            <Field name="bulk_file" component={UploadField} validate={[Validator.required]} />
          </Col>
        </FormGroup>
        <FormGroup className="indented-form-group">
          <hr />
          <div className="confirmation-button-wrapper text-right">
            {loadingSpinner}
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Upload')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }

  render() {
    return <div>{!graphqlOK(this.props) ? this.renderSkeleton() : this.renderForm()}</div>;
  }
}

const groupsDataQuery = gql`
  query uploadCSVForm_clients {
    clients {
      id
      name
    }
  }
`;

export default compose(
  graphql(groupsDataQuery, {
    options: {
      fetchPolicy: 'network-only',
    },
    props: ({ data }) => {
      const group =
        data && !isEmpty(data.clients)
          ? {
              label: data.clients[0].name,
              value: data.clients[0].id,
            }
          : {};

      return {
        groupsData: data,
        initialValues: {
          group,
        },
      };
    },
  }),
)(reduxForm({ form: 'UploadCSVForm', enableReinitialize: true })(UploadCSVForm));
