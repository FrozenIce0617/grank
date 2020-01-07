// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import AddCompetitorForm from './AddCompetitorForm';
import { t } from 'Utilities/i18n';

import './add-competitor.scss';

type Props = {
  hideModal: Function,
  domainId: string,
  domainToAdd?: string,
  refresh: Function,
};

class AddCompetitor extends Component<Props> {
  static defaultProps = {
    domainToAdd: null,
  };

  render() {
    return (
      <ModalBorder
        className="add-competitor"
        title={t('Add Competitor')}
        onClose={this.props.hideModal}
      >
        <AddCompetitorForm
          initialValues={{ domain: this.props.domainToAdd || '' }}
          onClose={this.props.hideModal}
          domainId={this.props.domainId}
          refresh={this.props.refresh}
        />
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(AddCompetitor);
