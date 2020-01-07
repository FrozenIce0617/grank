// @flow
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { AsyncSelect } from 'Components/Controls/Select';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n/index';
import { withApollo } from 'react-apollo';
import CustomValueRenderer from 'Components/Controls/TagsInput/CustomValueRenderer';
import CustomClearRenderer from 'Components/Controls/TagsInput/CustomClearRenderer';
import Skeleton from 'Components/Skeleton';

type Props = {
  domains: string[],
  client: Object,
  value: string[],
  onChange: (value: string[]) => void,
  showError?: boolean,
  disabled?: boolean,
};

type LandingPage = {
  id: string,
  path: string,
};

type State = {
  loading: boolean,
  error: string,
};

const landingPagesQuery = gql`
  query landingPagesInput_getLandingPages($ids: [ID]!) {
    landingPages(ids: $ids) {
      id
      path
    }
  }
`;

const searchUrlsQuery = gql`
  query landingPagesInput_searchLandingPages($domains: [ID]!, $query: String!) {
    urls(domains: $domains, query: $query) {
      id
      path
    }
  }
`;

class LandingPagesInput extends Component<Props, State> {
  static defaultProps = {
    disabled: false,
  };

  state = {
    loading: false,
    error: '',
  };

  UNSAFE_componentWillMount() {
    if (this.props.value && this.props.value.length) {
      this.loadValue();
    }
  }

  landingPagesCache: { [id: string]: LandingPage } = {};

  optionsLoader = (query: string) => {
    const vars = {
      domains: this.props.domains,
      query,
    };
    return this.props.client
      .query({
        query: searchUrlsQuery,
        variables: vars,
      })
      .then(({ data }) => ({
        options: data.urls.map(urlData => ({
          id: urlData.id,
          path: urlData.path,
        })),
        complete: true,
      }));
  };

  loadValue = () => {
    this.setState({
      loading: true,
      error: '',
    });
    this.props.client
      .query({
        query: landingPagesQuery,
        variables: {
          ids: this.props.value,
        },
      })
      .then(
        ({ data }) => {
          data.landingPages.forEach(landingPage => {
            this.landingPagesCache[landingPage.id] = {
              id: landingPage.id,
              path: landingPage.path,
            };
          });
          this.setState({
            loading: false,
            error: '',
          });
        },
        error => {
          this.setState({
            loading: false,
            error: error.message,
          });
        },
      );
  };

  handleChange = (newValue: LandingPage[]) => {
    newValue.forEach(landingPage => {
      this.landingPagesCache[landingPage.id] = landingPage;
    });
    this.props.onChange(newValue.map(landingPage => landingPage.id));
  };

  render() {
    if (this.state.loading || this.state.error) {
      return (
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '120px', marginBottom: '10px' } }]}
        />
      );
    }
    const value = this.props.value.map(landingPageId => this.landingPagesCache[landingPageId]);
    return (
      <AsyncSelect
        value={value}
        onChange={this.handleChange}
        className={`form-tags-input ${this.props.showError ? 'error' : ''}`}
        loadOptions={this.optionsLoader}
        searchable={true}
        multi={true}
        disabled={this.props.disabled}
        valueComponent={CustomValueRenderer}
        clearRenderer={CustomClearRenderer}
        labelKey="path"
        valueKey="id"
        loadingPlaceholder={t('Fetching pages')}
        placeholder={t('Enter preferred URL')}
      />
    );
  }
}

export default compose(withApollo)(LandingPagesInput);
