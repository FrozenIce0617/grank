// @flow
import React, { Component } from 'react';
import { Col, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';
import { startsWith } from 'lodash';

import Button from 'Components/Forms/Button';
import { TextField } from 'Components/Forms/Fields';

import { t, tct } from 'Utilities/i18n';
import Validator from 'Utilities/validation';
import './enter-link.scss';

type Props = {
  invalid: boolean,
  submitting: boolean,
  handleSubmit: Function,
  onClose: Function,
  onSubmit: Function,
};

class EnterLink extends Component<Props, State> {
  handleSubmit = ({ link, placement, campaign }) => {
    this.props.onSubmit({
      link: startsWith(link, 'https://www.accuranker.com/') ? link : 'https://www.accuranker.com/',
      placement,
      campaign,
    });
  };

  render() {
    const { invalid, submitting, handleSubmit } = this.props;

    return (
      <form className="enter-link-form" onSubmit={handleSubmit(this.handleSubmit)}>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <p>
              {tct(
                "To create an affiliate link paste any URL you'd like to link to from the [link:AccuRanker website] below. You will then be able to copy paste a version of this URL with your affiliate ID added.",
                {
                  link: <a href="https://www.accuranker.com/" target="_blank" />,
                },
              )}
            </p>

            <p>
              {t(
                "You can track additional parameters such as 'campaign' and 'placement', these fields are optional and dynamic.",
              )}
            </p>
          </Col>
        </FormGroup>
        <FormGroup row className="indented-form-group">
          <Col lg={12}>
            <Field
              name="link"
              placeholder={t('URL to link to (e.g. https://www.accuranker.com/product)')}
              component={TextField}
              validate={[Validator.required]}
            />
          </Col>
        </FormGroup>
        <div className="form-label">{t('Optional fields')}</div>

        <FormGroup row className="indented-form-group">
          <Col lg={6}>
            <Field name="campaign" placeholder={t('(optional) campaign')} component={TextField} />
          </Col>

          <Col lg={6}>
            <Field name="placement" placeholder={t('(optional) placement')} component={TextField} />
          </Col>
        </FormGroup>

        <FormGroup className="indented-form-group">
          <div className="confirmation-button-wrapper text-right">
            <Button disabled={invalid || submitting} submit theme="orange">
              {t('Create link')}
            </Button>
          </div>
        </FormGroup>
      </form>
    );
  }
}

export default reduxForm({
  form: 'EnterLink',
  enableReinitialize: true,
})(EnterLink);
