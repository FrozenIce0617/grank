//@flow
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import cookies from 'react-cookies';
import moment from 'moment';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// actions
import { showModal } from 'Actions/ModalAction';
import { updateUserFeedback } from 'Actions/UserAction';

// utils
import { t, tct } from 'Utilities/i18n';
import { throwSubmitErrors, throwNetworkError } from 'Utilities/errors';

// components
import RateScale from 'Components/RateScale';

import './feedback-bar.scss';

import { doAnyway } from 'Utilities/promise';

type FeedbackQuestion = {
  id: string,
  text: string,
};

type Props = {
  question: FeedbackQuestion,

  showModal: Function,
  updateUserFeedback: Function,
  rateFeedbackQuestion: Function,
};

type State = {
  shouldAskRateOnTrustpilot: boolean,
};

const ASK_ME_LATER_PREFIX = 'feedback_ask_me_later';

class FeedbackBar extends Component<Props, State> {
  state = {
    shouldAskRateOnTrustpilot: false,
  };

  getAskMeLateCookieId = question => `${ASK_ME_LATER_PREFIX}_${question.id}`;

  handleAskLaterClick = (evt: SyntheticEvent<*>) => {
    const { question } = this.props;
    evt.preventDefault();

    // TODO implement mutation instead of setting cookie
    cookies.save(this.getAskMeLateCookieId(question), question.id, {
      expires: moment()
        .add(5, 'days')
        .toDate(),
      path: '/',
    });

    this.handleCloseBar();
  };

  handleCloseBar = (evt: SyntheticEvent<*>) => {
    evt && evt.preventDefault();

    this.props.updateUserFeedback();
  };

  handleFeedbackSend = (questionId: string, rate: number) => {
    const isGoodRate = this.isGoodRate(rate);
    // Probably we don't need to handle issue when feedback fails
    // as it will it's not good when the user want to give us positive feedback but see an error
    // so just leave it for sentry
    this.props
      .rateFeedbackQuestion({
        variables: {
          input: {
            mainQuestion: questionId,
            rate,
          },
        },
      })
      .then(({ data: { rateFeedbackQuestion: { answer: { id }, errors } } }) => {
        if (errors && errors.length) {
          throwSubmitErrors(errors);
        }

        if (!isGoodRate) {
          this.props.showModal({
            modalType: 'Feedback',
            modalTheme: 'light',
            modalProps: {
              answerId: id,
              onAnswer: this.handleCloseBar,
              onClose: this.handleCloseBar,
            },
          });
        }
      }, throwNetworkError)
      .then(
        ...doAnyway(() => {
          isGoodRate &&
            this.setState({
              shouldAskRateOnTrustpilot: true,
            });
        }),
      );
  };

  isGoodRate = value => value >= 7;

  handleRateSelect = (value: number) => {
    const { question } = this.props;
    this.handleFeedbackSend(question.id, value);
  };

  renderQuestion() {
    const { question } = this.props;
    const { shouldAskRateOnTrustpilot } = this.state;
    return (
      <ReactCSSTransitionGroup
        transitionName="feedback-rate-animation"
        transitionEnter={false}
        transitionLeave
        transitionLeaveTimeout={300}
        component="div"
        className="feedback-question-rate"
      >
        {!shouldAskRateOnTrustpilot ? (
          <div className="feedback-question">
            <div />
            <RateScale
              className="feedback-rate-scale"
              onSelect={this.handleRateSelect}
              question={question.text}
            />
            <a onClick={this.handleAskLaterClick} className="feedback-ask">
              {t('Ask me later')}
            </a>
          </div>
        ) : null}
      </ReactCSSTransitionGroup>
    );
  }

  renderTrustpilot() {
    const { shouldAskRateOnTrustpilot } = this.state;
    return (
      <ReactCSSTransitionGroup
        transitionName="feedback-social-animation"
        transitionEnter
        transitionLeave
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
        component="div"
        className="feedback-question-social"
      >
        {shouldAskRateOnTrustpilot ? (
          <div className="feedback-question">
            <div />
            <div className="feedback-question-social-content">
              <span>{t('🎉 Thank you for your feedback! 🎉')}</span>
              <br />
              {tct('Please leave a review on [link:Trustpilot]', {
                link: (
                  <a href="https://www.trustpilot.com/review/www.accuranker.com" target="_blank" />
                ),
              })}
            </div>
            <a onClick={this.handleCloseBar} className="feedback-ask">
              {t('Close')}
            </a>
          </div>
        ) : null}
      </ReactCSSTransitionGroup>
    );
  }

  render() {
    const { question } = this.props;

    return (
      <ReactCSSTransitionGroup
        transitionName="feedback-bar-animation"
        transitionEnter={false}
        transitionLeave
        transitionLeaveTimeout={300}
      >
        {question && !cookies.load(this.getAskMeLateCookieId(question)) ? (
          <div className="feedback-bar">
            {this.renderQuestion()}
            {this.renderTrustpilot()}
          </div>
        ) : null}
      </ReactCSSTransitionGroup>
    );
  }
}

const rateFeedbackQuestion = gql`
  mutation feedbackBar_rateFeedbackQuestion($input: RateFeedbackQuestionInput!) {
    rateFeedbackQuestion(input: $input) {
      answer {
        id
      }
      errors {
        messages
        field
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal, updateUserFeedback },
  ),
  graphql(rateFeedbackQuestion, { name: 'rateFeedbackQuestion' }),
)(FeedbackBar);
