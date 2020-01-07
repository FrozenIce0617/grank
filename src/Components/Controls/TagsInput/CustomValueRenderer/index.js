// @flow
import React from 'react';
import CloseIcon from 'icons/close-2.svg?inline';

const CustomValueRenderer = ({ value, children, onClick, onRemove }) => (
  <span className="value-item" onClick={onClick}>
    <span>
      {children}
      <CloseIcon onClick={() => onRemove(value)} />
    </span>
  </span>
);

export default CustomValueRenderer;
