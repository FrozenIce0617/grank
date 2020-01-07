import { SHOW_MODAL, HIDE_MODAL } from '../Actions/ModalAction';

const initialState = {
  modalType: null,
  modalTheme: 'dark',
  modalProps: {},
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SHOW_MODAL:
      return { ...state, ...action.payload };
    case HIDE_MODAL:
      return {
        ...initialState,
        modalTheme: state.modalTheme,
      };
    default:
      return state;
  }
}
