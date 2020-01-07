// @flow
import gql from 'graphql-tag';
import {
  type SubscriptionCallback,
  type SubscriptionDataType,
  type SubscriptionActionType,
  type SubscriptionObjectType,
  KEYWORD,
  KEYWORDS,
  USER,
  GROUP,
  DOMAIN,
  MESSAGE,
  ORGANIZATION,
  SCHEDULED_REPORT,
  GENERATED_REPORT,
  RUNNING_TASK,
  NO_TOPIC,
} from 'Types/Subscription';
import { toArray } from 'Utilities/underdash';
import { isEmpty } from 'lodash';
import Toast from 'Components/Toast';

const initSubscription = gql`
  subscription generic_subscribe {
    liveChanges {
      id
      obj
      action
    }
  }
`;

type SubscribeToTopic = {
  topic?: SubscriptionObjectType | SubscriptionObjectType[],
  id?: string | string[],
  action?: SubscriptionActionType | SubscriptionActionType[],
  toast?: string,
  cb: SubscriptionCallback,
};

type SubscriptionItem = {
  ids: string[],
  actions: SubscriptionActionType[],
  toast?: string,
  cb: SubscriptionCallback,
};

export type SubscriptionHandle = {
  unsubscribe: Function,
};

type SubscriptionsHolder = {
  [topic: SubscriptionObjectType]: SubscriptionItem[],
};

/*
 * Subscriptions holder to subscribe only once and just filter results
 * in apollo subscription callback
 */
const subscriptions: SubscriptionsHolder = {};

const transformSubProps = (topic, id, action) => ({
  topic: (Array.isArray(topic) ? topic[0] : topic) || NO_TOPIC,
  ids: toArray(id || []),
  actions: toArray(action || []),
});

const addSubToTopic = ({ topic, id, action, cb, toast }: SubscribeToTopic) => {
  const { topic: topicItem, ids, actions } = transformSubProps(topic, id, action);

  const newSubs = subscriptions[topicItem] || [];
  newSubs.push({ ids, actions, cb, toast });
  subscriptions[topicItem] = newSubs;
};

const removeSubFromTopic = ({ topic, id, action, cb, toast }: SubscribeToTopic) => {
  const { topic: topicItem, ids, actions } = transformSubProps(topic, id, action);

  subscriptions[topicItem] = (subscriptions[topicItem] || []).reduce((acc, item) => {
    // don't remove sub from topic as it has different callback
    if (item.cb !== cb) {
      acc.push(item);
      return acc;
    }

    // remove topic for any action and ids
    if (isEmpty(actions) && isEmpty(ids)) {
      return acc;
    }

    // remove action and ids from sub
    const newActions = item.actions.filter(act => !actions.includes(act));
    const newIds = item.ids.filter(idItem => !ids.includes(idItem));

    // if we have empty one, remove it
    if (isEmpty(newActions) && isEmpty(newIds)) {
      return acc;
    }

    // push the rest action and ids to sub
    acc.push({
      actions: newActions,
      ids: newIds,
      toast,
      cb,
    });
    return acc;
  }, []);
};

const unsubscribeTopic = (...items: SubscribeToTopic[]) => {
  items.forEach(item => {
    toArray(item.topic).forEach(topic => {
      removeSubFromTopic({ ...item, topic });
    });
  });
};

/**
 * Subscribe to topic to filter actions, ids + toast message definition
 * This is custom method so if you need to subscribe and do callback on every action and id
 * please use facade methods
 *
 * @returns array of handles to unsubscribe
 */
export const subscribeToTopic = (...items: SubscribeToTopic[]): SubscriptionHandle[] => {
  items.forEach(item => {
    toArray(item.topic).forEach(topic => {
      addSubToTopic({ ...item, topic });
    });
  });
  return items.map(item => ({
    unsubscribe: () => unsubscribeTopic(item),
  }));
};

/*
 * Subscribe to WS events (should be used just once)
 */
export const subscribeWS = apolloClient =>
  apolloClient
    .subscribe({ query: initSubscription })
    .subscribe(({ data }: SubscriptionDataType) => {
      const topic = data.obj || NO_TOPIC;
      if (subscriptions[topic]) {
        subscriptions[topic].forEach((sub: SubscriptionItem) => {
          if (
            (isEmpty(sub.ids) && isEmpty(sub.actions)) ||
            (!isEmpty(sub.ids) && sub.ids.includes(data.id)) ||
            (!isEmpty(sub.actions) && sub.actions.includes(data.action))
          ) {
            sub.cb({ data });
            sub.toast && Toast.success(sub.toast);
            console.log(`${data.obj} '${data.id}' ${data.action}`);
          }
        });
      }
    });

const makeSubscribeTo = topic => (cb: SubscriptionCallback) => subscribeToTopic({ topic, cb })[0];

// Facade methods
export const subscribeToKeyword = makeSubscribeTo(KEYWORD);
export const subscribeToKeywords = makeSubscribeTo(KEYWORDS);
export const subscribeToUser = makeSubscribeTo(USER);
export const subscribeToGroup = makeSubscribeTo(GROUP);
export const subscribeToDomain = makeSubscribeTo(DOMAIN);
export const subscribeToMessage = makeSubscribeTo(MESSAGE);
export const subscribeToOrganization = makeSubscribeTo(ORGANIZATION);
export const subscribeToScheduledReport = makeSubscribeTo(SCHEDULED_REPORT);
export const subscribeToGeneratedReport = makeSubscribeTo(GENERATED_REPORT);
export const subscribeToRunningTask = makeSubscribeTo(RUNNING_TASK);

export * from 'Types/Subscription';
import * as Types from 'Types/Subscription';

export default {
  ...Types,
};
