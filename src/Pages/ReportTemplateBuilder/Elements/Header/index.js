// @flow
import * as React from 'react';
import { t } from 'Utilities/i18n/index';
import type { Header } from 'Types/ReportElement';
import Checkbox from 'Components/Controls/Checkbox';

type Props = {
  value: Header,
  onChange: Function,
};

class HeaderEditor extends React.Component<Props> {
  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.props.onChange({
      ...this.props.value,
      showLogotype: event.currentTarget.checked,
    });
  };

  render() {
    const value = this.props.value;
    return (
      <div>
        <Checkbox kind="toggle" checked={value.showLogotype} onChange={this.handleChange}>
          {t('Show your logo')}
        </Checkbox>
      </div>
    );
  }
}

export default HeaderEditor;
