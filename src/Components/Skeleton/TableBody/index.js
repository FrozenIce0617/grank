//@flow
import React, { Component, Children } from 'react';
import SkeletonTableCell from 'Components/Skeleton/TableCell';

type Props = {
  children: any,
  count: number,
  className?: string,
};

export default class SkeletonTableBody extends Component<Props> {
  static defaultProps = {
    count: 3,
  };

  render() {
    const { children, count, className } = this.props;
    return (
      <tbody className={className}>
        {[...Array(count).keys()].map(item => (
          <tr key={item}>
            {Children.map(
              children,
              (child, idx) =>
                child && child.type.displayName !== 'SkeletonTableCell' && child.type !== 'td' ? (
                  <td key={idx}>{child}</td>
                ) : (
                  child
                ),
            )}
          </tr>
        ))}
      </tbody>
    );
  }
}
