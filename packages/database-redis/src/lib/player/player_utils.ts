import { ServerPlayer, LogLevel, asRedisItem } from '@shared';
import { log } from 'console';
import { RedisClientType } from 'redis';

const addPlayer = async (player: ServerPlayer, worldName: string, redisClient: RedisClientType) => {
  await redisClient.json.arrAppend('worlds', `$.${worldName}.players`, player as never);
};

const removePlayer = async (player_id: string, worldName: string, redisClient: RedisClientType) => {
  log(`Removing player ${player_id} from world ${worldName}`, LogLevel.INFO);
  // Remove player from redis world
  await redisClient.json.del('worlds', `$.${worldName}.players[?(@.id=='${player_id}')]`);
};
const getPlayer = async (playerId: string, redisClient: RedisClientType): Promise<ServerPlayer | null> => {
  const player = (await redisClient.json.get('worlds', {
    path: `$.*.players[?(@.id=='${playerId}')]`,
  })) as unknown as ServerPlayer[];
  if (!player || !player[0]) return null;
  return player[0];
};

const getPlayerInWorld = async (playerId: string, worldId: string, redisClient: RedisClientType): Promise<ServerPlayer | null> => {
  const player = (await redisClient.json.get('worlds', {
    path: `$.${worldId}.players[?(@.id=='${playerId}')]`,
  })) as unknown as ServerPlayer[];
  if (!player || !player[0]) return null;
  return player[0];
};
const getPlayerBySocketId = async (socketId: string, redisClient: RedisClientType): Promise<ServerPlayer | null> => {
  const player = (await redisClient.json.get('worlds', {
    path: `$.*.players[?(@.socket_id=='${socketId}')]`,
  })) as unknown as ServerPlayer[];
  if (!player || !player.length) return null;
  return player[0];
};
const savePlayer = async (player: ServerPlayer, redisClient: RedisClientType) => {
  await redisClient.json.set('worlds', `$.${player.world_id}.players[?(@.id=='${player.id}')]`, asRedisItem(player));
};
export const RedisPlayerUtils = {
  addPlayer,
  removePlayer,
  getPlayer,
  getPlayerBySocketId,
  savePlayer,
  getPlayerInWorld,
};
