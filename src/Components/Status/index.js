// @flow
import React, { Component } from 'react';
import cn from 'classnames';
import { t } from 'Utilities/i18n/index';
import { showModal } from 'Actions/ModalAction';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import ExclamationIcon from 'icons/exclamation.svg?inline';
import './status.scss';

type Props = {
  showModal: Function,
  systemHealthNotice: number,
};

type State = {
  statusStorageKey?: string | null,
};

class Status extends Component<Props, State> {
  state = {
    statusStorageKey: localStorage.getItem('systemHealthNotice'),
  };

  componentDidMount() {
    const { systemHealthNotice } = this.props;
    const { statusStorageKey } = this.state;

    if (!systemHealthNotice || systemHealthNotice === 0)
      localStorage.removeItem('systemHealthNotice');

    if (systemHealthNotice && this.getStatus() !== statusStorageKey) {
      localStorage.removeItem('systemHealthNotice');
      this.setState({ statusStorageKey: null });
    }
  }

  getStatus = () => {
    const { systemHealthNotice } = this.props;
    switch (systemHealthNotice) {
      case 0:
        return 'ok';
      case 1:
        return 'warning';
      case 2:
        return 'bad';
      default:
        return 'ok';
    }
  };

  getStatusText = () => {
    let text = t('Fully Operational');
    const status = this.getStatus();

    switch (status) {
      case 'warning':
        text = t('Degraded Performance');
        break;
      case 'bad':
        text = t('Major Outage');
        break;
      default:
        break;
    }

    return text;
  };

  getStatusDescription = () => {
    let text = t('Systems are fully operational and should work as usual.');
    const status = this.getStatus();

    switch (status) {
      case 'warning':
        text = (
          <div style={{ textAlign: 'left' }}>
            <p>{t('Dear Customer')}</p>
            <p>
              {t(
                'Since we are currently working on improving our data infrastructure, unfortunately this results in slower response time than usual. We can assure you that all your data still will be checked.',
              )}
            </p>
            <p>
              {t(
                'We are doing our absolute best to solve this as soon as possible and expect this to be solved within the next couple of weeks and hope for your patience in the meantime.',
              )}
            </p>
          </div>
        );
        break;
      case 'bad':
        text = t(
          'We are working on getting the system fully operational as fast as possible. We apologize for any inconvenience caused by this.',
        );
        break;
      default:
        break;
    }

    return text;
  };

  handleClick = () => {
    this.props.showModal({
      modalType: 'Confirmation',
      modalProps: {
        title: this.getStatusText(),
        lockDuration: 0,
        description: this.getStatusDescription(),
        showCancelLabel: false,
        confirmLabel: t('OK'),
        action: () => {
          localStorage.setItem('systemHealthNotice', this.getStatus());
          this.setState({ statusStorageKey: this.getStatus() });
        },
      },
    });
  };

  render() {
    const status = this.getStatus();
    const className = `status-badge status-${status}`;
    const { statusStorageKey } = this.state;

    if (status === 'ok') return null;
    return (
      <div className="status" onClick={this.handleClick}>
        <span className={cn(className, { read: !!statusStorageKey })}>
          <ExclamationIcon className="confirmation-icon" />
        </span>

        {/* <span className="status-text" onClick={this.handleClick}>
          <span className="status-text-small">{t('AccuRanker network status')}</span>
          {text}
        </span> */}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  systemHealthNotice: state.user.organization.errors.systemHealthNotice,
});

export default compose(
  connect(
    mapStateToProps,
    { showModal },
  ),
)(Status);
