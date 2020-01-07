// @flow
import * as React from 'react';
import './report-pagebreak.scss';

type Props = {
  onLoad: Function,
};

class Pagebreak extends React.Component<Props> {
  render() {
    this.props.onLoad();
    return <div className="report-pagebreak" />;
  }
}

export default Pagebreak;
