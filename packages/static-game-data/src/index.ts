import item_coal from './lib/items/db/item_coal';
import item_iron from './lib/items/db/item_iron';
import item_stick from './lib/items/db/item_stick';
import item_stone from './lib/items/db/item_stone';
import item_wood from './lib/items/db/item_wood';
import { DBItemName } from './lib/items/item_type';
import { ResourceNames, Resources } from './lib/resources/resources_type';

/* Items */
export * from './lib/items/db/item_stick';
export * from './lib/items/db/item_wood';
export * from './lib/items/item_type';

export const all_db_items = [item_wood, item_stick, item_stone, item_coal, item_iron];
export const all_spawnable_db_items = all_db_items.filter((i) => i.spawnSettings);
export const get_item_by_id = (id: number) => {
  return all_db_items.find((item) => item.id === id);
};

/* Resources */
export * from './lib/resources/resources_type';

export const get_resource_by_item_name = (itemName: DBItemName): ResourceNames | null => {
  return Object.keys(Resources).find((resourceName) => Resources[resourceName].item === itemName) as ResourceNames;
};
