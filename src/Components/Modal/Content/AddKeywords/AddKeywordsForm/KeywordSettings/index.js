// @flow
import * as React from 'react';
import CheckboxGroup from 'Components/Controls/CheckboxGroup';
import Checkbox from 'Components/Controls/Checkbox';
import Hint from 'Components/Hint';
import toFormField from 'Components/Forms/toFormField';
import { t } from 'Utilities/i18n';
import type { KeywordSettings } from '../types';

type Props = {
  value: KeywordSettings,
  onChange: Function,
  showError?: boolean,
  disabled?: boolean,
  showAutocorrectOption: boolean,
};

const defaultSettings = {
  starred: false,
  ignoreLocalResults: false,
  ignoreFeaturedSnippet: false,
  ignoreInShareOfVoice: false,
  enableAutocorrect: false,
};

class SettingsField extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  handleChange = (properties: string[]) => {
    const newValue = properties.reduce(
      (accumulator, property) => {
        accumulator[property] = true;
        return accumulator;
      },
      { ...defaultSettings },
    );
    this.props.onChange(newValue);
  };

  render() {
    const { value, showAutocorrectOption, showError } = this.props;
    const selectedProperties = Object.keys(value).filter(field => value[field]);
    return (
      <CheckboxGroup
        disabled={this.props.disabled}
        name="add-keywords-settings"
        className="add-keywords-settings"
        value={selectedProperties}
        onChange={this.handleChange}
      >
        <Checkbox value="ignoreLocalResults">
          {t('Ignore local pack')}
          <Hint>
            {t(
              'If checked, any local pack found on the SERP will not be included in the rank position.',
            )}
          </Hint>
        </Checkbox>
        <Checkbox value="ignoreFeaturedSnippet">
          {t('Ignore featured snippet')}
          <Hint>{t('Ignore the featured snippet that is often shown on how/what searches.')}</Hint>
        </Checkbox>
        <Checkbox disabled={!showAutocorrectOption} value="enableAutocorrect">
          {t('Enable autocorrect')}
          <Hint>{t('Enable Google Autocorrect for this keyword')}</Hint>
        </Checkbox>
        <Checkbox value="starred">{t('Star keywords')}</Checkbox>
        <Checkbox value="ignoreInShareOfVoice">
          {t('Ignore in share of voice')}
          <Hint>{t('Ignore in share of voice, this is usually used for branded keywords.')}</Hint>
        </Checkbox>
      </CheckboxGroup>
    );
  }
}

export default toFormField(SettingsField);
