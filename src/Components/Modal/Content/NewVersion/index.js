// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';

// import './edit-user.scss';

type Props = {
  hideModal: Function,
  oldVersion: number,
  newVersion: number,
};

// TODO: Load changelog using the old and new version and display it to the user.

class NewVersion extends Component<Props> {
  static defaultProps = {};

  render() {
    const { oldVersion, newVersion } = this.props;
    return (
      <ModalBorder className="new-version" title={t('AccuRanker Has Been Updated')}>
        <div>{t('Please refresh AccuRanker to see the new version.')}</div>
        <hr />
        <div className="confirmation-button-wrapper text-right">
          <Button submit theme="orange" onClick={() => window.location.reload()}>
            {t('Refresh AccuRanker')}
          </Button>
        </div>
      </ModalBorder>
    );
  }
}

export default compose(
  connect(
    null,
    null,
  ),
)(NewVersion);
