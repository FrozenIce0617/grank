// @flow
import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { isString, noop, uniqueId } from 'lodash';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import './icon-button.scss';

type Props = {
  icon?: React.Node,
  brand?: string,
  className?: string,
  children?: React.Node,
  onClick?: Function,
  disabled?: boolean,
  onMouseDown?: Function,
  tabIndex?: number,
  tooltipRenderer?: Function,
  tooltip?: string,
  showTooltip?: boolean,
  link?: string,
  href?: string,
  inline?: boolean,
  title?: string,
};

class IconButton extends React.Component<Props> {
  static defaultProps = {
    brand: '',
    onClick: noop,
    onMouseDown: noop,
    tabIndex: 0,
  };

  iconButtonId: string = uniqueId('iconButtonId');

  handleMouseDown = (evt: SyntheticEvent<*>) => {
    evt.preventDefault();
    const { onMouseDown, disabled } = this.props;
    if (disabled) {
      return;
    }
    onMouseDown && onMouseDown(evt);
  };

  handleClick = (evt: SyntheticEvent<*>) => {
    evt.preventDefault();
    const { onClick, disabled } = this.props;
    if (disabled) {
      return;
    }
    onClick && onClick(evt);
  };

  renderButtonContent = () => {
    const { children, icon, title } = this.props;
    const aIcon = isString(icon) ? <img src={icon} /> : icon;

    return (
      <React.Fragment>
        {aIcon}
        <span className="icn-button-content">
          {title && <span className="icn-button-content-title">{title}</span>}
          {children}
        </span>
      </React.Fragment>
    );
  };

  renderContent() {
    const { disabled, inline, className, link, href, children, brand } = this.props;
    const aClassName = cn(
      'icn-button',
      {
        [`icn-brand-${brand}`]: brand,
        'has-text': !!children,
        inline,
        disabled,
      },
      className,
    );

    if (link && !disabled) {
      return (
        <Link className={aClassName} to={link}>
          {this.renderButtonContent()}
        </Link>
      );
    }

    if (href) {
      return (
        <a tabIndex={this.props.tabIndex} className={aClassName} href={href}>
          {this.renderButtonContent()}
        </a>
      );
    }
    return (
      <span
        tabIndex={this.props.tabIndex}
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        className={aClassName}
      >
        {this.renderButtonContent()}
      </span>
    );
  }

  renderTooltip() {
    const { tooltipRenderer, tooltip, showTooltip } = this.props;
    return tooltip
      ? showTooltip && (
          <UncontrolledTooltip
            delay={{ show: 0, hide: 0 }}
            placement="top"
            target={this.iconButtonId}
          >
            {tooltip}
          </UncontrolledTooltip>
        )
      : tooltipRenderer && tooltipRenderer();
  }

  render() {
    return (
      <React.Fragment>
        <span className="icn-button-container" id={this.iconButtonId}>
          {this.renderContent()}
        </span>
        {this.renderTooltip()}
      </React.Fragment>
    );
  }
}

export default IconButton;
