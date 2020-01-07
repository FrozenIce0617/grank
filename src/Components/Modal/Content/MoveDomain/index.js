// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import MoveDomainForm from './MoveDomainForm';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';

type Props = {
  initialValues: {
    domainId: string,
    groupId: string,
  } | null,
};

class MoveDomain extends Component<Props> {
  render() {
    const { initialValues } = this.props;
    return (
      <ModalBorder className="move-domain" title={t('Move domain')} onClose={this.props.hideModal}>
        <MoveDomainForm initialValues={initialValues} />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(MoveDomain);
