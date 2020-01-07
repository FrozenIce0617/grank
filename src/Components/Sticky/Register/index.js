//@flow
import { values, get, noop, set, merge } from 'lodash';

type StickTo = {
  topItem: string,
  topContainer: string,
};

type ItemType = {
  handler: Function,
  top: number,
  left: number,
  containerLeft: number,
  height: number,
  width: number,
  stickyHeight: number,
  stickyWidth: number,
  stickTo?: StickTo,
};

type ItemsType = {
  [itemName: string]: ItemType,
};

type ContainerItemsType = {
  [containerName: string]: ItemsType,
};

type StickyRegisterType = {
  items: ContainerItemsType,
  getListeners: Function,
  getTopStackHeight: Function,
  get: Function,
  update: Function,
  add: Function,
  remove: Function,
};

// Register of the sticky components data
// Using instead of global redux store for the sake of performance (we don't re-render on every change)
export const StickyRegister: StickyRegisterType = {
  items: {},
  getListeners(containerName: string) {
    return values(this.items[containerName]).map(
      item => (item && item.handler ? item.handler : noop),
    );
  },
  get(containerName: string, itemName: string) {
    return get(this.items, [containerName, itemName]);
  },
  getTopStackHeight(containerName: string, itemName: string, shouldReturnHeight?: boolean) {
    const item = this.get(containerName, itemName);
    if (!item) {
      return 0;
    }

    const { stickTo: { topItem, topContainer } = {}, top = 0, stickyHeight = 0 } = item;

    let height = top;
    if (topContainer && topItem) {
      height += this.getTopStackHeight(topContainer, topItem, true);
    }

    if (shouldReturnHeight) {
      height += stickyHeight;
    }
    return height;
  },
  update(containerName: string, itemName: string, item: ItemType) {
    merge(this.get(containerName, itemName), item);
  },
  add(containerName: string, itemName: string, handler: Function, stickTo: StickTo) {
    set(this.items, [containerName, itemName, 'handler'], handler);
    set(this.items, [containerName, itemName, 'stickTo'], stickTo);
  },
  remove(containerName: string, itemName: string) {
    set(this.items, [containerName, itemName], null);
  },
};
