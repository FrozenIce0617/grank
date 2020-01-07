// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';

type Props = {
  data: { loading: boolean, refetch: Function },
  registerOverviewComponent: Function,
  overviewComponentLoaded: Function,
};

type InjectedProps = {
  loading: boolean,
};

type State = {
  isSilentUpdate: boolean,
};

function overviewComponent(id: string) {
  return function overviewComponentWrap<Config: {}>(
    Component: React.ComponentType<Config>,
  ): React.ComponentType<Config & InjectedProps> {
    return connect(
      null,
      { registerOverviewComponent, overviewComponentLoaded },
    )(
      class OverviewComponent extends React.Component<Props & Config, State> {
        _subHandle: SubscriptionHandle;

        state = {
          isSilentUpdate: false,
        };

        componentDidMount() {
          this.props.registerOverviewComponent(id);
          this._subHandle = subscribeToDomain(this.handleUpdate);
        }

        componentDidUpdate(prevProps: Props) {
          if (prevProps.data.loading !== this.props.data.loading && !this.props.data.loading) {
            this.props.overviewComponentLoaded(id);
          }
        }

        componentWillUnmount() {
          this._subHandle.unsubscribe();
        }

        handleUpdateComplete = () => {
          this.setState({
            isSilentUpdate: false,
          });
        };

        handleUpdate = () => {
          this.setState({
            isSilentUpdate: true,
          });
          this.props.data.refetch().then(this.handleUpdateComplete, this.handleUpdateComplete);
        };

        render() {
          return (
            <Component
              loading={this.props.data.loading && !this.state.isSilentUpdate}
              {...this.props}
            />
          );
        }
      },
    );
  };
}

export default overviewComponent;
