// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import moment from 'moment';
import cn from 'classnames';

import CheckIcon from 'icons/check-rounded.svg?inline';
import CrossIcon from 'icons/cross-rounded-thin.svg?inline';

import './mail-details.scss';

type Props = {
  hideModal: Function,
  data: Object,
};

class MailDetails extends Component<Props> {
  renderBoolCell(value) {
    return (
      <div
        className={cn('details-bool', {
          'details-bool-true': value,
          'details-bool-false': !value,
        })}
      >
        {value ? <CheckIcon /> : <CrossIcon />}
      </div>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <ModalBorder
        className="sales-mail-details"
        title={t('Mail details')}
        onClose={this.props.hideModal}
      >
        <div className="details-item">
          <div className="details-item-title">{t('Created at')}:</div>
          <div>{moment(data.createdAt).format('YYYY-MM-DD HH:mm')}</div>
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('Original-Message-ID')}:</div>
          <div>{data.messageId}</div>
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('Recipients')}:</div>
          <div>{data.recipients ? data.recipients.join(', ') : '-'}</div>
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('From email')}:</div>
          <div>{data.fromEmail}</div>
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('Reply to')}:</div>
          <div>{data.replyTo ? data.replyTo.join(', ') : '-'}</div>
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('Subject')}:</div>
          <div>{data.subject}</div>
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('Opened')}:</div>
          {this.renderBoolCell(data.opened)}
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('MTA accepted')}:</div>
          {this.renderBoolCell(data.mtaAccept)}
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('MTA error')}:</div>
          <div>{data.mtaError || '-'}</div>
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('Notifications types')}:</div>
          <div>{data.notificationsTypes ? data.notificationsTypes.join(', ') : '-'}</div>
        </div>
        <div className="details-item">
          <div className="details-item-title">{t('Notifications')}:</div>
          <div style={{ whiteSpace: 'pre-line' }}>
            {data.notifications ? data.notifications.join(',\n') : '-'}
          </div>
        </div>
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(MailDetails);
