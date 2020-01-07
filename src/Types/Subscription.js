// @flow

export const NO_TOPIC = 'NO_TOPIC';
export const KEYWORD = 'KEYWORD';
export const KEYWORDS = 'KEYWORDS';
export const USER = 'USER';
export const GROUP = 'GROUP';
export const DOMAIN = 'DOMAIN';
export const MESSAGE = 'MESSAGE';
export const ORGANIZATION = 'ORGANIZATION';
export const SCHEDULED_REPORT = 'SCHEDULED_REPORT';
export const GENERATED_REPORT = 'GENERATED_REPORT';
export const RUNNING_TASK = 'RUNNING_TASK';

export type SubscriptionObjectType =
  | typeof KEYWORD
  | typeof KEYWORDS
  | typeof USER
  | typeof GROUP
  | typeof DOMAIN
  | typeof MESSAGE
  | typeof ORGANIZATION
  | typeof SCHEDULED_REPORT
  | typeof GENERATED_REPORT
  | typeof RUNNING_TASK;

export const CREATED = 'CREATED';
export const UPDATED = 'UPDATED';
export const DELETED = 'DELETED';
export const NOCHANGE = 'NOCHANGE';
export const CONNECTED = 'CONNECTED';
export const FORCE_RELOAD = 'FORCE_RELOAD';

export type SubscriptionActionType =
  | typeof CREATED
  | typeof UPDATED
  | typeof DELETED
  | typeof NOCHANGE
  | typeof CONNECTED;

export type SubscriptionDataGeneratedReportOtherType = {
  scheduled_report: number,
  url: string,
  report_type: number,
};

export type SubscriptionDataOtherType = SubscriptionDataGeneratedReportOtherType;

export type SubscriptionDataType = {
  data: {
    obj: SubscriptionObjectType,
    action: SubscriptionActionType,
    id: string,
    other?: SubscriptionDataOtherType,
  },
};

export type SubscriptionCallback = SubscriptionDataType => void;
