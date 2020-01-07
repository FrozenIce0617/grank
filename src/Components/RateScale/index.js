//@flow
import React, { Component } from 'react';
import { AutoSizer } from 'react-virtualized';
import cn from 'classnames';
import { t } from 'Utilities/i18n';
import { Tooltip } from 'reactstrap';
import { uniqueId } from 'lodash';
import './rate-scale.scss';

type Props = {
  className: string,
  rangeStart: number,
  rangeEnd: number,
  onSelect: Function,
  question: string,
};

type State = {
  scaleHandlePosition: number,
};

const handleWidth = 23;

export default class RateScale extends Component<Props, State> {
  ref = React.createRef();
  distanceBetween: number = 0;
  tooltipHideTimeoutHandle: null;

  static defaultProps = {
    rangeStart: 0,
    rangeEnd: 10,
    onSelect: () => {},
  };

  constructor(props: Props) {
    super(props);

    this.helpTooltipId = uniqueId('rate_scale');

    this.state = {
      scaleHandlePosition: Math.floor((props.rangeEnd - props.rangeStart) / 2),
      isHelpTooltipOpened: false,
    };
  }

  handleRateSelect = () => {
    const { onSelect } = this.props;
    const { scaleHandlePosition } = this.state;

    onSelect(scaleHandlePosition);
  };

  handleStartHover = (evt: SyntheticEvent<*>) => {
    const { scaleHandlePosition } = this.state;
    const { rangeStart, rangeEnd } = this.props;
    if (this.ref.current) {
      const { left } = this.ref.current.getBoundingClientRect();

      // Get new position depends on mouse position
      let newPosition = Math.floor(
        (evt.pageX - left + this.distanceBetween / 2) / this.distanceBetween,
      );

      // Check if new position is in min-max range
      newPosition = Math.min(rangeEnd, Math.max(rangeStart, newPosition));
      newPosition !== scaleHandlePosition &&
        this.setState({
          scaleHandlePosition: newPosition,
        });
    }
  };

  handleSliderOver = () => {
    this.setState({
      isHelpTooltipOpened: true,
    });

    this.tooltipHideTimeoutHandle = setTimeout(
      () =>
        this.setState({
          isHelpTooltipOpened: false,
        }),
      2500,
    );
  };

  handleSliderLeave = () => {
    this.setState({
      isHelpTooltipOpened: false,
    });

    clearTimeout(this.tooltipHideTimeoutHandle);
  };

  getOffset = (width: number, tickNumber: number, amoutOfTicks: number) =>
    width * (tickNumber / (amoutOfTicks - 1));

  render() {
    const { rangeStart, rangeEnd, className, question } = this.props;
    const { scaleHandlePosition, isHelpTooltipOpened } = this.state;
    const amoutOfTicks = rangeEnd - rangeStart + 1;
    const ticks = Array(amoutOfTicks).fill();

    return (
      <div className={cn('rate-scale', className)} ref={this.ref}>
        <AutoSizer>
          {({ width }) => {
            const offset =
              this.getOffset(width, scaleHandlePosition, amoutOfTicks) - handleWidth / 2;
            this.distanceBetween = this.getOffset(width, 1, amoutOfTicks);
            return (
              <div
                className="rate-scale-content"
                onMouseMove={this.handleStartHover}
                onMouseLeave={this.handleSliderLeave}
                onMouseEnter={this.handleSliderOver}
                style={{ width }}
              >
                <div className="rate-scale-content-labels">{question}</div>
                <input
                  className="rate-scale-content-range-input"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={scaleHandlePosition}
                />
                <Tooltip
                  isOpen={isHelpTooltipOpened}
                  target={this.helpTooltipId}
                  delay={{ show: 0, hide: 0 }}
                  placement="bottom"
                  className="rate-scale-tooltip"
                >
                  <div className="rate-scale-content-labels-muted">
                    {t('Drag your mouse and click the option')}
                  </div>
                </Tooltip>
                <div id={this.helpTooltipId} className="rate-scale-content-slider">
                  <div
                    className="rate-scale-content-slider-handle"
                    style={{
                      width: `${handleWidth}px`,
                      height: `${handleWidth}px`,
                      left: `${offset}px`,
                    }}
                    onClick={this.handleRateSelect}
                  >
                    <span>{this.state.scaleHandlePosition}</span>
                  </div>
                  <div
                    className="rate-scale-content-slider-fill"
                    style={{ width: `${offset + handleWidth / 2}px` }}
                  />
                  {ticks.map(
                    (item, idx) =>
                      idx !== rangeStart &&
                      idx !== rangeEnd && (
                        <div
                          key={idx}
                          className="rate-scale-content-slider-tick"
                          style={{
                            left: `${this.getOffset(width, idx, amoutOfTicks)}px`,
                          }}
                        />
                      ),
                  )}
                </div>
              </div>
            );
          }}
        </AutoSizer>
      </div>
    );
  }
}
