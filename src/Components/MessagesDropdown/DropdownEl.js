// @flow
import * as React from 'react';
import { Collapse, DropdownItem } from 'reactstrap';
import moment from 'moment';

import CheckRoundedIcon from 'icons/check-rounded.svg?inline';
import InformationIcon from 'icons/binoculars.svg?inline';
import WarningIcon from 'icons/flash.svg?inline';
import ActionRequiredIcon from 'icons/wrench.svg?inline';

import type { MessageEl } from './index';

type Props = {
  el: MessageEl,
  onMarkRead: Function,
};

type State = {
  isOpen: boolean,
};

export default class MessagesDropdown extends React.PureComponent<Props, State> {
  state = {
    isOpen: true,
  };

  render() {
    const {
      el: { id, text, levelId, level, createdAt },
    } = this.props;

    return (
      <Collapse isOpen={this.state.isOpen} onExited={() => this.props.onMarkRead(id)}>
        <DropdownItem className="messages-el" tag="span" toggle={false}>
          <div className="messages-sidebar">
            {levelId === 1 ? (
              <InformationIcon className="messages-icon grey" />
            ) : levelId === 2 ? (
              <WarningIcon className="messages-icon orange" />
            ) : (
              <ActionRequiredIcon className="messages-icon red" />
            )}
          </div>

          <div className="messages-main">
            <p className="messages-timestamp">{moment(createdAt).format('MMM D, hh:mm a')}</p>
            <p>{text}</p>
          </div>

          <div className="messages-markRead" onClick={() => this.setState({ isOpen: false })}>
            <div className="messages-markRead-text">Mark as read</div>
            <CheckRoundedIcon />
          </div>
        </DropdownItem>
      </Collapse>
    );
  }
}
