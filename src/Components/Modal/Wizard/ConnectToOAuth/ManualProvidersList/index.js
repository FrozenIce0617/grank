// @flow
import React, { Component } from 'react';
import { Table } from 'reactstrap';
import type { Integration } from 'Types/Integration';

type Props = {
  onSelect: Function,
  providers: Integration[],
};

export default class ManualProvidersList extends Component<Props> {
  render() {
    const { onSelect, providers } = this.props;
    return (
      <div>
        <Table className="data-table">
          <tbody>
            {providers.map(option => (
              <tr key={option.party}>
                <td>
                  <a tabIndex={0} onClick={() => onSelect(option)}>
                    {option.party}
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
