// @flow
import React, { Component, type ComponentType } from 'react';
import { UncontrolledTooltip, Tooltip } from 'reactstrap';
import { uniqueId } from 'lodash';
import cn from 'classnames';
import { noop } from 'lodash';

type Props = {
  className?: string,
  icon: ComponentType<*>,
  tooltip?: string,
  onClick?: Function,
  onMouseEnter?: Function,
  onMouseLeave?: Function,
  ignored?: boolean,
  isTooltipOpened?: boolean,
};

class Icon extends Component<Props> {
  iconId: string;

  static defaultProps = {
    onClick: noop,
  };

  constructor(props: Props) {
    super(props);
    this.iconId = uniqueId('icon');
  }

  render() {
    const {
      icon: IconTag,
      ignored,
      tooltip,
      className,
      onClick,
      onMouseEnter,
      onMouseLeave,
      isTooltipOpened,
    } = this.props;

    return (
      <span
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        className={cn('icon-with-tooltip', { ignored }, className)}
      >
        <span id={this.iconId}>
          <IconTag />
        </span>
        {tooltip &&
          (isTooltipOpened == null ? (
            <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={this.iconId}>
              {tooltip}
            </UncontrolledTooltip>
          ) : (
            <Tooltip
              isOpen={isTooltipOpened}
              delay={{ show: 0, hide: 0 }}
              placement="top"
              target={this.iconId}
            >
              {tooltip}
            </Tooltip>
          ))}
      </span>
    );
  }
}

export default Icon;
