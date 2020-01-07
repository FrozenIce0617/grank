//@flow
import * as React from 'react';
import { isFunction, omit, isEmpty } from 'lodash';
import { StickyRegister } from 'Components/Sticky/Register';
import ReactResizeDetector from 'react-resize-detector';

type Props = {
  name: string,
  tag: string | Function,
  children: any,
  useResizeDetector?: boolean,
  style?: Object,
  scrollElement?: any,
  memoHorizontalScrollPosition?: number | null,
};

type State = {
  height: number,
  horizontalScrollPosition: number | null,
};

export type StickyHandlerProps = {
  containerName: string,
  containerBottom: number,
  containerTop: number,
  containerLeft: number,
  containerChildLeft: number,
};

export default class StickyContainer extends React.Component<Props, State> {
  container: any;

  static defaultProps = {
    tag: 'div',
    useResizeDetector: false,
    scrollElement: window,
  };

  state = {
    height: 0,
    horizontalScrollPosition: null,
  };

  componentDidMount() {
    this.handleChange();
    this.events.forEach(event => window.addEventListener(event, this.handleChange));
    if (this.props.scrollElement) {
      this.props.scrollElement.addEventListener('scroll', this.handleChange);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.memoHorizontalScrollPosition &&
      prevProps.memoHorizontalScrollPosition !== this.props.memoHorizontalScrollPosition
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ horizontalScrollPosition: this.props.memoHorizontalScrollPosition });
    }
  }

  componentWillUnmount() {
    this.events.forEach(event => window.removeEventListener(event, this.handleChange));
    if (this.props.scrollElement) {
      this.props.scrollElement.removeEventListener('scroll', this.handleChange);
    }
  }

  // possible events that can change
  // the height of the container
  events = ['resize', 'touchstart', 'touchmove', 'touchend'];

  handleChange = () => {
    const { name } = this.props;
    const { horizontalScrollPosition } = this.state;
    if (!this.container) {
      return;
    }

    // scroll to memorized horizontal scroll position
    if (horizontalScrollPosition !== null) {
      this.container.scrollLeft = horizontalScrollPosition;
      this.setState({
        horizontalScrollPosition: null,
      });
    }

    const containerChild = !isEmpty(this.container.children) ? this.container.children[0] : null;

    let containerChildProps = {};
    if (containerChild) {
      const { left } = containerChild.getBoundingClientRect();
      containerChildProps = {
        containerChildLeft: left,
      };
    }

    const { bottom, top, height, left } = this.container.getBoundingClientRect();
    StickyRegister.getListeners(name).forEach(listener =>
      listener({
        containerName: name,
        containerBottom: bottom,
        containerTop: top,
        containerLeft: left,
        ...containerChildProps,
      }),
    );

    if (this.state.height !== height) {
      this.setState({ height });
    }
  };

  updateListeners = () => {
    this.handleChange();
  };

  containerRef = (ref: any) => {
    this.container = ref;
  };

  getProps = (props: Object) =>
    omit(props, ['name', 'useResizeDetector', 'scrollElement', 'memoHorizontalScrollPosition']);

  render() {
    const { tag: Tag, children, ...otherProps } = this.props;
    const { height } = this.state;

    return (
      <Tag ref={this.containerRef} onScroll={this.handleChange} {...this.getProps(otherProps)}>
        {this.props.useResizeDetector && (
          <div>
            <ReactResizeDetector handleWidth onResize={this.handleChange} />
          </div>
        )}
        {isFunction(children) ? children({ height }) : children}
      </Tag>
    );
  }
}
