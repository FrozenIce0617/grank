// @flow
import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import linkToKeywords from 'Components/Filters/LinkToKeywords';
import { withRouter } from 'react-router';
import colorScheme from 'Utilities/colors';

type Item = {
  id: string,
  label: string,
  value: number,
  range: string,
  domainId: string,
};

type Props = {
  items: Item[],
  linkable: boolean,
  history: Object,
};

const colors = colorScheme.rankDistribution;

// Sizes are harcoded, do we need dynamic?
const WIDTH = 380;
const HEIGHT = 15;
const GAP = 0;

class Distribution extends React.Component<Props> {
  static defaultProps = {
    linkable: false,
  };

  redirectToPageWithFilter(label: string, domainId: string) {
    this.props.history.push(linkToKeywords(label, domainId));
  }

  render() {
    const items = this.props.items;
    const totalValue = items.reduce((summ, item) => summ + item.value, 0);
    const totalGapsWidth = GAP * (items.length - 1);
    let x = 0;
    const renderItem = (item: Item, index: number) => {
      if (item.value < 1) return null;
      const currentX = x;
      const width = ((WIDTH - totalGapsWidth) * item.value) / totalValue;
      x += width + GAP;
      const color = colors[index % colors.length];
      const style = {};
      if (this.props.linkable) style.cursor = 'pointer';
      return (
        <g key={item.id}>
          <rect
            onClick={() =>
              this.props.linkable && this.redirectToPageWithFilter(item.range, item.domainId)
            }
            fill={color}
            x={currentX}
            y={0}
            width={width}
            height={HEIGHT}
            id={item.id}
            style={style}
          />
          <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={item.id}>
            {item.label}
          </UncontrolledTooltip>
        </g>
      );
    };
    return (
      <svg className="distribution" width={WIDTH} height={HEIGHT}>
        {items.map(renderItem)}
      </svg>
    );
  }
}

export default withRouter(Distribution);
