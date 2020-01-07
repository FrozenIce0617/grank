// @flow
import * as React from 'react';
import './report-headline.scss';
import ElementsHeader from 'Pages/Report/ElementHeader';

type Settings = {
  headline: { value: string },
};

type Props = {
  onLoad: Function,
  settings: Settings,
};

class Headline extends React.Component<Props> {
  render() {
    const { settings } = this.props;
    this.props.onLoad();
    return <ElementsHeader title={settings.headline && settings.headline.value} />;
  }
}

export default Headline;
