// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { transform, capitalize } from 'lodash';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import toast from 'Components/Toast';
import './duplicate-keywords.scss';
import Checkbox from 'Components/Controls/Checkbox';
import CheckboxGroup from 'Components/Controls/CheckboxGroup';
import Button from 'Components/Forms/Button';
import type { FilterBase } from 'Types/Filter';

type Props = {
  hideModal: Function,
  keywords: any,
  refresh: Function,
  duplicateKeywords: Function,
  shouldExclude: boolean,
  filters: FilterBase[],
};

type State = {
  inProgress: boolean,
  options: {
    bing: boolean,
    google: boolean,
    mobile: boolean,
    desktop: boolean,
  },
};

const defaultOptions = {
  bing: false,
  google: false,
  mobile: false,
  desktop: false,
};

const GOOGLE = 'google';
const BING = 'bing';
const DESKTOP = 'desktop';
const MOBILE = 'mobile';

class DuplicateKeywords extends Component<Props, State> {
  state = {
    inProgress: false,
    options: defaultOptions,
  };

  getKeywordsInput = () => {
    const { keywords, shouldExclude, filters } = this.props;
    const ids = keywords.map(keywordData => keywordData.id);
    return shouldExclude
      ? {
          keywordsToExclude: ids,
          filters,
        }
      : {
          keywords: ids,
        };
  };

  handleSubmit = () => {
    const { options } = this.state;
    this.setState({
      inProgress: true,
    });
    this.props
      .duplicateKeywords({
        variables: {
          input: {
            ...this.getKeywordsInput(),
            ...transform(
              options,
              (acc, value, key) => {
                acc[`duplicate${capitalize(key)}`] = value;
                return acc;
              },
              {
                duplicate: true,
              },
            ),
          },
        },
      })
      .then(() => {
        this.setState({
          inProgress: false,
        });
        toast.success(t('Updated'));
        this.props.refresh();
        this.props.hideModal();
      });
  };

  handleChange = (selection: string[]) => {
    this.setState({
      options: selection.reduce(
        (currentOptions, settingKey) => {
          currentOptions[settingKey] = true;
          return currentOptions;
        },
        { ...defaultOptions },
      ),
    });
  };

  render() {
    const options = this.state.options;
    const inProgress = this.state.inProgress;
    const selection = Object.keys(options).filter(setting => options[setting]);

    const submitEnabled =
      (options[GOOGLE] || options[BING]) && (options[DESKTOP] || options[MOBILE]);

    return (
      <ModalBorder
        className="duplicate-keywords"
        title={t('Duplicate Keywords')}
        onClose={this.props.hideModal}
      >
        <CheckboxGroup
          name="duplicate_options"
          value={selection}
          disabled={inProgress}
          onChange={this.handleChange}
        >
          <div className="form-label">{t('Search Engines')}</div>
          <Checkbox value={GOOGLE}>{t('Google')}</Checkbox>
          <Checkbox value={BING}>{t('Bing')}</Checkbox>
          <div className="form-label">{t('Search Types')}</div>
          <Checkbox value={DESKTOP}>{t('Desktop')}</Checkbox>
          <Checkbox value={MOBILE}>{t('Mobile')}</Checkbox>
        </CheckboxGroup>
        <div className="footer">
          <Button theme="grey" disabled={inProgress} onClick={this.props.hideModal}>
            {t('Cancel')}
          </Button>
          <Button
            theme="orange"
            disabled={inProgress || !submitEnabled}
            onClick={this.handleSubmit}
          >
            {t('Duplicate keywords')}
          </Button>
        </div>
      </ModalBorder>
    );
  }
}

const duplicateKeywordsQuery = gql`
  mutation duplicateKeywords_updateKeywords($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

const mapStateToProps = state => ({
  filters: state.filter.filterGroup.filters,
});

export default compose(
  connect(
    mapStateToProps,
    { hideModal },
  ),
  graphql(duplicateKeywordsQuery, { name: 'duplicateKeywords' }),
)(DuplicateKeywords);
