export enum DBItemRarity {
  common = 'common',
  uncommon = 'uncommon',
  rare = 'rare',
  epic = 'epic',
  legendary = 'legendary',
}
export enum DBItemName {
  WOOD = 'wood',
  WOOD_BIG = 'wood_big',
  STICK = 'stick',
  STONE = 'stone',
  SAND = 'sand',
  GLASS = 'glass',
  COAL = 'coal',
  IRON = 'iron',
}
export interface DBItemSpawnSettings {
  minHeight: number;
  maxHeight: number;
  chance: number;
}
export interface DBItem {
  id: number;
  display_name: string;
  name: DBItemName;
  description: string;
  icon: string;
  stack_size: number;
  rarity: DBItemRarity;
  spawnSettings?: DBItemSpawnSettings;
  animations?: {
    idle: number[];
  };
}
