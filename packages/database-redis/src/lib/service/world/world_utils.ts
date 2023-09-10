import { RedisWorld, ServerPlayer, asRedisItem } from '@shared';
import { RedisClientType } from 'redis';
import * as socketio from 'socket.io';

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

const addPlayer = async (player: ServerPlayer, worldName: string, socket: socketio.Socket, redisClient: RedisClientType) => {
  await redisClient.json.arrAppend('worlds', `$.${worldName}.players`, player as never);
  socket.join(worldName);
};

const removePlayer = async (player: ServerPlayer, worldName: string, socket: socketio.Socket, redisClient: RedisClientType) => {
  console.log(`Removing player ${player.id} from world ${worldName}`);
  // Remove player from redis world
  await redisClient.json.del('worlds', `$.${worldName}.players[?(@.id=='${player.id}')]`);
  socket.broadcast.to(worldName).emit('playerLeave', player);
  // Remove player from socket.io room
  socket.leave(worldName);
};

const getPlayer = async (playerId: string, redisClient: RedisClientType): Promise<ServerPlayer | null> => {
  const player = (await redisClient.json.get('worlds', {
    path: `$.*.players[?(@.id=='${playerId}')]`,
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
export const World = {
  getWorld,
  registerWorld,
  unregisterWorld,
  addPlayer,
  removePlayer,
  getPlayer,
  getPlayerBySocketId,
  savePlayer,
};
