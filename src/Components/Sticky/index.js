//@flow
import * as React from 'react';
import { noop, omit } from 'lodash';
import cn from 'classnames';
import './sticky.scss';
import { StickyRegister } from './Register';
import StickyPlaceholder from './Placeholder';
import { isFunction, isEqual, zip, isUndefined } from 'lodash';
import type { StickyHandlerProps } from './Container';

type Props = {
  className?: string,
  containerName: string,
  name: string,
  tag: string | Function,
  children: any,

  // Offsets to tune sticky container
  // size where sticky item is "sticky"
  topOffset: number,
  bottomOffset: number,

  // Stick to position on the viewport
  position: 'bottom' | 'top',

  // Defined to be sticky when ...
  // Default values depends on position (see getStickyInContainerFlags)
  stickyIfOnTopOfContainer?: boolean,
  stickyIfOnBottomOfContainer?: boolean,

  // Placeholder props for having placeholder inside sticky component
  showPlaceholder?: boolean,
  placeholderTag?: string | Function,
  replicatePlaceholder?: boolean,

  // Used when you need to stick to another sticky in the top
  stickToTopContainer?: string,
  stickToTopItem?: string,

  // The value that sticky item in "sticky" state can move
  // top or bottom(depends on it's position) while scrolling
  // (mimic a backlash)
  backlash?: number,

  // Should scrolling of the container
  // change position of the sticky item
  followContainerHorizontalScroll?: boolean,

  // Handler for sticky toggle
  onToggle: Function,
};

type State = {
  isSticky: boolean,
  cellsWidth: Array<number> | null,
  lastPageYOffset: number,
  backlashOffset: number,
  topStackHeight: number,
};

export default class Sticky extends React.Component<Props, State> {
  item: any;
  content: any;
  placeholder: any;

  static defaultProps = {
    tag: 'div',
    topOffset: 0,
    bottomOffset: 0,
    position: 'top',
    onToggle: noop,
  };

  state = {
    isSticky: false,
    cellsWidth: null,
    lastPageYOffset: 0,
    backlashOffset: 0,
    topStackHeight: 0,
  };

