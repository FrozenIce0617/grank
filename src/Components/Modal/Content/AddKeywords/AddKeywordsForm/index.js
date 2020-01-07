// @flow
import * as React from 'react';
import { t, tn } from 'Utilities/i18n';
import { connect } from 'react-redux';
import cn from 'classnames';
import type { Dispatch } from 'redux';
import { reduxForm, formValueSelector, change } from 'redux-form';
import { Field, FieldArray } from 'redux-form';
import { Link } from 'react-router-dom';
import fetchJsonp from 'fetch-jsonp';

import { TagsField, LocaleDropdownField } from 'Components/Forms/Fields';
import Hint from 'Components/Hint';
import Button from 'Components/Forms/Button';
import { LocationField } from 'Components/Forms/Fields';
import IconButton from 'Components/IconButton';
import AddIcon from 'icons/plus-rounded.svg?inline';

import KeywordsField from './KeywordsField';
import KeywordsCount, { mapStateToProps as keywordsCountMapStateToProps } from './KeywordsCount';
import KeywordSettings from './KeywordSettings';
import SearchSettingsField from './SearchSettingsField';
import type { SearchEngine } from './types';
import { showModal } from 'Actions/ModalAction';
import FormErrors from 'Components/Forms/FormErrors';
import { linkToImportGSCWithDomains } from 'Components/Filters/LinkToDomain';

import Validation from 'Utilities/validation';

import './add-keywords-form.scss';

type Locale = {
  id: string,
  region: string,
  countryCode: string,
  localeShort: string,
  locale: string,
  searchEngines: string[],
};

type Props = {
  handleSubmit: Function,
  onCancel: Function,
  locales: Locale[],
  localeId: string,
  keywords: string[],
  searchEngines: SearchEngine[],
  change: Function,
  initialValues: Object,
  hasGSC: boolean,
  openHelperOverlay?: Function,
  count: number, // Number of keywords
  showModal: Function,
  domain: string,
  refresh?: () => void,
  submitting: boolean,
  country: string,
};

type State = {
  showSuggestions: boolean,
  suggestions: Array<string>,
  suggestionSearchText: string,
};

function suggest(resp) {
  console.log(resp);
}

const GOOGLE = 'google';

class AddKeywordsForm extends React.Component<Props, State> {
  inputRef = React.createRef();

  state = {
    showSuggestions: false,
    suggestions: [],
    suggestionSearchText: '',
  };

  componentDidUpdate(prevProps) {
    const localeId = prevProps.localeId || prevProps.initialValues.localeId;
    if (localeId !== this.props.localeId) {
      const newLocale = prevProps.locales.find(localeObj => localeObj.id === this.props.localeId);
      if (newLocale) {
        const currentEngines = prevProps.searchEngines;
        const searchEngines = newLocale.searchEngines.map(searchEngineId => {
          const currentSearchEngine = currentEngines.find(
            searchEngine => searchEngine.id === searchEngineId,
          );
          return currentSearchEngine
            ? currentSearchEngine
            : {
                id: searchEngineId,
                searchTypes: [],
              };
        });
        this.props.change('searchEngines', searchEngines);
      }
    }
  }

  validateSettings(searchEngines: SearchEngine[]) {
    const hasSelectedOption = searchEngines.reduce((acc, searchEngine) => {
      acc = acc || searchEngine.searchTypes.length > 0;
      return acc;
    }, false);
    if (!hasSelectedOption) {
      return t('Please select at least one option');
    }
  }

  handleConnectToGSC = () => {
    const domainId = this.props.domain;

    this.props.showModal({
      modalType: 'ConnectToGSC',
      modalTheme: 'light',
      modalProps: {
        domainId,
      },
    });
  };

  renderLocations(data) {
    return (
      <div className="locations">
        {data.fields.map((location, i) => (
          <Field
            key={location}
            component={LocationField}
            selectedCountry={data.selectedCountry}
            canDelete={data.fields.length > 1}
            onDelete={() => data.fields.remove(i)}
            name={location}
            placeholder={t('Enter location')}
          />
        ))}
        <IconButton icon={<AddIcon />} onClick={() => data.fields.push('')}>
          {t('Add another location')}
        </IconButton>
      </div>
    );
  }

  renderImportGCS = () => {
    const { showSuggestions } = this.state;
    const { hasGSC, domain: domainId, country } = this.props;
    if (hasGSC) {
      return (
        <Link
          id="importGSCLink"
          className={cn('btn btn-block btn-brand-purple-gradient', { disabled: showSuggestions })}
          to={linkToImportGSCWithDomains(domainId, { country })}
          onClick={this.props.onCancel}
        >
          {t('Import from Google Search Console')}
        </Link>
      );
    }
    return (
      <span
        id="importGSCLink"
        className={cn('btn btn-block btn-brand-purple-gradient', { disabled: showSuggestions })}
        onClick={this.handleConnectToGSC}
      >
        {t('Connect to Google Search Console')}
      </span>
    );
  };

  handleSuggestionSearchText = (text: string) => {
    this.setState({ suggestionSearchText: text });
    this.fetchKeywordSuggestions(text);
  };

