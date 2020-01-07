// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import LocaleSelector from '../../../Selectors/LocaleSelector';

import Braintree from 'braintree-web-drop-in';
import { t } from '../../../Utilities/i18n/index';

import './payment-widget.scss';

type Props = {
  authorizationToken: string,
  onCreate: (Object | boolean) => void,
  onError: Error => void,
  fullLocale: string,
  uniqueid: string,
  companyInfoError: any,
  standalone: boolean,
};

type State = {
  braintreeInstance: any,
  waitingText: string,
};

class PaymentWidget extends Component<Props, State> {
  braintreeContainer: HTMLDivElement;

  static defaultProps = {
    standalone: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      braintreeInstance: null,
      waitingText: t('Connecting to payment provider...'),
    };
  }

  componentDidMount() {
    if (this.state.braintreeInstance || !this.props.authorizationToken) return;
    this.setup();
  }

  componentDidUpdate(prevProps) {
    this.onUpdate(prevProps);
  }

  componentWillUnmount() {
    this.onUnmount();
  }

  async onUpdate(prevProps) {
    if (
      this.props.authorizationToken &&
      (prevProps.authorizationToken !== this.props.authorizationToken ||
        this.props.fullLocale !== prevProps.fullLocale ||
        this.props.uniqueid !== prevProps.uniqueid)
    ) {
      try {
        await this.tearDown();
        this.setup();
      } catch (e) {
        if (this.props.onError) {
          this.props.onError(e);
        }
      }
    }
  }

  async onUnmount() {
    if (!this.state.braintreeInstance) return;

    try {
      await this.tearDown();
    } catch (e) {
      if (this.props.onError) {
        this.props.onError(e);
      }
    }
  }

  setup() {
    if (this.props.companyInfoError) return;
    this.setState(
      {
        braintreeInstance: null,
      },
      () => {
        Braintree.create(
          {
            authorization: this.props.authorizationToken,
            container: this.braintreeContainer,
            paypal: {
              flow: 'vault',
              buttonStyle: {
                size: 'responsive',
                color: 'blue',
              },
            },
            locale: this.props.fullLocale,
          },
          (e, instance) => {
            if (e) {
              if (this.props.onError) {
                this.props.onError(e);
                return;
              }
            }

            if (this.props.onCreate && instance !== undefined) {
              if (instance.isPaymentMethodRequestable()) {
                this.props.onCreate(instance);
              } else {
                this.props.onCreate(false);
              }

              instance.on('paymentMethodRequestable', () => {
                this.props.onCreate(this.state.braintreeInstance);
              });

              instance.on('noPaymentMethodRequestable', () => {
                this.props.onCreate(false);
              });
            }

            this.setState({
              braintreeInstance: instance,
            });
          },
        );
      },
    );
  }

  tearDown() {
    return new Promise((resolve, reject) => {
      if (!this.state.braintreeInstance) return resolve();
      return this.state.braintreeInstance.teardown(err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  render() {
    const className = this.props.standalone ? 'standalone' : '';
    return (
      <div
        id="payment-form"
        data-unique-id={this.props.uniqueid}
        className={className}
        ref={ref => {
          this.braintreeContainer = ref;
        }}
        data-text={this.state.waitingText}
      />
    );
  }
}

const mapStateToProps = state => ({
  fullLocale: LocaleSelector(state),
});

const companyInfoQuery = gql`
  query paymentWidget_braintreeToken {
    paymentContact {
      braintreeToken
    }
  }
`;

export default compose(
  graphql(companyInfoQuery, {
    props: ({ data: { loading, paymentContact, error } }) => {
      if (loading || error) {
        return {
          companyInfoError: error,
        };
      }
      return {
        companyInfoError: error,
        authorizationToken: paymentContact.braintreeToken,
      };
    },
  }),
  connect(
    mapStateToProps,
    {},
  ),
)(PaymentWidget);
