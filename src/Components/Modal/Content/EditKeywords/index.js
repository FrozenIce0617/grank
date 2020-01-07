// @flow
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { hideModal } from 'Actions/ModalAction';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import Button from 'Components/Forms/Button';
import Checkbox from 'Components/Controls/Checkbox';
import CheckboxGroup from 'Components/Controls/CheckboxGroup';
import Hint from 'Components/Hint';
import Toast from 'Components/Toast';
import './edit-keywords.scss';

type Keyword = {
  id: string,
  keyword: string,
  ignoreInShareOfVoice: boolean,
  ignoreLocalResults: boolean,
  ignoreFeaturedSnippet: boolean,
  enableAutocorrect: boolean,
};

type Props = {
  allKeywords: Keyword[],
  hideModal: Function,
  keywords: Keyword[],
  updateKeywords: Function,
  shouldExclude: boolean,
  filters: FilterBase[],
  optimisticUpdate: Function,
};

type State = {
  options: {
    ignoreInShareOfVoice: boolean,
    ignoreLocalResults: boolean,
    ignoreFeaturedSnippet: boolean,
    enableAutocorrect: boolean,
  },
};

const defaultOptions = {
  ignoreInShareOfVoice: false,
  ignoreLocalResults: false,
  ignoreFeaturedSnippet: false,
  enableAutocorrect: false,
};

const GOOGLE = 'google';

class EditKeywords extends Component<Props, State> {
  constructor(props) {
    super(props);

    const { allKeywords, keywords, shouldExclude } = this.props;
    const keyword = shouldExclude
      ? allKeywords.length === 1 && allKeywords[0]
      : keywords.length === 1 && keywords[0];

    let options = defaultOptions;
    if (keyword) {
      options = {
        ignoreInShareOfVoice: keyword.ignoreInShareOfVoice,
        ignoreLocalResults: keyword.ignoreLocalResults,
        ignoreFeaturedSnippet: keyword.ignoreFeaturedSnippet,
        enableAutocorrect: keyword.enableAutocorrect,
      };
    }

    this.state = {
      inProgress: false,
      options,
    };
  }

  getIds = keywords => keywords.map(keywordData => keywordData.id);

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

  handleSubmit = () => {
    const { keywords, shouldExclude, optimisticUpdate } = this.props;
    const { options } = this.state;
    const onRealUpdate = optimisticUpdate({
      ids: this.getIds(keywords),
      item: {
        ignoreLocalResults: options.ignoreLocalResults,
        ignoreFeaturedSnippet: options.ignoreFeaturedSnippet,
        ignoreInShareOfVoice: options.ignoreInShareOfVoice,
        enableAutocorrect: options.enableAutocorrect,
      },
      isExcluded: shouldExclude,
    });
    this.props
      .updateKeywords({
        variables: {
          input: {
            ...this.getKeywordsInput(),
            ignoreLocalResults: options.ignoreLocalResults,
            ignoreFeaturedSnippet: options.ignoreFeaturedSnippet,
            ignoreInShareOfVoice: options.ignoreInShareOfVoice,
            enableAutocorrect: options.enableAutocorrect,
          },
        },
      })
      .catch(() => {
        onRealUpdate();
        Toast.error(t('Failed to update keywords'));
      });

    this.props.hideModal();
  };

  render() {
    const { keywords } = this.props;
    const { options } = this.state;

    const showAutocorrectOption = keywords.some(
      ({ searchEngine }) =>
        searchEngine && searchEngine.name && searchEngine.name.toLowerCase() === GOOGLE,
    );

    const selection = Object.keys(options).filter(setting => options[setting]);
    return (
      <ModalBorder
        className="edit-keywords"
        title={t('Change Settings for Selected Keywords')}
        onClose={this.props.hideModal}
      >
        <CheckboxGroup name="keywords_options" value={selection} onChange={this.handleChange}>
          <Checkbox value="ignoreLocalResults">
            {t('Ignore local pack')}
            <Hint>
              {t(
                'If checked, any local pack found on the SERP will not be included in the rank position.',
              )}
            </Hint>
          </Checkbox>
          <Checkbox value="ignoreFeaturedSnippet">
            {t('Ignore featured snippets')}
            <Hint>
              {t('Ignore the featured snippet that is often shown on how/what searches.')}
            </Hint>
          </Checkbox>
          <Checkbox value="ignoreInShareOfVoice">
            {t('Ignore in Share of Voice')}
            <Hint>{t('Do not include this keyword in the Share of Voice calculation.')}</Hint>
          </Checkbox>
          {showAutocorrectOption && (
            <Checkbox value="enableAutocorrect">
              {t('Enable autocorrect')}
              <Hint>{t('Enable Google Autocorrect for this keyword')}</Hint>
            </Checkbox>
          )}
        </CheckboxGroup>
        <div className="footer">
          <Button theme="grey" onClick={this.props.hideModal}>
            {t('Cancel')}
          </Button>
          <Button theme="orange" onClick={this.handleSubmit}>
            {t('Change settings')}
          </Button>
        </div>
      </ModalBorder>
    );
  }
}

const updateKeywords = gql`
  mutation editKeywords_updateKeywords($input: UpdateKeywordsInput!) {
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
  graphql(updateKeywords, { name: 'updateKeywords' }),
)(EditKeywords);
