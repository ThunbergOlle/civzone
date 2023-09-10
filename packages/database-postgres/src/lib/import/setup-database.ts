import { all_db_items } from '@virtcon2/static-game-data';
import { Item } from '../entity/item/Item';

export async function setupDatabase() {
  setupItems();
}

const setupItems = async () => {
  /* Import items */
  for (const item of all_db_items) {
    await Item.upsert(item as unknown as Item, {
      upsertType: 'on-conflict-do-update',
      conflictPaths: ['id'],
    });
  }
};
