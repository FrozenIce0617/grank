// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import scrollToComponent from 'react-scroll-to-component';
import { resetScrollTarget } from 'Actions/ScrollAction';

type Props = {
  scrollTarget: string,
  children: React.Node,
  resetScrollTarget: Function,
  scrollTo: Object,
  shouldReset: boolean,
};

class ScrollToElement extends React.Component<Props> {
  ScrollTarget: ?any;
  componentDidMount() {
    this.doIfTarget(this.scrollAndReset);
  }

  shouldComponentUpdate(nextProps: Object) {
    return !!nextProps.scrollTo;
  }

  setRef = (section: any) => {
    this.ScrollTarget = section;
  };

  scrollAndReset = () => {
    scrollToComponent(this.ScrollTarget, {
      offset: 0,
      align: 'top',
      duration: 300,
      ease: 'linear',
    });
    this.props.resetScrollTarget();
  };

  doIfTarget(callback: Function) {
    if (this.props.scrollTarget === this.props.scrollTo.scrollTarget) {
      callback();
    }
  }

  render() {
    return (
      <div ref={section => this.doIfTarget(() => this.setRef(section))}>{this.props.children}</div>
    );
  }
}

const mapStateToProps = state => ({ scrollTo: state.scrollToElement });

export default connect(
  mapStateToProps,
  { resetScrollTarget },
)(ScrollToElement);
