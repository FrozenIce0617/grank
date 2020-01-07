// @flow
import React, { Component } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import SimpleItemsList from 'Components/Controls/Dropdowns/SimpleItemsList';
import type { Item } from 'Components/Controls/Dropdowns/SimpleItemsList';
import Icon from 'Components/Icon';
import { t } from 'Utilities/i18n';
import { noop, identity } from 'lodash';
import cn from 'classnames';
import './options-dropdown.scss';

import OptionsIcon from 'icons/more_vert.svg?inline';

type Props = {
  items: Array<Item | boolean>,
  labelFunc: Function,
  linkFunc: Function,
  iconFunc: Function,
  dropup?: boolean,
};

export default class OptionsDropdown extends Component<Props> {
  static defaultProps = {
    labelFunc: identity,
    linkFunc: identity,
    iconFunc: identity,
  };

  getItems = (): Array<Item> => (this.props.items.filter(item => !!item): Array<any>);

  renderLabel = (item: Item) => this.props.labelFunc(item.label);
  renderLink = (item: Item) => this.props.linkFunc(item.link);
  renderIcon = (item: Item) => this.props.iconFunc(item.icon);

  render() {
    const { dropup } = this.props;
    return (
      <UncontrolledDropdown direction={dropup ? 'up' : 'down'} className="simple-dropdown options">
        <DropdownToggle className="options-button">
          <Icon icon={OptionsIcon} tooltip={t('Actions')} />
        </DropdownToggle>
        <DropdownMenu
          flip={false}
          className={cn('dropdown-menu-bubble', { 'dropdown-menu-bottom': dropup })}
          right
        >
          <SimpleItemsList
            items={this.getItems()}
            labelFunc={this.renderLabel}
            linkFunc={this.renderLink}
            iconFunc={this.renderIcon}
            onSelect={noop}
          />
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }
}
