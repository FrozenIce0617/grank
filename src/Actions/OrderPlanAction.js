export const SET_VAT_STATUS = 'set_vat_status';

export function setVatStatus(status) {
  return {
    type: SET_VAT_STATUS,
    payload: status,
  };
}
