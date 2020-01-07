// @flow
import React, { Component } from 'react';
import { type ComponentType } from 'react';
import Icon from 'Components/Icon';
import './actions-cell.scss';

export type Item = {
  disabled?: boolean,
  label?: any,
  icon: ComponentType<*>,
  onSelect?: Function,
  className?: string,
};

type Props = {
  actions: Array<Item>,
  shouldUpdateIndicator: any,
};

class ActionsCell extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return (
      nextProps.actions !== this.props.actions ||
      nextProps.shouldUpdateIndicator !== this.props.shouldUpdateIndicator
    );
  }

  render() {
    const { actions } = this.props;
    return (
      <div className="actions-cell">
        {actions.map(action => (
          <Icon
            className={action.className}
            key={action.label}
            icon={action.icon}
            onClick={action.onSelect}
            tooltip={action.label}
          />
        ))}
      </div>
    );
  }
}

export default ActionsCell;
