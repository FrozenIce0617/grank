// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n/index';
import type { KeywordSummary } from 'Types/ReportElement';
import Checkbox from 'Components/Controls/Checkbox';
import Select from 'Components/Controls/Select';

type Props = {
  value: KeywordSummary,
  onChange: Function,
};

class HeaderEditor extends React.Component<Props> {
  options = [
    { label: t('No grouping'), value: '' },
    { label: t('Tags'), value: 'tags' },
    { label: t('URL'), value: 'url' },
    { label: t('Location'), value: 'location' },
    { label: t('Country'), value: 'country' },
    { label: t('Search engine'), value: 'searchengine' },
    { label: t('Search type'), value: 'searchtype' },
  ];

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange({
      ...this.props.value,
      [event.currentTarget.name]: event.currentTarget.checked,
    });
  };

  handleSelectChange = ({ value }: { value: string }) => {
    this.props.onChange({
      ...this.props.value,
      groupBy: value,
    });
  };

  render() {
    const value = this.props.value;
    return (
      <div>
        <Checkbox
          kind="toggle"
          name="showAverageRank"
          checked={value.showAverageRank}
          onChange={this.handleChange}
        >
          {t('Show average rank')}
        </Checkbox>
        <Checkbox
          kind="toggle"
          name="showSearchVolume"
          checked={value.showSearchVolume}
          onChange={this.handleChange}
        >
          {t('Show search volume')}
        </Checkbox>
        <Select options={this.options} value={value.groupBy} onChange={this.handleSelectChange}>
          {t('Group by')}
        </Select>
      </div>
    );
  }
}

export default HeaderEditor;
