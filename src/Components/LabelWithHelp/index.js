// @flow
import React, { Component } from 'react';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import { uniqueId } from 'lodash';
import HelpIcon from 'icons/question-rounded-filled.svg?inline';
import './label-with-help.scss';

type Props = {
  Tag?: string,
  children: string,
  help?: string,
  helpTitle?: string,
  className?: string,
};

type State = {
  popoverOpen: boolean,
};

class LabelWithHelp extends Component<Props, State> {
  static defaultProps = {
    Tag: 'span',
    help: '',
    helpTitle: '',
    className: '',
  };

  state = {
    popoverOpen: false,
  };

  helpIconId = uniqueId('helpicon');

  toggle = (event: any) => {
    event && event.preventDefault();
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  };

  render() {
    const { help, helpTitle, Tag, children, className } = this.props;
    const showHelp = help && helpTitle;
    return (
      <Tag className={`label-with-help ${className || ''}`}>
        <span>{children}</span>
        {showHelp && <HelpIcon id={this.helpIconId} onClick={this.toggle} />}
        {showHelp && (
          <Popover
            placement="right"
            target={this.helpIconId}
            isOpen={this.state.popoverOpen}
            toggle={this.toggle}
            className="label-with-help-pop-over"
          >
            {helpTitle ? <PopoverHeader>{helpTitle}</PopoverHeader> : null}
            <PopoverBody>{help}</PopoverBody>
          </Popover>
        )}
      </Tag>
    );
  }
}

export default LabelWithHelp;
