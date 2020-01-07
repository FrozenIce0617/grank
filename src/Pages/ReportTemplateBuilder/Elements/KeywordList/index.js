// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n/index';
import type { KeywordList } from 'Types/ReportElement';
import Checkbox from 'Components/Controls/Checkbox';
import Select from 'Components/Controls/Select';

type Props = {
  value: KeywordList,
  onChange: Function,
};

class HeaderEditor extends React.Component<Props> {
  groupByOptions = [
    { label: t('No grouping'), value: '' },
    { label: t('Tags'), value: 'tags' },
    { label: t('URL'), value: 'url' },
    { label: t('Location'), value: 'location' },
    { label: t('Country'), value: 'country' },
  ];

  orderByOptions = [
    { label: t('Keyword'), value: 'keyword' },
    { label: t('Rank'), value: 'rank' },
    { label: t('Search volume'), value: 'searchvolume' },
    { label: t('Visits'), value: 'visits' },
    { label: t('Potential'), value: 'potential' },
  ];

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange({
      ...this.props.value,
      [event.currentTarget.name]: event.currentTarget.checked,
    });
  };

  handleSelectChange = (fieldName: string) => ({ value }: { value: string }) => {
    this.props.onChange({
      ...this.props.value,
      [fieldName]: value,
    });
  };

  render() {
    const value = this.props.value;
    return (
      <div>
        <Checkbox
          kind="toggle"
          name="showSearchVolume"
          checked={value.showSearchVolume}
          onChange={this.handleChange}
        >
          {t('Show search volume')}
        </Checkbox>
        <Checkbox
          kind="toggle"
          name="showVisitsAndPotential"
          checked={value.showVisitsAndPotential}
          onChange={this.handleChange}
        >
          {t('Show visits and potential')}
        </Checkbox>
        <Checkbox
          kind="toggle"
          name="showRankFeatures"
          checked={value.showRankFeatures}
          onChange={this.handleChange}
        >
          {t('Show rank features')}
        </Checkbox>
        <Checkbox
          kind="toggle"
          name="showAllRanks"
          checked={value.showAllRanks}
          onChange={this.handleChange}
        >
          {t('Show all ranks')}
        </Checkbox>
        <Checkbox
          kind="toggle"
          name="showStartDateRank"
          checked={value.showStartDateRank}
          onChange={this.handleChange}
        >
          {t('Show start date rank')}
        </Checkbox>
        <Checkbox
          kind="toggle"
          name="showInitialRank"
          checked={value.showInitialRank}
          onChange={this.handleChange}
        >
          {t('Show initial rank')}
        </Checkbox>
        <Select
          options={this.groupByOptions}
          value={value.groupBy}
          onChange={this.handleSelectChange('groupBy')}
        >
          {t('Group by')}
        </Select>
        <Select
          options={this.orderByOptions}
          value={value.orderBy}
          onChange={this.handleSelectChange('orderBy')}
        >
          {t('Order by')}
        </Select>
      </div>
    );
  }
}

export default HeaderEditor;
