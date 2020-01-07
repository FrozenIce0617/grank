//@flow
import * as React from 'react';
import cn from 'classnames';
import { omit } from 'lodash';

type Props = {
  className?: string,
  containerName: string,
  forName: string,
  style?: Object,
  tag: string | Function,
};

export default class StickyPlaceholder extends React.Component<Props> {
  placeholder: any;

  static defaultProps = {
    tag: 'div',
  };

  getProps = (props: Object) => omit(props, ['containerName', 'forName']);

  placeholderRef = (ref: any) => {
    this.placeholder = ref;
  };

  render() {
    const { tag: Tag, className, ...otherProps } = this.props;
    return (
      <Tag
        className={cn('sticky-placeholder', className)}
        ref={this.placeholderRef}
        {...this.getProps(otherProps)}
      />
    );
  }
}
