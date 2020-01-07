// @flow
import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { t } from 'Utilities/i18n/index';
import { connect } from 'react-redux';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { showModal, hideModal } from 'Actions/ModalAction';

type Props = {
  domainId?: string,
  refresh?: Function,
  showModal: Function,
  hideModal: Function,
  isAddingConnection: boolean,
};

const GOOGLE_ANALYTICS = 'Google Analytics';
const ADOBE_ANALYTICS = 'Adobe Analytics';

const analyticsOptions = [GOOGLE_ANALYTICS, ADOBE_ANALYTICS];

const modals = {
  [GOOGLE_ANALYTICS]: 'ConnectToGA',
  [ADOBE_ANALYTICS]: 'ConnectToAdobe',
};

class ConnectToAnalytics extends Component<Props> {
  handleSelect = option => {
    const { isAddingConnection } = this.props;
    this.props.showModal({
      modalType: modals[option],
      modalTheme: 'light',
      modalProps: {
        domainId: this.props.domainId,
        refresh: this.props.refresh,
        isAdding: isAddingConnection,
      },
    });
  };

  renderAnalyticsTable() {
    return (
      <div>
        <Table className="data-table">
          <thead>
            <tr>
              <th>{t('Provider')}</th>
            </tr>
          </thead>
          <tbody>
            {analyticsOptions.map(option => (
              <tr key={option}>
                <td>
                  <a tabIndex={0} onClick={() => this.handleSelect(option)}>
                    {option}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }

  render() {
    return (
      <ModalBorder title={t('Select analytics provider')} onClose={this.props.hideModal}>
        {this.renderAnalyticsTable()}
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { showModal, hideModal },
)(ConnectToAnalytics);
