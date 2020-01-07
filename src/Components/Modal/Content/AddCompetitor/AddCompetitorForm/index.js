// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Col, Row, FormGroup, Container } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import Toast from 'Components/Toast';
import Button from 'Components/Forms/Button';
import { TextField } from 'Components/Forms/Fields';
import { t } from 'Utilities/i18n/index';
import Validator from 'Utilities/validation';

import './add-competitor-form.scss';
import { withRouter } from 'react-router';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';
import FormErrors from 'Components/Forms/FormErrors';

type Props = {
  handleSubmit: Function,
  invalid: boolean,
  submitting: boolean,
  addCompetitor: Function,
  onClose: Function,
  domainId: string,
  refresh: Function,
};

class AddCompetitorForm extends Component<Props> {
  handleSubmit = ({ domain, googleBusinessName }) => {
    const addCompetitorInput = {
      domain,
      competitorForDomain: this.props.domainId,
      googleBusinessName,
    };

    return this.props
      .addCompetitor({
        variables: {
          addCompetitorInput,
        },
      })
      .then(({ data: { addCompetitor: { competitor: competitorObj, errors } } }) => {
        if (!competitorObj) {
          throwSubmitErrors(errors);
        } else {
          Toast.success(t('Competitor added'));
          this.props.refresh();
          this.props.onClose();
        }
      }, throwNetworkError);
  };

  render() {
    const { invalid, submitting, handleSubmit } = this.props;

    return (
      <Container>
        <form className="row add-competitor-form" onSubmit={handleSubmit(this.handleSubmit)}>
          <Col xs={12} style={{ padding: '0' }}>
            <Row>
              <Col xs={12}>
                <FormErrors />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div>
                  <FormGroup row className="indented-form-group">
                    <Col lg={12}>
                      <div className="form-label required">{t('Domain Name')}</div>
                      <Field
                        name="domain"
                        placeholder={t('Domain name')}
                        component={TextField}
                        validate={[Validator.required]}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row className="indented-form-group">
                    <Col lg={12}>
                      <div className="form-label">{t('Google Business Name')}</div>
                      <Field
                        name="googleBusinessName"
                        placeholder={t('Google Business name')}
                        component={TextField}
                      />
                    </Col>
                  </FormGroup>
                  <hr />
                  <div className="confirmation-button-wrapper text-right">
                    <Button disabled={invalid || submitting} submit theme="orange">
                      {t('Save')}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </form>
      </Container>
    );
  }
}

const addCompetitorQuery = gql`
  mutation addCompetitorForm_addCompetitor($addCompetitorInput: AddCompetitorInput!) {
    addCompetitor(input: $addCompetitorInput) {
      competitor {
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
  withRouter,
  graphql(addCompetitorQuery, { name: 'addCompetitor' }),
)(
  reduxForm({
    form: 'AddCompetitorForm',
  })(AddCompetitorForm),
);
