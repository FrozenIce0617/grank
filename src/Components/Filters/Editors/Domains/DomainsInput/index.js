// @flow
import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import Select from 'Components/Controls/Select';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import { graphqlOK } from 'Utilities/underdash';
import CustomValueRenderer from 'Components/Controls/TagsInput/CustomValueRenderer';
import CustomClearRenderer from 'Components/Controls/TagsInput/CustomClearRenderer';
import Skeleton from 'Components/Skeleton';
import cn from 'classnames';

import { formatDomainOption } from 'Utilities/format';

type Props = {
  data: Object,
  value: string[],
  onChange: (value: string[]) => void,
  showError?: boolean,
  disabled?: boolean,
};

class DomainsInput extends Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  handleChange = newValue => {
    this.props.onChange(newValue.map(option => option.value));
  };

  render() {
    if (!graphqlOK(this.props)) {
      return (
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '120px', marginBottom: '10px' } }]}
        />
      );
    }

    const {
      data: { domainsList: domains },
      value,
      showError,
      disabled,
    } = this.props;
    const domainsMap = domains.reduce((acc, domain) => {
      acc[domain.id] = formatDomainOption(domain);
      return acc;
    }, {});
    return (
      <Select
        autoFocus
        value={value.map(domainId => domainsMap[domainId])}
        options={domains.map(formatDomainOption)}
        onChange={this.handleChange}
        className={cn('form-tags-input', { error: showError })}
        searchable
        multi
        disabled={disabled}
        valueComponent={CustomValueRenderer}
        clearRenderer={CustomClearRenderer}
        placeholder={t('Enter domains')}
      />
    );
  }
}

const domainsQuery = gql`
  query domainsInput_domainsList {
    domainsList {
      id
      domain
      displayName
    }
  }
`;

export default graphql(domainsQuery)(DomainsInput);
