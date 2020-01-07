// @flow
import * as React from 'react';
import CloseIcon from 'icons/close-2.svg?inline';
import IconButton from 'Components/IconButton';

type Props = {
  status: 'success' | 'error',
  children: React.Node,
};

class StatusToast extends React.Component<Props> {
  render() {
    return (
      <div className={`toast-wrapper toast-${this.props.status}`}>
        <div className="toast-content">{this.props.children}</div>
        <IconButton className="close-button" icon={<CloseIcon />} />
      </div>
    );
  }
}

export default StatusToast;
