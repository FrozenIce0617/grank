// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import './messages.scss';
import underdash from 'Utilities/underdash';
import moment from 'moment';
import { Table } from 'reactstrap';
import TableEmptyState from 'Components/TableEmptyState';
import Skeleton from 'Components/Skeleton';
import SkeletonTableBody from 'Components/Skeleton/TableBody';

import InformationIcon from 'icons/binoculars.svg?inline';
import WarningIcon from 'icons/flash.svg?inline';
import ActionRequiredIcon from 'icons/wrench.svg?inline';

type Props = {
  hideModal: Function,
  messagesList: Object,
};

class Messages extends Component<Props> {
  renderSkeleton = () => (
    <SkeletonTableBody>
      <Skeleton
        linesConfig={[{ type: 'text', options: { width: '100%', marginBottom: '10px' } }]}
      />
      <Skeleton
        linesConfig={[{ type: 'text', options: { width: '100%', marginBottom: '10px' } }]}
      />
    </SkeletonTableBody>
  );

  renderBody(reversedMessages) {
    if (underdash.graphqlError({ ...this.props }) || underdash.graphqlLoading({ ...this.props })) {
      return this.renderSkeleton();
    }

    return (
      <tbody>
        {reversedMessages.map(({ id, levelId, createdAt, text }) => {
          const icon =
            levelId === 1 ? (
              <InformationIcon className="messages-icon grey" />
            ) : levelId === 2 ? (
              <WarningIcon className="messages-icon orange" />
            ) : (
              <ActionRequiredIcon className="messages-icon red" />
            );
          return (
            <tr key={id}>
              <td className="messages-table-icon">{icon}</td>
              <th>{moment(createdAt).format('MMM D, hh:mm a')}</th>
              <td>{text}</td>
            </tr>
          );
        })}
      </tbody>
    );
  }

  render() {
    const { messages } = this.props.messagesList;
    const reversedMessages = messages && messages.length ? messages.slice().reverse() : [];

    return (
      <ModalBorder className="messages" title={t('Your Messages')} onClose={this.props.hideModal}>
        <Table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>{t('type')}</th>
              <th style={{ width: '95px' }}>{t('Date')}</th>
              <th>{t('Message')}</th>
            </tr>
          </thead>
          {this.renderBody(reversedMessages)}
        </Table>
        {!underdash.graphqlError({ ...this.props }) &&
          !underdash.graphqlLoading({ ...this.props }) && (
            <TableEmptyState
              list={reversedMessages}
              title={t('No Data')}
              subTitle={t('There are currently no messages.')}
            />
          )}
      </ModalBorder>
    );
  }
}

const messagesQuery = gql`
  query messages_messages {
    messages(read: true) {
      id
      text
      level
      levelId
      createdAt
    }
  }
`;

export default compose(
  connect(
    null,
    { hideModal },
  ),
  graphql(messagesQuery, {
    name: 'messagesList',
  }),
)(Messages);
