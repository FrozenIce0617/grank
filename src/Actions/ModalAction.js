export const SHOW_MODAL = 'show_modal';
export const HIDE_MODAL = 'hide_modal';

export function showModal(config) {
  return {
    type: SHOW_MODAL,
    payload: config || {},
  };
}

export function hideModal() {
  return {
    type: HIDE_MODAL,
  };
}
