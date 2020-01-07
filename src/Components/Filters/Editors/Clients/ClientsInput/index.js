// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import Select from 'Components/Controls/Select';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n/index';
import CustomValueRenderer from 'Components/Controls/TagsInput/CustomValueRenderer';
import CustomClearRenderer from 'Components/Controls/TagsInput/CustomClearRenderer';
import Skeleton from 'Components/Skeleton';

type Client = {
  id: string,
  name: string,
};

type Props = {
  clients: Client[],
  loading: false,
  error: '',
  value: string[],
  onChange: (value: string[]) => void,
  showError?: boolean,
  disabled?: boolean,
};

const clientsQuery = gql`
  query clientsInput_clients {
    clients {
      id
      name
    }
  }
`;

class ClientsInput extends Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  handleChange = (newValue: Client[]) => {
    this.props.onChange(newValue.map(client => client.id));
  };

  render() {
    if (this.props.loading || this.props.error) {
      return (
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '120px', marginBottom: '10px' } }]}
        />
      );
    }
    const clientsMap = this.props.clients.reduce((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {});
    const value = this.props.value.map(clientId => clientsMap[clientId]);
    return (
      <Select
        autoFocus
        value={value}
        options={this.props.clients}
        onChange={this.handleChange}
        className={`form-tags-input ${this.props.showError ? 'error' : ''}`}
        searchable={true}
        multi={true}
        disabled={this.props.disabled}
        valueComponent={CustomValueRenderer}
        clearRenderer={CustomClearRenderer}
        labelKey="name"
        valueKey="id"
        placeholder={t('Enter group names')}
      />
    );
  }
}

export default compose(
  graphql(clientsQuery, {
    props: ({ data: { error, loading, clients } }) => ({
      error,
      loading,
      clients,
    }),
  }),
)(ClientsInput);
