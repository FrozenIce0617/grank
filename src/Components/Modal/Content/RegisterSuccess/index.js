// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n';
import AtoDjango from 'Utilities/django';

class RegisterSuccess extends Component<{}> {
  render() {
    return (
      <div className="modal-content-container">
        <div className="modal-content-inner">
          <h2 className="modal-title">{t('TODO: Your account was created')}</h2>
          <p className="modal-main-text">{t('TODO: account created') /* TODO */}</p>
          <AtoDjango href="/" className="btn btn-brand-green btn-rounded">
            {t('TODO: Start using AccuRanker')}
          </AtoDjango>
        </div>
      </div>
    );
  }
}

export default RegisterSuccess;
