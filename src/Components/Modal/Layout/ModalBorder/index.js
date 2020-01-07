// @flow
import * as React from 'react';
import IconButton from 'Components/IconButton';
import CloseIcon from 'icons/close-2.svg?inline';
import onClickOutside from 'react-onclickoutside';
import keydownHandler from 'react-keydown';
import cn from 'classnames';
import './modal-border.scss';
import { Fragment } from 'react';
import { t } from 'Utilities/i18n';

type Props = {
  title: string,
  className?: string,
  onClose?: Function,
  children: React.Node,
  keydown: Object,
  header?: Object,
  closeOnClickOutside?: boolean,
};

class ModalBorder extends React.Component<Props> {
  modalBorder: HTMLElement;

  static defaultProps = {
    className: '',
    closeOnClickOutside: false,
  };

  UNSAFE_componentWillReceiveProps({ keydown: { event } }) {
    if (event && event.key === 'Escape') {
      this.props.onClose ? this.props.onClose() : null;
    }
  }

  handleClickOutside(evt) {
    if (!this.props.closeOnClickOutside) {
      return;
    }
    const parent = this.modalBorder.offsetParent;
    if (parent && (parent.clientWidth <= evt.clientX || parent.clientHeight <= evt.clientY)) {
      return;
    }

    this.props.onClose ? this.props.onClose() : null;
  }

  modalBorderRef = ref => {
    if (ref) {
      this.modalBorder = ref;
    }
  };

  render() {
    const { title, className, onClose, children, header } = this.props;
    return (
      <div className={cn('modal-border', className)} ref={this.modalBorderRef}>
        {header || (
          <div className="modal-header">
            <div className="modal-title">{title}</div>
            {onClose && (
              <Fragment>
                <div className="modal-close-hint">({t('ESC to close')})</div>
                <IconButton icon={<CloseIcon />} onClick={onClose} />
              </Fragment>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    );
  }
}

export default keydownHandler(onClickOutside(ModalBorder));
