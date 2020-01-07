// @flow
import React, { Component } from 'react';
import { t, tct } from 'Utilities/i18n/index';
import Button from 'Components/Forms/Button';

class CancelPlan extends Component<> {
  state = { step: 1 };

  nextStep = () => {
    this.setState({
      step: 2,
    });
  };

  render() {
    const { step } = this.state;

    if (step === 1) {
      return (
        <div>
          <p>{t('We’re sorry to hear that you want to cancel your AccuRanker subscription')}</p>
          <p>
            {t('Click next to follow the process on how to cancel your AccuRanker subscription.')}
          </p>

          <hr />

          <div className="confirmation-button-wrapper text-right">
            <Button theme="grey" onClick={this.props.onClose}>
              {t('Cancel')}
            </Button>
            <Button onClick={this.nextStep} theme="red">
              {t('Next')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <p>
          {tct(
            'In order to cancel your AccuRanker subscription, you’ll need to call our customer service at [link:+45 78 75 01 86], which are available from 08:00 to 16:00, Mon-Fri, Central European Time.',
            {
              link: <a href="tel:+4578750186" className="link" />,
            },
          )}
        </p>
        <p>
          {t(
            'Please note that a subscription needs to be cancelled 14 days before the subscription is set for renewal.',
          )}
        </p>
        <p>
          {t(
            'Your subscription has been cancelled when you receive a e-mail confirmation from our customer representative.',
          )}
        </p>

        <hr />

        <div className="confirmation-button-wrapper text-right">
          <Button theme="grey" onClick={this.props.onClose}>
            {t('Cancel')}
          </Button>
          <a className="btn btn-red ml-1" href="tel:+4578750186">
            {t('Call +45 78 75 01 86')}
          </a>
        </div>
      </div>
    );
  }
}

export default CancelPlan;
