// @flow
import React from 'react';
import { connect } from 'react-redux';
import IconButton from 'Components/IconButton';
import { t } from 'Utilities/i18n/index';
import AddIcon from 'icons/plus-rounded.svg?inline';

type Props = {
  label?: string,
  icon?: any,
  className?: string,
  alignRight: boolean,
  featureAdvancedMetrics: boolean,
};

const UpgradeAction = (props: Props) => {
  if (props.featureAdvancedMetrics) {
    return null;
  }
  const button = (
    <IconButton
      className={props.className || ''}
      {...props}
      link="/billing/package/select"
      brand="orange"
      icon={props.icon || <AddIcon />}
    >
      {props.label || t('Upgrade plan')}
    </IconButton>
  );
  if (props.alignRight) {
    return <div className="ml-auto mr-1">{button}</div>;
  }
  return button;
};

const mapStateToProps = state => ({
  featureAdvancedMetrics: state.user.organization.activePlan.featureAdvancedMetrics,
});

export default connect(mapStateToProps)(UpgradeAction);
