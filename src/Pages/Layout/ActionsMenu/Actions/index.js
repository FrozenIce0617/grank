// @flow
import * as React from 'react';
import IconButton from 'Components/IconButton';
import { t } from 'Utilities/i18n/index';
import cn from 'classnames';
import AddIcon from 'icons/plus-rounded.svg?inline';
import EditIcon from 'icons/edit.svg?inline';
import RefreshIcon from 'icons/refresh.svg?inline';
import ReportIcon from 'icons/report.svg?inline';
import SettingsIcon from 'icons/settings.svg?inline';
import DomainSettingsIcon from 'icons/domain-settings.svg?inline';
import ConnectingIcon from 'icons/connecting.svg?inline';
import CopyIcon from 'icons/copy.svg?inline';
import CompareIcon from 'icons/diagram.svg?inline';
import UpgradeAction from './UpgradeAction';

type IconButtonProps = {
  className?: string,
  label?: string,
  icon?: any,
  onClick?: Function,
  brand?: string,
};

export const EditAction = (props: IconButtonProps) => (
  <IconButton {...props} brand="orange" icon={props.icon || <EditIcon />}>
    {props.label || t('Edit')}
  </IconButton>
);

export const UpdateAction = (props: IconButtonProps) => (
  <IconButton {...props} brand={props.brand} icon={props.icon || <SettingsIcon />}>
    {props.label || t('Update')}
  </IconButton>
);

export const RefreshAction = (props: IconButtonProps) => (
  <IconButton {...props} brand="orange" icon={props.icon || <RefreshIcon />}>
    {props.label || t('Refresh')}
  </IconButton>
);

export const AddAction = (props: IconButtonProps) => (
  <IconButton {...props} brand="orange" icon={props.icon || <AddIcon />}>
    {props.label || t('Add')}
  </IconButton>
);

export const ConnectToAnalyticsAction = (props: IconButtonProps) => (
  <IconButton {...props} brand="orange" icon={props.icon || <ConnectingIcon />}>
    {props.label || t('Connect to analytics')}
  </IconButton>
);

export const ConnectToGSCAction = (props: IconButtonProps) => (
  <AddAction
    {...props}
    label={props.label || t('Connect to search console')}
    icon={props.icon || <ConnectingIcon />}
  />
);

export const EditDomainAction = (props: IconButtonProps) => (
  <EditAction
    {...props}
    label={props.label || t('Edit domain')}
    icon={props.icon || <DomainSettingsIcon />}
  />
);

export const LinkAction = (props: { label: string, link: string, icon?: any }) => (
  <IconButton {...props} brand="orange" icon={props.icon || <AddIcon />}>
    {props.label}
  </IconButton>
);

export const ReportAction = (props: IconButtonProps) => (
  <IconButton
    {...props}
    title={t('Download')}
    className={cn('icn-report', props.className)}
    icon={props.icon || <ReportIcon />}
  >
    {props.label || t('Report')}
  </IconButton>
);

export const CopyAction = (props: IconButtonProps) => (
  <IconButton
    {...props}
    title={t('Copy')}
    className={cn('icn-copy', props.className)}
    icon={props.icon || <CopyIcon />}
  >
    {props.label || t('To clipboard')}
  </IconButton>
);

export const SettingsAction = (props: IconButtonProps) => (
  <IconButton
    {...props}
    title={t('Table')}
    className={cn('icn-settings', props.className)}
    icon={props.icon || <SettingsIcon />}
  >
    {props.label || t('Settings')}
  </IconButton>
);

export const NormalAction = (props: IconButtonProps) => (
  <IconButton brand="orange" icon={props.icon || <SettingsIcon />} {...props}>
    {props.label}
  </IconButton>
);

export const CompareAction = (props: IconButtonProps) => (
  <IconButton {...props} title={t('Compare')} className="icn-settings" icon={<CompareIcon />}>
    {props.label}
  </IconButton>
);

export { UpgradeAction };
