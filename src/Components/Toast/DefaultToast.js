// @flow
import * as React from 'react';
import CloseIcon from 'icons/close-2.svg?inline';
import IconButton from 'Components/IconButton';

type Props = {
  children: React.Node,
};

class DefaultToast extends React.Component<Props> {
  render() {
    return (
      <div className="toast-wrapper toast-default">
        <div className="toast-content">{this.props.children}</div>
        <IconButton className="close-button" icon={<CloseIcon />} />
      </div>
    );
  }
}

export default DefaultToast;
