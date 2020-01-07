import { TableIDs } from 'Types/Table';

export const StickyIDs = {
  items: {
    PAGINATION: 'pagination',
    HEADER: 'header',
    TABLE_HEADER: 'table_header',
    TABLE_FOOTER: 'table_footer',
  },
  containers: {
    DASHBOARD: 'dashboard',
    ...TableIDs,
  },
};
