// @flow
import * as React from 'react';
import cn from 'classnames';
import LinkToDomain from 'Components/Filters/LinkToDomain';
import './domain-details.scss';
import { t } from 'Utilities/i18n/index';

type Props = {
  domainId: string,
  title: string,
  domain: string,
  canUpdate: boolean,
  logo: string,
  shouldLink: boolean,
  reset: boolean,
  small: boolean,
};

class Domain extends React.Component<Props> {
  static defaultProps = {
    shouldLink: true,
    reset: false,
    canUpdate: true,
  };

  render() {
    const { title, domain, logo, domainId, reset, small, canUpdate } = this.props;
    return (
      <div className={cn('domain-details', { 'domain-details-small': small })}>
        <img className="logo" src={logo} />
        <div>
          {this.props.shouldLink ? (
            <LinkToDomain domainId={domainId} reset={reset} className="title">
              {title}
            </LinkToDomain>
          ) : (
            <span>{title}</span>
          )}
          {!canUpdate && <span className="ml-1 badge badge-primary">{t('Demo Domain')}</span>}
          {!title ? (
            <LinkToDomain domainId={domainId} reset={reset} className="title">
              {domain}
            </LinkToDomain>
          ) : (
            <div className="domain">{domain}</div>
          )}
        </div>
      </div>
    );
  }
}

export default Domain;
