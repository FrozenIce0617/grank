// @flow
import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { uniqueId } from 'lodash';
import classnames from 'classnames';

import './ellipsis.scss';

type TooltipDelay = {
  hide?: number,
  show?: number,
};

type Props = {
  children: React.Node,
  placement: string,
  tooltipText?: string,
  updateOnResize: boolean,
  className?: string,
  forceShowTooltip?: boolean,
  tooltipDelay?: TooltipDelay,
};

type State = {
  shouldShowTooltip: boolean,
};

class Ellipsis extends React.Component<Props, State> {
  static defaultProps = {
    placement: 'top',
    updateOnResize: true,
  };

  state = {
    shouldShowTooltip: false,
  };

  componentDidMount() {
    this.setShouldShowTooltip();
    if (this.props.updateOnResize) {
      window.addEventListener('resize', this.setShouldShowTooltip);
    }
  }

  componentWillUnmount() {
    if (this.props.updateOnResize) {
      window.removeEventListener('resize', this.setShouldShowTooltip);
    }
  }

  setShouldShowTooltip = () => {
    const shouldShowTooltip = this.elem === null || this.elem.offsetWidth < this.elem.scrollWidth;

    if (this.state.shouldShowTooltip !== shouldShowTooltip) {
      this.setState({ shouldShowTooltip });
    }
  };

  elem = null;

  elementId = uniqueId('ellipsis');

  render() {
    const {
      placement,
      tooltipText,
      children,
      className,
      forceShowTooltip,
      tooltipDelay,
    } = this.props;
    const { shouldShowTooltip } = this.state;
    const tooltip =
      shouldShowTooltip || forceShowTooltip ? (
        <UncontrolledTooltip placement={placement} target={this.elementId} delay={tooltipDelay}>
          {tooltipText || children}
        </UncontrolledTooltip>
      ) : null;
    return (
      <span
        className={classnames('ellipsis-tooltip', className)}
        ref={e => (this.elem = e)}
        id={this.elementId}
      >
        {children}
        {tooltip}
      </span>
    );
  }
}

export default Ellipsis;
