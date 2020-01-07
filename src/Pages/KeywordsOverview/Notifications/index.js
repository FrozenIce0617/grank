// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import LabelWithHelp from 'Components/LabelWithHelp';
import * as Actions from 'Pages/Layout/ActionsMenu/Actions';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';
import NotificationsInfiniteTable from 'Components/InfiniteTable/Tables/NotificationsInfiniteTable';

import './notifications.scss';
import { t } from 'Utilities/i18n/index';

type Props = {
  domainId: string | null,

  isLoaded: boolean,
  registerOverviewComponent: Function,
  overviewComponentLoaded: Function,
};

const componentId = 'Notifications';

class Notifications extends Component<Props> {
  _id: string = componentId;
  _table = React.createRef();

  componentDidMount() {
    this.props.registerOverviewComponent(this._id);
  }

  handleLoad = () => {
    if (!this.props.isLoaded) {
      this.props.overviewComponentLoaded(this._id);
    }
  };

  getInfiniteTableInstance = () =>
    this._table.current && this._table.current.getWrappedInstance().getWrappedInstance();

  showTableSettings = () => {
    const instance = this.getInfiniteTableInstance();
    return instance && instance.showSettings();
  };

  render() {
    const { domainId } = this.props;
    return (
      <div className="notifications">
        <LabelWithHelp
          helpTitle={t('Notifications')}
          help={t(
            'Automatic notifications are generated for big or significant movements on star marked keywords. A keyword moving from rank 2 to 1 is an important change, and will generate a notification. A move from 75 to 150 is not considered a significant change and you will not receive a notification.',
          )}
        >
          {t('Notifications')}
        </LabelWithHelp>
        {domainId !== null && (
          <div className="table-actions">
            <Actions.SettingsAction onClick={this.showTableSettings} />
          </div>
        )}
        <NotificationsInfiniteTable onLoad={this.handleLoad} ref={this._table} />
      </div>
    );
  }
}

export default compose(
  connect(
    ({ overviewPage }) => {
      return {
        isLoaded: overviewPage[componentId] ? overviewPage[componentId].loaded : false,
      };
    },
    { registerOverviewComponent, overviewComponentLoaded },
  ),
)(Notifications);
