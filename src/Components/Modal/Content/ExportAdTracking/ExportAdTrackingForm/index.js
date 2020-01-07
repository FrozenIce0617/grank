// @flow
import React, { Component } from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { compose, graphql, withApollo } from 'react-apollo';
import { FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import FileSaver from 'file-saver';
import LoadingSpinner from 'Components/LoadingSpinner';
import { DateField, Select } from 'Components/Forms/Fields';
import Button from 'Components/Forms/Button';
import { showModal } from 'Actions/ModalAction';
import Validator from 'Utilities/validation';
import { t } from 'Utilities/i18n';
import { decodeBase64 } from 'Utilities/underdash';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';

type Props = {
  handleSubmit: Function,
  submitting: boolean,
  invalid: boolean,

  exportAdTracking: Function,
};

const channelOptions = [{ id: 1, label: 'Google' }, { id: 2, label: 'Facebook' }];

class ExportAdTrackingForm extends Component<Props> {
  handleSubmit = data => {
    return this.props
      .exportAdTracking({
        variables: {
          input: data,
        },
      })
      .then(({ data: { exportAdTracking: { errors, file } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        } else {
          const blob = new Blob([decodeBase64(file)], { type: 'data:text/csv;charset=utf-8' });
          FileSaver.saveAs(blob, 'accuranker_ad_trackking_export.csv');
        }
      }, throwNetworkError);
  };

  render() {
    const { handleSubmit, invalid, submitting } = this.props;

    const loadingSpinner = submitting ? <LoadingSpinner /> : null;
    return (
      <form className="move-domain-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <FormGroup className="indented-form-group">
          {t('Use this form to export ad tracking.')}
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="form-label required">{t('Start Date')}</div>
          <Field
            name="startDate"
            type="text"
            placeholder={t('Select Start Date')}
            component={DateField}
            validate={Validator.required}
          />
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="form-label required">{t('End Date')}</div>
          <Field
            name="endDate"
            type="text"
            placeholder={t('Select End Date')}
            component={DateField}
            validate={Validator.required}
          />
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="form-label required">{t('Channel')}</div>
          <Field
            name="channel"
            type="text"
            placeholder={t('Select Channel')}
            component={Select}
            options={channelOptions}
            validate={Validator.required}
          />
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="confirmation-button-wrapper text-right">
            {loadingSpinner}
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Export')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

const exportAdTrackingMutations = gql`
  mutation exportAdTracking($input: ExportAdTrackingInput!) {
    exportAdTracking(input: $input) {
      errors {
        messages
        field
      }
      file
    }
  }
`;

export default compose(
  withApollo,
  connect(
    null,
    { showModal },
  ),
  graphql(exportAdTrackingMutations, { name: 'exportAdTracking' }),
  reduxForm({
    form: 'MoveDomainForm',
  }),
)(ExportAdTrackingForm);
