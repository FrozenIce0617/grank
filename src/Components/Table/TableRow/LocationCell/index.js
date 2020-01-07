// @flow
import React, { Component } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { uniqueId } from 'lodash';

type Props = {
  countryCode: string,
  region?: string,
  locale: string,
  location: string,
};

class LocationCell extends Component<Props> {
  tooltipId = uniqueId('locale-tooltip');
  locationTipId = uniqueId('location-tooltip');

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.countryCode !== this.props.countryCode ||
      nextProps.region !== this.props.region ||
      nextProps.locale !== this.props.locale ||
      nextProps.location !== this.props.location
    );
  }

  render() {
    const { countryCode, region, locale, location } = this.props;
    const showTooltip = !!region;
    return (
      <div className="ellipsis">
        {showTooltip && (
          <UncontrolledTooltip delay={{ show: 0, hide: 0 }} placement="top" target={this.tooltipId}>
            {region} ({locale})
          </UncontrolledTooltip>
        )}
        <span
          id={this.tooltipId}
          className={`flag-icon flag-icon-${countryCode.toLowerCase()} mr-2`}
        />
        <span id={this.locationTipId}>{location}</span>
        <UncontrolledTooltip
          delay={{ show: 0, hide: 0 }}
          placement="top"
          target={this.locationTipId}
        >
          {location}
        </UncontrolledTooltip>
      </div>
    );
  }
}

export default LocationCell;
