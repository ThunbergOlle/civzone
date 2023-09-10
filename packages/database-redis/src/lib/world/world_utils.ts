import { RedisWorld, ServerPlayer, asRedisItem } from '@shared';
import { RedisClientType } from 'redis';
import { World as PostgresWorldEntity } from '@virtcon2/database-postgres';

const getWorld = async (id: string, redisClient: RedisClientType) => {
  const world = (await redisClient.json.get(`worlds`, {
    path: `$.${id}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any as RedisWorld[];
  if (!world || !world[0]) return null;
  return world[0];
};
const registerWorld = async (world: RedisWorld, redisClient: RedisClientType) => {
  await redisClient.json.set('worlds', `$.${world.id}`, asRedisItem(world));
  return world;
};

const unregisterWorld = async (id: string, redisClient: RedisClientType) => {
  await redisClient.json.del('worlds', `$.${id}`);
};

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
export const RedisWorldUtils = {
  getWorld,
  registerWorld,
  unregisterWorld,
  loadWorld,
};
