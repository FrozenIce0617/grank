// @flow
import * as React from 'react';
import './report-custom-text.scss';

type Settings = {
  text: { value: string },
};

type Props = {
  onLoad: Function,
  settings: Settings,
};

class CustomText extends React.Component<Props> {
  render() {
    const { settings } = this.props;
    this.props.onLoad();
    return (
      <div className="report-custom-text">
        <p dangerouslySetInnerHTML={settings.text.value} />
      </div>
    );
  }
}

export default CustomText;
