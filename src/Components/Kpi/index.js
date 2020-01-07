// @flow
import * as React from 'react';
import cn from 'classnames';
import { Col } from 'reactstrap';
import Highcharts from 'highcharts';
import CountUp from 'react-countup';

// Components
import LineChart from 'Components/LineChart';
import { ArrowUp, ArrowDown } from 'Pages/Keywords/Table/Icon/Icons';
import EyeIcon from 'icons/eye.svg?inline';
import CloseIcon from 'icons/close.svg?inline';

import './kpi.scss';

type Props = {
  className?: string,
  style?: Object,
  xs: number,
  sm: number,
  md: number,
  lg: number,
  xl: number,
  title: string,
  value: number | string | React.Node,
  evolution?: number | false,
  valueAsCurrency: boolean,
  graph?: number[],
  reverseEvolution?: boolean,
  onClick?: Function,
  onDelete?: Function,
  active: boolean,
  loading?: boolean,
  expandText: string,
};

type State = {
  evolutionStart: number,
};

const renderCurrency = (num: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);

const getColor = (active: boolean, opacity: number) =>
  Highcharts.Color(!active ? '#9A6CC8' : '#f89537')
    .setOpacity(opacity)
    .get('rgba');

const renderGraph = (graph: number[], active: boolean) => (
  <div className="Kpi-graph">
    <LineChart
      series={[
        {
          type: 'areaspline',
          data: graph,
        },
      ]}
      extendConfig={{
        chart: { height: 100, margin: 0, backgroundColor: 'transparent', animation: false },
        lang: {
          noData: '',
        },
        xAxis: { visible: false },
        yAxis: { visible: false },
        tooltip: { enabled: false },
        exporting: { enabled: false },
        plotOptions: {
          areaspline: {
            animation: false,
            fillColor: getColor(active, 0.1),
            marker: { radius: 0 },
            lineWidth: 2,
            lineColor: getColor(active, 0.2),
            states: {
              hover: {
                enabled: false,
                lineWidth: 0,
              },
            },
            threshold: null,
          },
        },
      }}
    />
  </div>
);

class Kpi extends React.Component<Props, State> {
  state = {
    evolutionStart: 0,
  };

  static defaultProps = {
    xs: 12,
    sm: 6,
    md: 6,
    lg: 4,
    xl: 3,
    title: 'Kpi',
    expandText: 'view',
    value: 100,
    valueAsCurrency: true,
    active: false,
  };

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.evolution && nextProps.evolution !== this.state.evolutionStart) {
      this.setState({ evolutionStart: this.props.evolution || 0 });
    }
  }

  render() {
    const {
      className,
      style,
      title,
      value,
      evolution,
      valueAsCurrency,
      graph,
      reverseEvolution,
      onClick,
      onDelete,
      active,
      loading,
      expandText,
    } = this.props;
    const evoColor =
      evolution && ((evolution > 0 && !reverseEvolution) || (evolution < 0 && reverseEvolution))
        ? 'green'
        : 'red';

    return (
      <Col
        xs={this.props.xs}
        sm={this.props.sm}
        md={this.props.sm}
        lg={this.props.lg}
        xl={this.props.xl}
        className={className}
        style={style}
      >
        <div
          className={cn('Kpi', { pointer: onClick, loading, active })}
          onClick={() => onClick && onClick({ graph, title })}
        >
          {graph ? renderGraph(graph, active) : null}
          <div className="Kpi-inner">
            <div className="Kpi-title">{title}</div>
            <div className="Kpi-value">
              {loading ? '-' : valueAsCurrency ? renderCurrency(Number(value)) : value}
            </div>
            {evolution && !isNaN(evolution) ? (
              <div className={`Kpi-evolution ${evoColor}`}>
                {evolution > 0 ? <ArrowUp /> : <ArrowDown />}
                <CountUp
                  start={this.state.evolutionStart}
                  end={evolution < 0 ? evolution * -1 : evolution}
                  duration={1}
                  decimals={1}
                  suffix="%"
                />
              </div>
            ) : null}
          </div>

          {onClick ? (
            <div className="Kpi-expand">
              <span>{expandText}</span>
              <EyeIcon />
            </div>
          ) : null}

          {onDelete ? (
            <div className="Kpi-delete" onClick={() => onDelete()}>
              <CloseIcon />
            </div>
          ) : null}
        </div>
      </Col>
    );
  }
}

export default Kpi;
