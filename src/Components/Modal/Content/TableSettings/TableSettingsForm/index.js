// @flow
import React, { Component } from 'react';
import Button from 'Components/Forms/Button';
import { t } from 'Utilities/i18n';
import { FormGroup, Col } from 'reactstrap';
import Checkbox from 'Components/Controls/Checkbox';
import cn from 'classnames';
import './table-settings-form.scss';

type Props = {
  saveSettings: Function,
  allColumns: ColumnType[],
  hideModal: Function,
  columns: string[],
  defaultColumns: string[],

  // optional
  featureAdvancedMetrics?: boolean,
  hasAnalytics?: boolean,
};

type State = {
  columns: string[],
};

class TableSettingsForm extends Component<Props, State> {
  static defaultProps = {
    featureAdvancedMetrics: false,
    hasAnalytics: false,
  };

  state = {
    columns: this.props.columns,
  };

  handleSubmit = () => {
    this.props.hideModal();
    this.props.saveSettings(this.state.columns);
  };

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const column = this.props.allColumns.filter(c => c.id === event.currentTarget.name)[0];
    const columnChildrens = this.props.allColumns.filter(c => c.parentId === column.id);
    let columns = this.state.columns;
    const columnsToAddIds = [column.id].concat(columnChildrens.map(e => e.id));
    const exists = columns.includes(column.id);

    if (exists && !event.currentTarget.checked) {
      // remove column and columnChildrens
      columns = columns.filter(e => !columnsToAddIds.includes(e));
    } else {
      // add column and columnChildrens
      columns = columns.concat(columnsToAddIds);
    }

    this.setState({
      columns,
    });
  };

  handleReset = () => {
    this.setState({
      columns: this.props.defaultColumns,
    });
  };

  render() {
    let { allColumns } = this.props;
    const { featureAdvancedMetrics, hasAnalytics } = this.props;
    const { columns } = this.state;

    allColumns = allColumns.filter(column => !column.parentId && !column.required);
    let normalColumns = [];
    let advancedColumns = [];

    if (featureAdvancedMetrics) {
      normalColumns = allColumns;
    } else {
      normalColumns = allColumns.filter(column => !column.requiresAdvancedMetrics);
      advancedColumns = allColumns.filter(column => column.requiresAdvancedMetrics === true);
    }

    return (
      <div className="table-settings-form">
        <p className="alert alert-info">
          {t('Customize what columns you wish to see for this table. ')}
        </p>
        <FormGroup row className="indented-form-group">
          {normalColumns.map(column => {
            const isSelected = columns.includes(column.id);
            return (
              <Col sm={6} md={4} lg={3} key={column.id}>
                <Checkbox
                  className={cn({
                    'checkbox-with-badge': !hasAnalytics && column.requiresAnalytics,
                  })}
                  checked={isSelected}
                  name={column.id}
                  onChange={this.handleChange}
                  ellipsis
                >
                  {!hasAnalytics && column.requiresAnalytics && <strong>*&nbsp;</strong>}
                  {column.settingsLabel ? column.settingsLabel : column.name}
                </Checkbox>
              </Col>
            );
          })}
        </FormGroup>

        {!hasAnalytics && (
          <p>
            <strong>*&nbsp;</strong>
            {t('Analytics account required')}
          </p>
        )}

        {!featureAdvancedMetrics && (
          <div>
            <hr />

            <p className="alert alert-warning">
              {t(
                'The following columns are included in any plan with advanced metrics, upgrade now to unlock these metrics.',
              )}
            </p>

            <FormGroup row className="indented-form-group">
              {advancedColumns.map(column => {
                const isSelected = columns.includes(column.id);
                return (
                  <Col lg={3} key={column.id}>
                    <Checkbox
                      checked={isSelected}
                      name={column.id}
                      onChange={this.handleChange}
                      ellipsis
                      disabled
                    >
                      {column.settingsLabel ? column.settingsLabel : column.name}
                    </Checkbox>
                  </Col>
                );
              })}
            </FormGroup>
          </div>
        )}

        <hr />

        <div className="confirmation-button-wrapper text-right">
          <Button theme="grey" onClick={this.handleReset}>
            {t('Reset')}
          </Button>
          <Button theme="orange" onClick={this.handleSubmit}>
            {t('Update')}
          </Button>
        </div>
      </div>
    );
  }
}

export default TableSettingsForm;
