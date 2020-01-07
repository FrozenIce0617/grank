// @flow
import * as React from 'react';
import cn from 'classnames';
import './overlay.scss';
import { Link } from 'react-router-dom';
import { tct } from 'Utilities/i18n/index';

type Props = {
  className?: string,
  contentClassName?: string,
  tag?: string | Function,
  children: any,
  onTop?: React.Node,
  onBottom?: React.Node,
  isEnabled: boolean,
  isUpgradable: boolean,
  collapsed?: boolean,
};

class Overlay extends React.Component<Props> {
  wrapChildren(Tag: string | Function, props: Object) {
    const { children, isUpgradable, className, contentClassName } = this.props;
    return (
      <Tag {...props} className={className}>
        {isUpgradable && (
          <p className="alert alert-warning upgrade-alert">
            {tct(
              'This feature is part of the [link1:Professional], [link2:Expert] and [link3:Enterprise] plans.',
              {
                link1: <Link to={'/billing/package/select'} />,
                link2: <Link to={'/billing/package/select'} />,
                link3: <Link to={'/billing/package/select'} />,
              },
            )}
          </p>
        )}
        <div className={contentClassName}>{children}</div>
      </Tag>
    );
  }

  render() {
    const {
      children,
      onTop,
      onBottom,
      isEnabled,
      className,
      contentClassName,
      tag,
      collapsed,
      ...otherProps
    } = this.props;
    const Tag = tag || 'div';
    return isEnabled ? (
      <Tag
        {...otherProps}
        className={cn(
          'blurry-overlay',
          {
            'blurry-overlay-collapsed': collapsed,
          },
          className,
        )}
      >
        <div className={cn('blurry-overlay-on-bottom', contentClassName)}>
          {!collapsed ? onBottom || children : null}
        </div>
        <div className="blurry-overlay-backdrop" />
        {onTop && <div className="blurry-overlay-on-top">{onTop}</div>}
      </Tag>
    ) : (
      this.wrapChildren(Tag, otherProps)
    );
  }
}

export default Overlay;
