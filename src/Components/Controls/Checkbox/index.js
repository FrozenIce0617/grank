// @flow
import * as React from 'react';
import { uniqueId } from 'lodash';
import Ellipsis from 'Components/Ellipsis';
import StarIcon from 'icons/star.svg?inline';
import RoundedIcon from 'icons/checkbox.svg?inline';
import { omit } from 'lodash';
import cn from 'classnames';

import './checkbox.scss';

type CheckboxKind = 'default' | 'star' | 'toggle';

type Props = {
  checked?: ?boolean,
  showError?: ?boolean,
  defaultChecked?: boolean,
  onChange?: Function,
  children?: ?React.Node,
  name: string,
  value?: string,
  kind?: CheckboxKind,
  disabled?: boolean,
  className?: string,
  ellipsis?: boolean,
};

class Checkbox extends React.Component<Props> {
  id: string;

  static displayName = 'Checkbox';

  static defaultProps = {
    shape: 'default',
    showError: false,
    defaultChecked: false,
    onChange: () => {},
    name: '',
    value: undefined,
    children: null,
    disabled: false,
  };

  constructor(props: any) {
    super(props);
    this.id = uniqueId('checkbox');
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.checked !== this.props.checked ||
      nextProps.disabled !== this.props.disabled ||
      nextProps.name !== this.props.name
    );
  }

  getInputProps = () => omit(this.props, ['kind', 'children', 'showError', 'ellipsis']);

  wrapEllipsis = value => {
    const { ellipsis } = this.props;
    return ellipsis ? <Ellipsis>{value}</Ellipsis> : value;
  };

  render() {
    const { kind, children, ellipsis, className, disabled } = this.props;
    const inputProps = this.getInputProps();
    let iconContent = null;
    switch (kind) {
      case 'star':
        iconContent = <StarIcon />;
        break;
      case 'toggle':
        iconContent = (
          <div className="toggle-button">
            <span className="slider" />
          </div>
        );
        break;
      default:
        iconContent = <RoundedIcon className="checkbox-icon" />;
        break;
    }
    if (inputProps.checked !== undefined) {
      delete inputProps.defaultChecked;
    }

    return (
      <label
        htmlFor={this.id}
        className={cn(`checkbox checkbox-kind-${kind || 'default'}`, className, {
          'has-label': children,
          disabled,
          ellipsis,
        })}
      >
        <input id={this.id} type="checkbox" {...inputProps} />
        {iconContent}
        {this.wrapEllipsis(this.props.children)}
      </label>
    );
  }
}

export default Checkbox;
