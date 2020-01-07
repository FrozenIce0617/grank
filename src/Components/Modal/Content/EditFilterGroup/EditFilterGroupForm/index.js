// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Col, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import { isRequiredFilter } from 'Types/FilterSet';
import type { FilterSet } from 'Types/FilterSet';
import { Link } from 'react-router-dom';

import Button from 'Components/Forms/Button';
import FormErrors from 'Components/Forms/FormErrors';
import { TextField, Checkbox } from 'Components/Forms/Fields';
import { showModal, hideModal } from 'Actions/ModalAction';
import Toast from 'Components/Toast';
import LoadingSpinner from 'Components/LoadingSpinner';
import generateCreateUserFilterInput from 'Components/Filters/generateCreateUserFilterInput';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';

import { t, tct } from 'Utilities/i18n';
import Validator from 'Utilities/validation';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';

type Props = {
  invalid: boolean,
  submitting: boolean,
  filterGroup: Object,
  filterSet: FilterSet,
  handleSubmit: Function,
  updateUserFilter: Function,
  onClose: Function,
  onEdit: (filterGroupId: string, filterGroupName: string, isAPIFilter: boolean) => void,
};

class EditFilterGroupForm extends Component<Props> {
  handleSubmit = ({ name, isAPIFilter: apiFilter }) => {
    const { filterGroup, filterSet } = this.props;
    return this.props
      .updateUserFilter({
        variables: {
          input: generateCreateUserFilterInput(
            name,
            filterGroup.filters.filter(filter => !isRequiredFilter(filter.attribute, filterSet)),
            filterSet,
            {
              id: filterGroup.id,
              defaultForDomains: filterGroup.defaultForDomains || false,
              defaultForKeywords: filterGroup.defaultForKeywords || [],
              apiFilter,
            },
          ),
        },
      })
      .then(({ data: { updateFilter: { errors } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        }
        this.props.onEdit(filterGroup.id, name, apiFilter);
        this.props.onClose();
      }, throwNetworkError)
      .catch(error => {
        Toast.error(t('Unable to edit segment'));
        throw error;
      });
  };

  render() {
    const { invalid, submitting, handleSubmit, filterSet } = this.props;

    const loadingSpinner = submitting ? <LoadingSpinner /> : '';
    return (
      <form className="edit-filter-group-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <FormErrors />
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <div className="form-label required">{t('Segment name')}</div>
            <Field
              name="name"
              placeholder={t('Segment name')}
              component={TextField}
              validate={[Validator.required]}
            />
          </Col>
        </FormGroup>
        {filterSet === KEYWORDS_FILTER_SET && (
          <FormGroup row className="indented-form-group">
            <Col lg={12}>
              <Field
                name="isAPIFilter"
                component={Checkbox}
                helpText={tct(
                  'Mark this segment to be used in API as API filter. See more details [link:here].',
                  {
                    link: <Link to="/integrations/api" />,
                  },
                )}
              >
                {t('API filter')}
              </Field>
            </Col>
          </FormGroup>
        )}
        <FormGroup className="indented-form-group">
          <div className="confirmation-button-wrapper text-right">
            {loadingSpinner}
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Save')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

const updateUserFilterMutation = gql`
  mutation updateUserFilter($input: UpdateUserFilterInput!) {
    updateFilter(input: $input) {
      errors {
        field
        messages
      }
      filter {
        id
        name
        defaultForDomains
        defaultForKeywords
        apiFilter
        filters
      }
    }
  }
`;

const mapStateToProps = (state, props) => ({
  user: state.user,
  initialValues: {
    name: props.filterGroup.name,
    isAPiFilter: props.filterGroup.apiFilter,
  },
});

export default compose(
  connect(
    mapStateToProps,
    { showModal, hideModal },
  ),
  graphql(updateUserFilterMutation, { name: 'updateUserFilter' }),
)(
  reduxForm({
    form: 'EditFilterGroupForm',
    enableReinitialize: true,
  })(EditFilterGroupForm),
);
