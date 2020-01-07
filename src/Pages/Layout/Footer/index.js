import React, { Component } from 'react';
import AtoDjango from '../../../Utilities/django';

import { t } from '../../../Utilities/i18n';

import './footer.scss';

class Footer extends Component {
  render() {
    return (
      <footer>
        <ul>
          <li>
            <a href="https://www.accuranker.com/terms" target="_blank" rel="noopener noreferrer">
              {t('Terms and conditions')}
            </a>
          </li>
          <li>
            <a href="https://www.accuranker.com/refund" target="_blank" rel="noopener noreferrer">
              {t('Refund policy')}
            </a>
          </li>
          <li>
            <a href="https://www.accuranker.com/privacy" target="_blank" rel="noopener noreferrer">
              {t('Privacy policy')}
            </a>
          </li>
          <li>
            <AtoDjango href="/info/contact/">{t('Contact us')}</AtoDjango>
          </li>
          <li>
            <AtoDjango href="/api/">{t('Developer API')}</AtoDjango>
          </li>
        </ul>
      </footer>
    );
  }
}

export default Footer;
