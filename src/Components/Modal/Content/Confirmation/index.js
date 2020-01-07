// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n';
import Checkbox from 'Components/Controls/Checkbox';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import Button from 'Components/Forms/Button';
import cn from 'classnames';
import { tct } from 'Utilities/i18n/index';
import './confirmation-modal.scss';
import ExclamationIcon from 'icons/exclamation.svg?inline';

type Props = {
  className: string,
  title: string,
  description: React.Node,
  action: Function,
  cancelAction: Function,
  lockDuration?: number,
  cancelLabel?: string,
  showCancelLabel?: boolean,
  confirmLabel?: string,
  hideModal: Function,
  terms: boolean,
};

type State = {
  lockDuration: number,
  agreed: boolean,
};

class Confirmation extends React.Component<Props, State> {
  static defaultProps = {
    lockDuration: 3,
    showCancelLabel: true,
  };

  state = {
    lockDuration: 0,
    agreed: false,
  };

  UNSAFE_componentWillMount() {
    this.setState({
      lockDuration: this.props.lockDuration,
    });
    if (this.props.lockDuration) {
      this.timerId = setInterval(this.handleTimer, 1000);
    }
  }

  componentWillUnmount() {
    if (this.timerId !== -1) {
      clearInterval(this.timerId);
      this.timerId = -1;
    }
  }

  timerId: number = -1;

  handleTimer = () => {
    let newDuration = this.state.lockDuration - 1;
    if (newDuration <= 0) {
      newDuration = 0;
      clearInterval(this.timerId);
      this.timerId = -1;
    }
    this.setState({
      lockDuration: newDuration,
    });
  };

  handleConfirm = () => {
    if (this.props.action) {
      this.props.action();
    }
    this.props.hideModal();
  };

  handleCancel = () => {
    if (this.props.cancelAction) {
      this.props.cancelAction();
    } else {
      this.props.hideModal();
    }
  };

  setAgreed = e => {
    e.persist();
    this.setState(() => ({ agreed: e.target.checked }));
  };

  renderTerms() {
    if (!this.props.terms) return null;
    return (
      <Checkbox onChange={e => this.setAgreed(e)}>
        {tct('I agree to the [link:Terms and Conditons]', {
          link: <a href="https://www.accuranker.com/terms" target="_blank" />,
        })}
      </Checkbox>
    );
  }

  render() {
    const { title, description, className, showCancelLabel } = this.props;
    const { lockDuration } = this.state;
    const cancelLabel = this.props.cancelLabel || t('No');
    let confirmLabel = this.props.confirmLabel || t('Yes');
    let confirmEnabled = true;
    if (lockDuration > 0) {
      confirmLabel = t('Unlocking in %s sec', lockDuration);
      confirmEnabled = false;
    }
    if (this.props.terms && !this.state.agreed) confirmEnabled = false;
    return (
      <div className={cn('confirmation-modal', className)}>
        <div className="title">
          <ExclamationIcon className="confirmation-icon" />
          {title}
        </div>
        <p className="description">{description}</p>
        {this.renderTerms()}
        <div className="actions">
          {showCancelLabel && (
            <Button theme="grey" onClick={this.handleCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button theme="orange" onClick={this.handleConfirm} disabled={!confirmEnabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(Confirmation);
