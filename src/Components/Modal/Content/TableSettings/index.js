// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import TableSettingsForm from './TableSettingsForm';
import './table-settings.scss';

type Props = {
  saveSettings: Function,
  allColumns: Object[],
  columns: string[],
  defaultColumns: string[],

  // optional
  featureAdvancedMetrics?: boolean,
  hasAnalytics?: boolean,

  // Auto
  hideModal: Function,
};

class TableSettings extends Component<Props> {
  static defaultProps = {
    featureAdvancedMetrics: false,
    hasAnalytics: false,
  };

  getInitialValues = () =>
    this.props.allColumns.reduce((s, column) => {
      s[column.id] = this.isSelected(column.id);
      return s;
    }, {});
  isSelected = id => this.props.columns.includes(id);

  render() {
    return (
      <ModalBorder
        className="table-settings"
        title={t('Table Settings')}
        onClose={this.props.hideModal}
      >
        <TableSettingsForm
          columns={this.props.columns}
          allColumns={this.props.allColumns}
          hideModal={this.props.hideModal}
          saveSettings={this.props.saveSettings}
          defaultColumns={this.props.defaultColumns}
          featureAdvancedMetrics={this.props.featureAdvancedMetrics}
          hasAnalytics={this.props.hasAnalytics}
        />
      </ModalBorder>
    );
  }
}

const mapStateToProps = state => ({
  featureAdvancedMetrics: state.user.organization.activePlan.featureAdvancedMetrics,
});

export default connect(
  mapStateToProps,
  { hideModal },
)(TableSettings);