  fetchKeywordSuggestions = (text: string) => {
    const localeId = this.props.localeId || this.props.initialValues.localeId;
    const locale = this.props.locales.find(localObj => localObj.id === localeId);

    fetchJsonp(
      `https://suggestqueries.google.com/complete/search?q=${text}&hl=${
        !locale ? 'en' : locale.localeShort
      }&client=youtube&_=1531379428615&gl=${!locale ? 'us' : locale.countryCode.toLowerCase()}`,
      {
        mode: 'no-cors',
      },
    )
      .then(response => response.json())
      .then(data => {
        this.setState({ suggestions: data[1].map(el => el[0]) });
      });
  };

  render() {
    const { showSuggestions, suggestions, suggestionSearchText } = this.state;
    const { submitting, keywords, count, searchEngines } = this.props;

    const googleEngine = searchEngines && searchEngines.find(({ id }) => id === GOOGLE);
    const showAutocorrectOption =
      googleEngine && googleEngine.searchTypes && !!googleEngine.searchTypes.length;

    const localeId = this.props.localeId || this.props.initialValues.localeId;
    const locale = this.props.locales.find(localeObj => localeObj.id === localeId);
    if (!locale) {
      return null;
    }
    return (
      <form className="add-keywords-form">
        <FormErrors />
        <div className="columns-container">
          <div className="keywords-column">
            <div className="form-label">{t('Keywords')}</div>
            <Field
              name="keywords"
              component={KeywordsField}
              validate={Validation.array}
              placeholder={t('Enter the keywords one per line')}
            />
            <div
              className="btn btn-block btn-outline-brand-orange"
              onClick={() => {
                this.setState({ showSuggestions: !showSuggestions });
                this.inputRef.current.focus();
              }}
            >
              {t('%s keyword suggestions', showSuggestions ? 'Hide' : 'Show')}
            </div>

            <div className={cn({ 'add-keywords-suggestion-list': showSuggestions })}>
              <input
                type="text"
                className={cn('add-keywords-suggestion-input', { hide: !showSuggestions })}
                value={suggestionSearchText}
                onChange={e => this.handleSuggestionSearchText(e.target.value)}
                placeholder={t('Start typing for keyword suggestions ...')}
                ref={this.inputRef}
              />

              {showSuggestions && suggestions.length ? (
                <React.Fragment>
                  <div className="add-keywords-suggestion-disclaimer">
                    {t('Click on a keyword to add/remove it in the list above')}
                  </div>
                  {suggestions.map((el, i) => {
                    const exists = keywords.includes(el);
                    return (
                      <div
                        key={i}
                        className={cn('add-keywords-suggestion-tag', { disabled: exists })}
                        onClick={() =>
                          this.props.change(
                            'keywords',
                            !exists ? [...keywords, el] : keywords.filter(kw => kw !== el),
                          )
                        }
                      >
                        {el}
                      </div>
                    );
                  })}
                </React.Fragment>
              ) : null}
            </div>

            <div className="import-buttons">
              <div>{this.renderImportGCS()}</div>
              <Link to={'/import/bulk'}>
                <span
                  className={cn('btn btn-block btn-brand-purple-gradient', {
                    disabled: showSuggestions,
                  })}
                  onClick={this.props.openHelperOverlay}
                >
                  {t('Import from CSV')}
                </span>
              </Link>
            </div>
          </div>
          <div className="settings-column">
            <div className="form-label">{t('Search Locale')}</div>
            <Field
              defaultBehaviour
              placeholder={t('Select locale')}
              component={LocaleDropdownField}
              locales={this.props.locales}
              name="localeId"
            />
            <div className="form-label">{t('Location')}</div>
            <div className="locations">
              <FieldArray
                name="locations"
                selectedCountry={locale.countryCode}
                component={this.renderLocations}
              />
            </div>
            <div className="form-label">
              {t('Search Settings')}
              <Hint>
                {t(
                  'Check the search engine(s) to search in and the device type that you want to search as.',
                )}
              </Hint>
            </div>
            <Field
              component={SearchSettingsField}
              name="searchEngines"
              validate={this.validateSettings}
            />
            <div className="form-label">{t('Tags')}</div>
            <Field placeholder={t('Enter tags here')} component={TagsField} name="tags" />
            <div className="settings-label">{t('Advanced Settings')}</div>
            <Field
              component={KeywordSettings}
              name="keywordSettings"
              showAutocorrectOption={showAutocorrectOption}
            />
          </div>
        </div>
        <div className="form-footer">
          <KeywordsCount />
          <Button theme="grey" disabled={submitting} onClick={this.props.onCancel}>
            {t('Cancel')}
          </Button>
          <Button theme="orange" disabled={submitting || !count} onClick={this.props.handleSubmit}>
            {tn('Add keyword', 'Add keywords', count)}
          </Button>
        </div>
      </form>
    );
  }
}

const ReduxAddKeywordsForm = reduxForm({
  form: 'AddKeywordsForm',
})(AddKeywordsForm);

const formSelector = formValueSelector('AddKeywordsForm');

const mapStateToProps = state => ({
  ...keywordsCountMapStateToProps(state),
  localeId: formSelector(state, 'localeId'),
  searchEngines: formSelector(state, 'searchEngines'),
  keywords: formSelector(state, 'keywords'),
});

const mapDispatchToProps = (dispatch: Dispatch<*>) => ({
  change: (field: string, value: any) =>
    dispatch(change('AddKeywordsForm', field, value, true, false)),
  showModal: modalProps => dispatch(showModal(modalProps)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReduxAddKeywordsForm);
