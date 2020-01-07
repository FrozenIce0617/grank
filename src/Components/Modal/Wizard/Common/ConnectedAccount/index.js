// @flow
import React, { Component } from 'react';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';

type Props = {
  message: string,
  onSubmit: Function,
};

export default class ConnectedAccount extends Component<Props> {
  render() {
    const { message, onSubmit } = this.props;
    return (
      <div>
        <p>{message}</p>
        <div className="form-actions">
          <Button theme="orange" onClick={onSubmit}>
            {t('Close')}
          </Button>
        </div>
      </div>
    );
  }
}
