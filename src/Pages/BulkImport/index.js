// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';

import DashboardTemplate from 'Pages/Layout/DashboardTemplate';
import ActionsMenu, { BULK_IMPORT } from 'Pages/Layout/ActionsMenu';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import { showModal } from 'Actions/ModalAction';
import { t, tct } from 'Utilities/i18n';

import './bulkimport.scss';

type Props = {
  showModal: Function,
};

class BulkImportPage extends Component<Props> {
  handleUploadCSV = () => {
    this.props.showModal({
      modalType: 'UploadCSV',
      modalTheme: 'light',
    });
  };

  handleClickCountriesList = evt => {
    evt.preventDefault();

    this.props.showModal({
      modalType: 'SupportedCountriesList',
      modalTheme: 'light',
    });
  };

  handleImportWithConnection = () => {
    this.props.showModal({
      modalType: 'ConnectToOAuth',
      modalTheme: 'light',
    });
  };

  render() {
    return (
      <DashboardTemplate showFilters={false}>
        <ActionsMenu menuFor={BULK_IMPORT} hidePeriodFilter>
          <Actions.AddAction key="upload" label={t('Upload CSV')} onClick={this.handleUploadCSV} />
          <Actions.AddAction
            key="import-connection"
            label={t('Import from third-party')}
            onClick={this.handleImportWithConnection}
          />
        </ActionsMenu>
        <div className="bulk-import content-container multi">
          <div>
            <p>
              {tct(
                'This importer expects a CSV file formatted in a certain way. To get started please [link:download the example file here.]',
                {
                  link: <a href="/static/bulk_upload.csv" />,
                },
              )}
            </p>
            <p>
              {tct(
                'If you wish to import historic data, please [link:download the example file with optional columns here.]',
                {
                  link: <a href="/static/bulk_upload_optional_fields.csv" />,
                },
              )}
            </p>
            <p className="mt-2">
              <a tabIndex="-1" onClick={this.handleClickCountriesList}>
                {t('A list of supported countries can be found here.')}
              </a>
            </p>
            <div className="bulk-import-table-container">
              <Table className="data-table bulk-import-table">
                {/* Do no translate the text in this table */}
                <thead>
                  <tr>
                    <th>{'Domain name *'}</th>
                    <th>{'Display name'}</th>
                    <th>{'Keyword *'}</th>
                    <th>{'Tags'}</th>
                    <th>{'Country *'}</th>
                    <th>{'Location'}</th>
                    <th>{'Search engine *'}</th>
                    <th>{'Desktop *'}</th>
                    <th>{'Mobile *'}</th>
                    <th className="additional-field border-left">
                      <span className="additional-field-top-label">{t('Optional columns')}</span>
                      {'Date **'}
                    </th>
                    <th className="additional-field">{'Rank ***'}</th>
                    <th className="additional-field">{'URL'}</th>
                    <th className="additional-field">{'Ignore local'}</th>
                    <th className="additional-field border-right">{'Ignore featured snippet'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{'domain.com'}</td>
                    <td>{'Domain'}</td>
                    <td>{'my keyword'}</td>
                    <td>{'tag1, tag2'}</td>
                    <td>{'en-us'}</td>
                    <td>{'New York'}</td>
                    <td>{'Google'}</td>
                    <td>{'true'}</td>
                    <td>{'false'}</td>
                    <td className="additional-field border-left">{'2017-12-24'}</td>
                    <td className="additional-field">{'1'}</td>
                    <td className="additional-field">{'domain.com/path1'}</td>
                    <td className="additional-field">{'false'}</td>
                    <td className="additional-field border-right">{'false'}</td>
                  </tr>
                  <tr>
                    <td>{'domain.com'}</td>
                    <td>{'Domain'}</td>
                    <td>{'another keyword'}</td>
                    <td>{''}</td>
                    <td>{'en-us'}</td>
                    <td>{'New York'}</td>
                    <td>{'Bing'}</td>
                    <td>{'true'}</td>
                    <td>{'false'}</td>
                    <td className="additional-field border-left">{'2017-12-25'}</td>
                    <td className="additional-field">{'2'}</td>
                    <td className="additional-field">{'domain.com/path2'}</td>
                    <td className="additional-field">{'false'}</td>
                    <td className="additional-field border-right">{'false'}</td>
                  </tr>
                  <tr>
                    <td>{'anotherdomain.com'}</td>
                    <td>{''}</td>
                    <td>{'another keyword'}</td>
                    <td>{''}</td>
                    <td>{'da-dk'}</td>
                    <td>{''}</td>
                    <td>{'Google'}</td>
                    <td>{'false'}</td>
                    <td>{'true'}</td>
                    <td className="additional-field border-left">{'2017-12-26'}</td>
                    <td className="additional-field">{'3'}</td>
                    <td className="additional-field">{'anotherdomain.com/path1'}</td>
                    <td className="additional-field">{'true'}</td>
                    <td className="additional-field border-right">{'false'}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div className="mt-1">
              <small>{t('* required')}</small>
              <br />
              <small>{t('** for historic data')}</small>
              <br />
              <small>
                {t(
                  '*** rank should be between 1 and 500, so leave it empty if the keyword is not ranking',
                )}
              </small>
            </div>
          </div>
        </div>
      </DashboardTemplate>
    );
  }
}

export default connect(
  null,
  { showModal },
)(BulkImportPage);
