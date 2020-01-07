// @flow
import React, { Component } from 'react';
import NotificationSystem from 'react-notification-system';
import { withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import { t } from 'Utilities/i18n';
import gql from 'graphql-tag';
import isEmpty from 'lodash/isEmpty';
import difference from 'lodash/difference';
import LocalStorage from 'Utilities/storage';

// components
import RadialProgress from 'Components/RadialProgress';
import ClockIcon from 'icons/clock-wait.svg?inline';

// utils
import { subscribeToRunningTask } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';

import './side-notifications.scss';

const TASK_PENDING = 'PENDING';
const TASK_PROGRESS = 'PROGRESS';

type TaskProgress = {
  current: number,
  total: number,
};

type Task = {
  id: string,
  description: string,
  lastKnownState: typeof TASK_PENDING | typeof TASK_PROGRESS,
  progress: TaskProgress,
};

type ClosedTasks = { [id: string]: boolean };

type Props = {
  client: Object,
  pollInterval: number,
  initialTasks: Array<Task>,
};

type State = {
  tasks: Map<string, Task>,
  closedTasks: ClosedTasks,
};

const tasksQuery = gql`
  query sideNotifications_getTasks {
    user {
      id
      runningTasks {
        id
        description
        lastKnownState
        progress {
          current
          total
        }
      }
    }
  }
`;

const closedUsersTasksKey = 'tasks:users:closed';

const USER_TASK = 'user_task';
const tasksObj = tasks => Array.from(tasks.keys());

class SideNotifications extends Component<Props, State> {
  _notificationSystem: null;
  _pollIntervalHandle: IntervalID | null;
  _runningTaskSubHandle: SubscriptionHandle;

  static defaultProps = {
    pollInterval: 30000,
  };

  state = {
    tasks: new Map(),
    closedTasks: {},
  };

  UNSAFE_componentWillMount() {
    let closedTasks;
    try {
      closedTasks = JSON.parse(LocalStorage.get(closedUsersTasksKey));
    } catch (ignore) {
      // ignore closed tasks
    }

    // eslint-disable-next-line react/no-did-mount-set-state
    closedTasks && this.setState({ closedTasks });

    this._runningTaskSubHandle = subscribeToRunningTask(this.queryTasks);
  }

  componentDidMount() {
    const { initialTasks } = this.props;

    if (initialTasks && initialTasks.length) this.handleQueriedTasks(initialTasks);

    // Remove finished tasks from Local Storage
    let newClosedTasks = {};
    initialTasks &&
      initialTasks.forEach(el => {
        if (this.state.closedTasks.hasOwnProperty(el.id)) {
          newClosedTasks = {
            ...newClosedTasks,
            [el.id]: true,
          };
        }
      });

    LocalStorage.save(closedUsersTasksKey, newClosedTasks);
    this.setState({ closedTasks: newClosedTasks });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { tasks } = this.state;

    if (!isEmpty(tasks) && !this._pollIntervalHandle) {
      this._pollIntervalHandle = setInterval(this.queryTasks, this.props.pollInterval);
    } else if (isEmpty(tasks) && this._pollIntervalHandle) {
      clearInterval(this._pollIntervalHandle);
      !this.state.closedTasks && LocalStorage.remove(closedUsersTasksKey);
      this._pollIntervalHandle = null;
    }
  }

  componentWillUnmount() {
    this._runningTaskSubHandle.unsubscribe();
  }

  addNotification = props =>
    this._notificationSystem &&
    this.makeNotification(this._notificationSystem.addNotification, props);

  editNotification = props =>
    this._notificationSystem &&
    this.makeNotification(this._notificationSystem.editNotification, props);

  makeNotification = (action, { id, title, description, progress, level, type, onRemove }: any) => {
    const uid = this.getNotificationUid({ id, type });
    const props = {
      title,
      message: description,
      level: level || 'info',
      uid,
      autoDismiss: 0,
      position: 'bl',
      children: (
        <div className="radial-progress-container">
          {progress !== null ? (
            <RadialProgress key={1} progress={progress} />
          ) : (
            <RadialProgress key={2} progress={progress} /> // <ClockIcon style={{ fill: 'white', width: 32, height: 32 }} />
          )}
        </div>
      ),
    };

    if (this._notificationSystem) {
      if (action === this._notificationSystem.addNotification) {
        return action({
          ...props,
          onRemove: () => onRemove(id),
        });
      }

      if (action === this._notificationSystem.editNotification) {
        return action(uid, props);
      }
    }
  };

  getNotificationUid = ({ id, type }) => `${type}-${id}`;

  removeNotification = ({ id, type }) => {
    this._notificationSystem &&
      this._notificationSystem.removeNotification(this.getNotificationUid({ id, type }));
  };

  handleCloseTask = id => {
    const { closedTasks } = this.state;
    const curTaskKeys = tasksObj(this.state.tasks);

    if (curTaskKeys.includes(id)) {
      const newClosedTasks = {
        ...closedTasks,
        [id]: true,
      };

      LocalStorage.save(closedUsersTasksKey, newClosedTasks);
      this.setState({ closedTasks: newClosedTasks });
    }
  };

  handleCloseAll = () => {
    const { closedTasks } = this.state;
    const curTaskKeys = tasksObj(this.state.tasks);
    let newClosedTasks = closedTasks;

    this.state.tasks.forEach((value, key) => {
      if (curTaskKeys.includes(key)) {
        newClosedTasks = {
          ...newClosedTasks,
          [key]: true,
        };
      }
    });

    LocalStorage.save(closedUsersTasksKey, newClosedTasks);
    this.setState({ closedTasks: newClosedTasks });
  };

  handleTask = (task: Task) => {
    const { tasks } = this.state;
    const { current, total } = task.progress;

    const shouldEdit = tasks.has(task.id);
    const noProgress = current === 0 && total === 0;

    let progress = 0;
    if (noProgress) {
      progress = null;
    } else if (current === total) {
      progress = 100;
    } else {
      progress = ((current * 100) / total).toFixed(1);
    }

    const notificationProps = {
      id: task.id,
      title: task.description,
      description: noProgress ? 'Processing...' : t('%s%% completed', progress),
      type: USER_TASK,
      progress,
      onRemove: this.handleCloseTask,
    };

    shouldEdit ? this.editNotification(notificationProps) : this.addNotification(notificationProps);
  };

  handleQueriedTasks = (runningTasks: Array<Task>) => {
    const { tasks, closedTasks } = this.state;

    const displayedTasks = runningTasks.reduce((acc, task) => {
      if (!closedTasks[task.id]) {
        acc.set(task.id, task);
      }
      return acc;
    }, new Map());

    displayedTasks.forEach(task => {
      this.handleTask(task);
    });

    // here we hide the tasks that the user has choosen to remove
    tasks.forEach(task => {
      const shouldShowtask = displayedTasks.get(task.id);
      if (!shouldShowtask) {
        this.removeNotification({ id: task.id, type: USER_TASK });
      }
    });

    this.setState({
      tasks: displayedTasks,
    });
  };

  queryTasks = () => {
    const { client } = this.props;
    return client
      .query({
        query: tasksQuery,
        fetchPolicy: 'network-only',
      })
      .then(({ data: { user: { runningTasks } } }) => this.handleQueriedTasks(runningTasks));
  };

  render() {
    return (
      <div className="side-notifications">
        {this.state.tasks &&
          this.state.tasks.size > 0 && (
            <button
              className="btn notifications-close-all"
              onClick={this.handleCloseAll}
              style={{ bottom: this.state.tasks.size >= 3 ? 240 : 65 * this.state.tasks.size + 65 }}
            >
              {t('Close all')}
            </button>
          )}

        <NotificationSystem
          ref={ref => (this._notificationSystem = ref)}
          style={{
            Containers: {
              DefaultStyle: {
                width: 380,
                bottom: 40,
                left: 90,
              },
            },
            NotificationItem: {
              DefaultStyle: {
                // borderTop: '2px solid white',
                borderTop: 'none',
                margin: '10px 0 0 0',
                backgroundColor: 'rgba(248, 149, 55, 1.93)',
                color: 'white',
                fontSize: '14px',
                boxShadow: '0px 3px 60px -10px #999',
                cursor: 'pointer',
                height: 'auto',
                minHeight: 80,
              },
            },
            Title: {
              DefaultStyle: {
                color: 'white',
                marginLeft: 50,
                marginRight: 20,
                fontSize: '16px',
              },
            },
            MessageWrapper: {
              DefaultStyle: {
                marginLeft: 50,
              },
            },
            Dismiss: {
              DefaultStyle: {
                top: 0,
                right: 0,
                backgroundColor: 'transparent',
                fontSize: 25,
                lineHeight: 0.8,
                padding: 5,
                margin: 5,
                boxSizing: 'content-box',
                transition: '.3s',
              },
            },
          }}
        />
      </div>
    );
  }
}

export default compose(
  withApollo,
  connect(
    ({ user }) => ({ initialTasks: user.runningTasks }),
    null,
  ),
)(SideNotifications);
