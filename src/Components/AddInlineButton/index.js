// @flow
import React from 'react';
import AddIcon from 'icons/plus.svg?inline';

import './add-inline-button.scss';

type Props = {
  id?: number,
  onClick?: Function,
};

const AddInlineButton = (props: Props) => (
  <a id={props.id || null} tabIndex={0} onClick={props.onClick} className="add-inline-button">
    <AddIcon />
  </a>
);

export default AddInlineButton;
