// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import LoadingSpinner from 'Components/LoadingSpinner';
import { TextAreaField } from 'Components/Forms/Fields';
import Validator from 'Utilities/validation';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';
import Toast from 'Components/Toast';
import { noop } from 'lodash';

import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n/index';

import './feedback-form.scss';
import gql from 'graphql-tag';

type Props = {
  answerId: string,

  handleSubmit: Function,
  submitting: boolean,
  onAnswer: Function,
  invalid: boolean,

  answerFeedbackQuestion: Function,
};

class FeedbackForm extends Component<Props> {
  static defaultProps = {
    onAnswer: noop,
  };

  handleSubmit = data => {
    const { answerId } = this.props;
    return this.props
      .answerFeedbackQuestion({
        variables: {
          input: {
            id: answerId,
            text: data.answer,
          },
        },
      })
      .then(({ data: { answerFeedbackQuestion: { errors } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        }
        this.props.onAnswer();
        Toast.success(t('Thank you for you feedback!'));
      }, throwNetworkError);
  };

  render() {
    const { handleSubmit, invalid, submitting } = this.props;

    const loadingSpinner = submitting ? <LoadingSpinner /> : null;
    return (
      <form className="feedback-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <FormGroup className="indented-form-group">
          <div className="form-label required">{t('Please share your feedback here.')}</div>
          <Field
            name="answer"
            type="text"
            placeholder={t('Please be as specific as possible')}
            component={TextAreaField}
            validate={[Validator.required]}
          />
        </FormGroup>
        <FormGroup className="indented-form-group">
          <div className="confirmation-button-wrapper text-right">
            {loadingSpinner}
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Send')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

const answerFeedbackQuestion = gql`
  mutation feedbackForm_answerFeedbackQuestion($input: AnswerFeedbackQuestionInput!) {
    answerFeedbackQuestion(input: $input) {
      errors {
        messages
        field
      }
    }
  }
`;

export default compose(
  graphql(answerFeedbackQuestion, { name: 'answerFeedbackQuestion' }),
  reduxForm({
    form: 'FeedbackForm',
  }),
)(FeedbackForm);
