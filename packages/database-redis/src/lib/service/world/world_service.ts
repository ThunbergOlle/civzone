import { RedisWorld } from '@shared';
import { World as PostgresWorldEntity } from '@virtcon2/database-postgres';

const loadWorld = async (world_id: string): Promise<RedisWorld> => {
  const world = await PostgresWorldEntity.findOne({
    where: { id: world_id },
  });
  if (!world) {
    throw new Error(`World ${world_id} does not exist.`);
  }

  return {
    id: world.id,
    players: [],
    height_map: PostgresWorldEntity.Get2DWorldMap(world.seed),
  } as RedisWorld;
};

export const worldService = {
  loadWorld,
};