  componentDidMount() {
    const {
      containerName,
      name,
      stickToTopContainer: topContainer,
      stickToTopItem: topItem,
    } = this.props;
    StickyRegister.add(containerName, name, this.handleContainerNotification, {
      topContainer,
      topItem,
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { containerName, name } = this.props;
    if (!this.content) {
      return;
    }

    if (prevState.isSticky !== this.state.isSticky && this.state.isSticky) {
      const { height: stickyHeight, width: stickyWidth } = this.content.getBoundingClientRect();
      StickyRegister.update(containerName, name, {
        stickyHeight,
        stickyWidth,
      });
    }

    // Warning: DOM mutation! Was made to avoid passing
    // style props to every table cell
    // (that's quite error prone action, as it easy to forget)
    if (this.isTableHead()) {
      if (prevState.cellsWidth !== this.state.cellsWidth) {
        this.updateCellWidth(this.state.cellsWidth);
      } else if (this.state.isSticky) {
        const newCellsWidth = Array.from(this.placeholder.children).map(child => child.clientWidth);
        if (!isEqual(this.state.cellsWidth, newCellsWidth)) {
          this.updateCellWidth(newCellsWidth);
          this.setState({ cellsWidth: newCellsWidth }); // eslint-disable-line react/no-did-update-set-state
        }
      }
    }
  }

  componentWillUnmount() {
    const { containerName, name } = this.props;
    StickyRegister.remove(containerName, name);
  }

  getMeasureItem = (isSticky: boolean, newIsSticky: boolean) =>
    isSticky !== newIsSticky && newIsSticky ? this.content : this.placeholder;

  getProps = (props: Object) =>
    omit(props, [
      'name',
      'containerName',
      'topOffset',
      'bottomOffset',
      'containerName',
      'stickToTopItem',
      'stickToTopContainer',
      'position',
      'showPlaceholder',
      'replicatePlaceholder',
      'backlash',
      'stickyIfOnTopOfContainer',
      'stickyIfOnBottomOfContainer',
      'followContainerHorizontalScroll',
    ]);

  getStickyInContainerFlags = () => {
    const {
      stickyIfOnTopOfContainer: isOnTop,
      stickyIfOnBottomOfContainer: isOnBottom,
      position,
    } = this.props;

    return {
      isOnTop: (position === 'top' && isUndefined(isOnTop)) || isOnTop,
      isOnBottom: (position === 'bottom' && isUndefined(isOnBottom)) || isOnBottom,
    };
  };

  handleContainerNotification = ({
    containerName,
    containerTop,
    containerLeft,
    containerChildLeft,
    containerBottom,
  }: StickyHandlerProps) => {
    if (!this.item || !this.content) {
      return;
    }

    const { isSticky, cellsWidth, lastPageYOffset, backlashOffset, topStackHeight } = this.state;
    const {
      topOffset,
      bottomOffset,
      name,
      position,
      backlash,
      followContainerHorizontalScroll,
      onToggle,
    } = this.props;

    // Should be implemented for the position 'bottom' if needed
    if (backlash && position === 'top') {
      const scrollDelta = window.pageYOffset - lastPageYOffset;
      const newBacklashOffset = Math.max(0, Math.min(backlash, backlashOffset + scrollDelta));
      StickyRegister.update(containerName, name, {
        top: -newBacklashOffset,
      });

      this.setState({
        backlashOffset: newBacklashOffset,
        lastPageYOffset: window.pageYOffset,
      });
    }

    if (followContainerHorizontalScroll) {
      const { oldLeft } = StickyRegister.get(containerName, name) || {};
      if (oldLeft !== containerChildLeft) {
        StickyRegister.update(containerName, name, {
          left: containerChildLeft,
          containerLeft,
        });
        this.forceUpdate();
      }
    }

    const { height: itemHeight, width: itemWidth } = this.item.getBoundingClientRect();

    const viewPortHeight = (document.documentElement && document.documentElement.clientHeight) || 0;
    const topStackOffset = StickyRegister.getTopStackHeight(containerName, name);

    const { isOnTop, isOnBottom } = this.getStickyInContainerFlags();
    const newIsSticky =
      position === 'bottom'
        ? viewPortHeight > containerTop + (isOnTop ? 0 : itemHeight) + topOffset &&
          viewPortHeight < containerBottom + (isOnBottom ? itemHeight : 0) + bottomOffset
        : containerTop <= (isOnTop ? itemHeight : 0) + topStackOffset + topOffset &&
          containerBottom >= (isOnBottom ? 0 : itemHeight) + topStackOffset + bottomOffset;

    const { height, width } = StickyRegister.get(containerName, name);
    if (height !== itemHeight || width !== itemWidth) {
      StickyRegister.update(containerName, name, {
        height: itemHeight,
        width: itemWidth,
      });
      this.forceUpdate();
    }

    if (newIsSticky) {
      if (this.isTableHead()) {
        const newCellsWidth = Array.from(this.getMeasureItem(isSticky, newIsSticky).children).map(
          child => child.clientWidth,
        );
        if (!isEqual(cellsWidth, newCellsWidth)) {
          this.setState({ cellsWidth: newCellsWidth });
        }
      }

      const newTopStackHeight = StickyRegister.getTopStackHeight(containerName, name);
      if (topStackHeight !== newTopStackHeight) {
        this.setState({
          topStackHeight: newTopStackHeight,
        });
      }
    }

    if (newIsSticky !== isSticky) {
      this.setState({ isSticky: newIsSticky });
      onToggle(newIsSticky);
    }
  };

  isTableHead = () => this.props.tag === 'thead';

  itemRef = (ref: any) => {
    this.item = ref;
  };

  contentRef = (ref: any) => {
    this.content = ref;
  };

  placeholderRef = (ref: any) => {
    this.placeholder = ref;
  };

  updateCellWidth = (cellsWidth: Array<number> | null) =>
    cellsWidth &&
    zip(Array.from(this.content.children), cellsWidth).forEach(([child, width]) => {
      child.style.width = `${width}px`;
    });

  renderContent(isPlaceholder?: boolean) {
    const { children, containerName, name, position } = this.props;
    const { isSticky } = this.state;
    const { left, containerLeft, width } = StickyRegister.get(containerName, name) || {};
    if (isFunction(children)) {
      const childrenProps = !isPlaceholder
        ? {
            isSticky,
            getRef: this.contentRef,
            style: {
              width,
              bottom: position === 'bottom' ? 0 : 'none',
              top:
                position === 'top' ? StickyRegister.getTopStackHeight(containerName, name) : 'none',
              ...(isSticky ? { left } : { marginLeft: (left || 0) - (containerLeft || 0) }),
            },
          }
        : {
            isSticky: false,
            getRef: this.placeholderRef,
            style: {},
          };
      return children(childrenProps);
    }
    return children;
  }

  renderPlaceholder() {
    const {
      containerName,
      name,
      showPlaceholder,
      placeholderTag,
      replicatePlaceholder,
    } = this.props;
    const { isSticky } = this.state;
    const { height, width } = StickyRegister.get(containerName, name) || {};

    if (!isSticky || !showPlaceholder) {
      return null;
    }

    return replicatePlaceholder || this.isTableHead() ? (
      this.renderContent(true)
    ) : (
      <StickyPlaceholder
        forName={name}
        containerName={containerName}
        style={{ height, width }}
        tag={placeholderTag}
      />
    );
  }

  render() {
    const { tag: Tag, children, className, ...otherProps } = this.props;

    const { isSticky } = this.state;
    return (
      <Tag
        ref={this.itemRef}
        className={cn('sticky-item', className, {
          sticky: isSticky && !isFunction(children),
        })}
        {...this.getProps(otherProps)}
      >
        {this.renderContent()}
        {this.renderPlaceholder()}
      </Tag>
    );
  }
}
