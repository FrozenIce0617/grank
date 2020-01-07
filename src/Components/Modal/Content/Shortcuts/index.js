// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';
import { isMac } from 'Utilities/underdash';

import ModalBorder from 'Components/Modal/Layout/ModalBorder';

import { t } from 'Utilities/i18n';
import Mousetrap from 'Utilities/mousetrap';
import { hideModal } from 'Actions/ModalAction';

import './shortcuts.scss';

type Shortcut = {
  keys: string,
  description: string,
};

type Props = {
  hideModal: Function,
};

class Shortcuts extends Component<Props> {
  constructor(props) {
    super(props);
    Mousetrap.pause();
  }

  getShortcuts = (): Shortcut[] => [
    {
      keys: 'Esc',
      description: t('Close opened menu'),
    },
    {
      keys: 'd',
      description: t('Open quick navigation'),
    },
    {
      keys: isMac() ? 'command+f' : 'ctrl+f',
      description: t('Open keywords or domains filter'),
    },
  ];

  formatKeys = keys => {
    const parts = keys.split(/(\+| )/);
    return parts.map(key => {
      if (key === ' ' || key === '+') {
        return key;
      }
      return <kbd key={key}>{this.transformKey(key)}</kbd>;
    });
  };

  transformKey = key => {
    switch (key) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'right':
        return '→';
      case 'left':
        return '←';
      case 'plus':
        return '+';
      default:
        if (key.length > 1) {
          return key.charAt(0).toUpperCase() + key.slice(1);
        }
        return key;
    }
  };

  renderRow = ({ keys, description }) => (
    <tr key={keys} className="keybind">
      <td className="key">
        <span>{this.formatKeys(keys)}</span>
      </td>
      <td>{description}</td>
    </tr>
  );

  render() {
    return (
      <ModalBorder
        className="keybinds-modal"
        title={t('Keyboard Shortcuts')}
        onClose={() => {
          Mousetrap.unpause();
          this.props.hideModal();
        }}
      >
        <Table className="data-table">
          <thead>
            <tr>
              <td>{t('Shortcut')}</td>
              <td>{t('Description')}</td>
            </tr>
          </thead>
          <tbody>{this.getShortcuts().map(this.renderRow)}</tbody>
        </Table>
      </ModalBorder>
    );
  }
}

export default connect(
  null,
  { hideModal },
)(Shortcuts);
