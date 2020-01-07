// @flow
import React, { Component } from 'react';
import { Container, Col, FormGroup } from 'reactstrap';
import { t } from 'Utilities/i18n/index';
import TextInput from 'Components/Controls/TextInput/index';
import Button from 'Components/Forms/Button/index';
import copy from 'copy-to-clipboard';

type Props = {
  planId: string,
  onClose: () => void,
};

class CreatePlanSuccess extends Component<Props> {
  getPlanUrl = () => `${window.location.origin}/app/checkout/1/${this.props.planId}`;

  handleCopy = () => {
    copy(this.getPlanUrl());
  };

  render() {
    const url = this.getPlanUrl();
    return (
      <Container className="generic-page sales-plans" fluid>
        <Col md={6} xs={12}>
          <FormGroup className="indented-form-group">
            <strong className="form-title not-numbered">
              {t('Your custom plan has been successfully created')}
            </strong>
          </FormGroup>
          <FormGroup className="indented-form-group">
            <TextInput value={url} readOnly disabled />
          </FormGroup>
          <FormGroup className="indented-form-group">
            <div className="confirmation-button-wrapper text-right">
              <Button onClick={this.handleCopy}>{t('Copy to clipboard')}</Button>
              <Button onClick={this.props.onClose}>{t('Done')}</Button>
            </div>
          </FormGroup>
        </Col>
      </Container>
    );
  }
}

export default CreatePlanSuccess;
