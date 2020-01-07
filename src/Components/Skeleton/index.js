// @flow
import React, { Component } from 'react';

import SkeletonTypes from './Types';

import { transform, forOwn } from 'lodash';
import underdash from 'Utilities/underdash';
import cn from 'classnames';

const ALIGNMENT_CENTER = 'center';
const ALIGNMENT_RIGHT = 'right';

type Options = {
  width?: string,
  height?: string,
  alignment?: typeof ALIGNMENT_CENTER | typeof ALIGNMENT_RIGHT,
  display?: string,
  marginBottom?: string,
  marginLeft?: string,
};

type lineConfig = {
  type: string,
  options?: Options,
};

export type Props = {
  lines: number,
  linesConfig: Array<lineConfig>,
  className?: string,
};

const lineTypes = {
  spacer: true,
  'spacer-underline': true,
  title: true,
  subtitle: true,
  text: true,
  label: true,
  input: true,
  button: true,
  'icon-sm': true,
  'image-circle': true,
  'image-square': true,
  'image-rectangle': true,
  chart: true,
  'pie-chart': true,
};

const pascalLineTypes = transform(
  lineTypes,
  (acc, value, key) => {
    acc[key] = underdash.stringToPascalCase(key);
    return acc;
  },
  {},
);

const styleMapping = {
  alignment: {
    center: {
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    right: {
      marginLeft: 'auto',
      marginRight: '0',
    },
  },
};

class Skeleton extends Component<Props> {
  static defaultProps = {
    lines: 3,
    linesConfig: [],
  };

  // Don't update skeleton as it's should be static
  shouldComponentUpdate() {
    return false;
  }

  renderDefault() {
    const renderedLines = [];
    const { lines } = this.props;
    for (let linesLeft: number = lines; linesLeft !== 0; linesLeft--) {
      renderedLines.push(this.renderRow({ type: 'text', options: {} }, linesLeft));
    }
    return renderedLines;
  }

  renderFromConfig() {
    const { linesConfig } = this.props;
    return linesConfig.map(this.renderRow);
  }

  renderRow = (line: lineConfig, idx: number) => {
    const { type: Type, options: config } = line;

    const style = transform(
      config,
      (acc, value, key) => {
        const styleMap = styleMapping[key];
        if (!styleMap) {
          return (acc[key] = value);
        }

        const styleMapValue = styleMap[value];
        if (styleMapValue) {
          forOwn(styleMap[value], (item, itemKey) => {
            acc[itemKey] = item;
          });
        }
        return acc;
      },
      {
        display: 'block',
      },
    );

    const SkeletonType = SkeletonTypes[pascalLineTypes[Type]];
    if (SkeletonType) {
      return <SkeletonType key={idx} style={style} />;
    }

    if (lineTypes[Type]) {
      return <Type key={idx} style={style} />;
    }

    return null;
  };

  renderRows() {
    const { linesConfig } = this.props;
    return linesConfig.length ? this.renderFromConfig() : this.renderDefault();
  }

  render() {
    const { className } = this.props;
    return <div className={cn('skeleton-wrapper', className)}>{this.renderRows()}</div>;
  }
}

export default Skeleton;
