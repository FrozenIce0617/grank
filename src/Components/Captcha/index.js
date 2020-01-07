//@flow
import React, { Component } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import config from 'config';

type Props = {
  input: any,
  refName: Function,
};

export default class Captcha extends Component<Props> {
  componentDidMount() {
    this.execute();
  }

  captchaRef: ReCAPTCHA;

  execute = () => {
    this.captchaRef.execute();
  };

  reset = () => {
    this.captchaRef.reset();
  };

  render() {
    const { input, refName } = this.props;
    return (
      <div>
        <ReCAPTCHA
          ref={ref => {
            this.captchaRef = ref;
            refName(ref);
          }}
          size="invisible"
          sitekey={config.recaptchaSitekey}
          onChange={input.onChange}
          badge="bottomleft"
        />
      </div>
    );
  }
}
