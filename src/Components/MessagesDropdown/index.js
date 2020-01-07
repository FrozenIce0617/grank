// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import cn from 'classnames';
import gql from 'graphql-tag';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import EnvelopeIcon from 'icons/messages.svg?inline';
import CheckDoubleIcon from 'icons/check-double.svg?inline';

import { showModal } from 'Actions/ModalAction';
import underdash from 'Utilities/underdash';
import { subscribeToTopic, MESSAGE, CREATED } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import toast from 'Components/Toast';
import { doAnyway } from 'Utilities/promise';

import { t } from 'Utilities/i18n/index';

import DropdownEl from './DropdownEl';

import './messages-dropdown.scss';

export type MessageEl = {
  createdAt: Date,
  id: string,
  level: string,
  levelId: number,
  text: string,
};

type Props = {
  messagesList: Object,
  setMessageRead: Function,
  theme: any,
  showModal: Function,
};

type State = {
  isOpen: boolean,
  isSilentUpdate: boolean,
  messagesLength: number,
  flashAnimation: boolean,
};

class MessagesDropdown extends Component<Props, State> {
  _subHandle: SubscriptionHandle;

  state = {
    isOpen: false,
    isSilentUpdate: false,
    messagesLength: 0,
    flashAnimation: false,
  };

  static getDerivedStateFromProps(props, state) {
    const { messages } = props.messagesList;
    const { messagesLength } = state;

    if (messages && messages.length) {
      if (messages.length > messagesLength) {
        return {
          ...state,
          messagesLength: messages.length,
          flashAnimation: messagesLength >= 1,
        };
      }
    }

    return null;
  }

  componentDidMount() {
    this._subHandle = subscribeToTopic({
      topic: MESSAGE,
      action: CREATED,
      cb: debounce(() => this.handleUpdate(), 1000),
    })[0];
  }

  componentWillUnmount() {
    this._subHandle.unsubscribe();
  }

  graphqlCheck = () =>
    underdash.graphqlError({ ...this.props }) || (underdash.graphqlLoading({ ...this.props }) && !this.state.isSilentUpdate); //prettier-ignore

  handleUpdate = () => {
    this.setState({ isSilentUpdate: true });
    this.props.messagesList.refetch().then(
      ...doAnyway(() => {
        toast.success(t('New message received'));
        this.setState({ isSilentUpdate: false });
      }),
    );
  };

  handleMarkReadOnClick(ids: Array<string>) {
    const input = { ids, read: true };

    this.props
      .setMessageRead({
        variables: {
          input,
        },
      })
      .then(() => {
        this.props.messagesList.refetch();
      });
  }

  handleShowMessagesAction = () => {
    this.props.showModal({
      modalType: 'Messages',
      modalTheme: 'light',
    });
  };

  handleToggle = () => this.setState({ isOpen: !this.state.isOpen });

  renderCounter() {
    if (this.graphqlCheck()) return null;

    const { flashAnimation } = this.state;
    const { messagesList: { messages } } = this.props; // prettier-ignore
    const msgCount = messages.length;

    if (msgCount < 1) return null;
    return (
      <span className="message-icon-counter">
        <span className="message-icon-counter-number" style={{ fontSize: msgCount > 99 && '10px' }}>
          {msgCount}
        </span>
      </span>
    );
  }

  renderDropdownError() {
    return (
      <div className="dropdown-content">
        <DropdownItem tag="div" header className="message-dropdown-error-message">
          {'You do not have any unread messages'}
        </DropdownItem>
      </div>
    );
  }

  renderDropdown(messages: Array<MessageEl>) {
    if (this.graphqlCheck()) return this.renderDropdownError();

    return (
      <div className="dropdown-content">
        {messages.map(el => (
          <DropdownEl key={el.id} el={el} onMarkRead={id => this.handleMarkReadOnClick([id])} />
        ))}
      </div>
    );
  }

  render() {
    const { messagesLength, flashAnimation } = this.state;
    const { messagesList: { messages } } = this.props; // prettier-ignore
    const reversedMessages = messages && messages.length ? messages.slice().reverse() : [];

    return (
      <Dropdown
        className={`message-button ${this.props.theme || ''}`}
        isOpen={this.state.isOpen}
        toggle={this.handleToggle}
      >
        <DropdownToggle tag={'span'}>
          <div className="dropdown-arrow">
            <div
              key={messagesLength}
              className={cn('message-icon-container', {
                'add-animation': flashAnimation,
              })}
            >
              <EnvelopeIcon />
              {this.renderCounter()}
            </div>
          </div>
        </DropdownToggle>
        <DropdownMenu className="messages-dropdown" flip={false} right>
          <div className="messages-header">
            {t('New messages ')}
            {reversedMessages.length ? (
              <span className="messages-header-new">{reversedMessages.length}</span>
            ) : (
              '🙌'
            )}
            <div
              className="messages-markRead"
              style={{ right: '25px' }}
              onClick={() => this.handleMarkReadOnClick(reversedMessages.map(el => el.id))}
            >
              <div className="messages-markRead-text">{t('Mark all as read')}</div>
              <CheckDoubleIcon className="messages-header-check" />
            </div>
          </div>

          <div className="messages-wrapper">
            {reversedMessages.length ? (
              this.renderDropdown(reversedMessages)
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>{t('No new messages.')}</div>
            )}
          </div>

          <div className="messages-all-wrapper">
            <DropdownItem className="sub-item" onClick={this.handleShowMessagesAction}>
              {t('View read messages')}
            </DropdownItem>
          </div>
        </DropdownMenu>
      </Dropdown>
    );
  }
}
const messagesQuery = gql`
  query messagesDropdown_messages {
    messages(read: false) {
      id
      text
      level
      levelId
      createdAt
    }
  }
`;

const setMessageReadQuery = gql`
  mutation messagesDropdown_updateRead($input: UpdateReadInput!) {
    updateRead(input: $input) {
      errors {
        field
      }
    }
  }
`;

export default compose(
  connect(
    null,
    { showModal },
  ),
  graphql(messagesQuery, {
    name: 'messagesList',
  }),
  graphql(setMessageReadQuery, {
    name: 'setMessageRead',
  }),
)(MessagesDropdown);
