// @flow
import * as React from 'react';
import cn from 'classnames';

import type { SwitchEl } from './types';
import './Switch.scss';

type Props = {
  onClick: Function,
  width: number, // 300
  els: Array<SwitchEl>,
  className?: string,
  style?: {},
  switchToggle?: boolean,
  activeById?: boolean,
  activeId?: string | number | boolean,
  disabled: boolean,
};

const Switch = (props: Props) => {
  const {
    onClick,
    width,
    els,
    className,
    style,
    switchToggle,
    activeById,
    activeId,
    disabled,
  } = props;

  const activeEl =
    (activeById
      ? els.map((el, i) => (el.id === activeId ? { ...el, i } : undefined))
      : els.map((el, i) => (el.active ? { ...el, i } : undefined))
    ).filter(el => el !== undefined)[0] || 0;

  return (
    <div
      className={cn('Switch', { 'small toggle': switchToggle, disabled }, className)}
      style={Object.assign({ width }, style)}
      onClick={() => switchToggle && onClick(els.filter(el => el.id !== activeEl.id)[0])}
    >
      <div
        className="Switch-bar"
        style={{
          width: `calc(${100 / els.length}% - 2px)`,
          transform: `translateX(${activeEl.i * 100}%)`,
          backgroundColor: switchToggle && activeEl.i === 0 ? '#d7d9e5' : undefined,
        }}
      />

      {els.map((el, i) => (
        <div
          key={i}
          onClick={() => !switchToggle && !disabled && onClick(el)}
          className={cn('Switch-text', { active: activeById ? el.id === activeId : el.active })}
          style={{ width: `calc(${100 / els.length}%)` }}
        >
          {el.name}
        </div>
      ))}
    </div>
  );
};

Switch.defaultProps = {
  width: 300,
};

export default Switch;
