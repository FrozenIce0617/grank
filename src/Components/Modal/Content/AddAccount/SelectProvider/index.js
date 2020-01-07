// @flow
import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { t } from 'Utilities/i18n/index';
import type { Integration } from 'Types/Integration';

type Props = {
  onSelect: Function,
  providers: Integration[],
};

export default class SelectProvider extends Component<Props> {
  render() {
    const { onSelect, providers } = this.props;
    return (
      <div>
        <Table className="data-table">
          <thead>
            <tr>
              <th>{t('Provider')}</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(option => (
              <tr key={option.type}>
                <td>
                  <a tabIndex={0} onClick={() => onSelect(option)}>
                    {option.name}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}
