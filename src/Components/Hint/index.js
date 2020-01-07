// @flow
import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { uniqueId } from 'lodash';
import HelpIcon from 'icons/question-rounded-filled.svg?inline';
import './hint.scss';

type Props = {
  Tag?: string,
  children: React.Node,
};

class Hint extends React.Component<Props> {
  static defaultProps = {
    Tag: 'span',
    help: 'Provide help text',
    className: '',
  };

  helpIconId = uniqueId('hint');

  render() {
    const { Tag, children } = this.props;
    return (
      <Tag className="hint">
        <HelpIcon id={this.helpIconId} />
        <UncontrolledTooltip
          delay={{ show: 0, hide: 0 }}
          placement="right"
          target={this.helpIconId}
        >
          {children}
        </UncontrolledTooltip>
      </Tag>
    );
  }
}

export default Hint;
