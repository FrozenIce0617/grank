//@flow
import * as React from 'react';
import { toast as reactToast } from 'react-toastify';
import DefaultToast from './DefaultToast';
import StatusToast from './StatusToast';
import './toasts.scss';

const toast = Object.assign(
  (content: React.Node) => reactToast(<DefaultToast>{content}</DefaultToast>),
  {
    success: (content: React.Node) =>
      reactToast.success(<StatusToast status="success">{content}</StatusToast>),
    error: (content: React.Node) =>
      reactToast.error(<StatusToast status="error">{content}</StatusToast>),
  },
);

export default toast;
