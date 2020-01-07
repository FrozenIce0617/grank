import { showModal } from 'Actions/ModalAction';
import { store } from 'Store';

export const showDemoContentModal = () => {
  store.dispatch(
    showModal({
      modalType: 'UpsellModal',
    }),
  );
};
