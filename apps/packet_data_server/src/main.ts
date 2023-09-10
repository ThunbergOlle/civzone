import { DeconstructRedisPacket, packet_origin_prefixes } from '@virtcon2/network-packet';
import dotenv from 'dotenv';
import { cwd } from 'process';
import 'reflect-metadata';

import { LogApp, LogLevel, log, setApp } from '@shared';
import { AppDataSource } from '@virtcon2/database-postgres';
import { RedisWorldUtils } from '@virtcon2/database-redis';
import { RedisClientType, createClient as createRedisClient } from 'redis';
import { packet_handler } from './packet/packet_handler';
import { TickService } from './services/tick_service';

setApp(LogApp.PACKET_DATA_SERVER);
dotenv.config({ path: `${cwd()}/.env` });

const worldName = process.env.WORLD_NAME;

log(`Starting packet data server for world "${worldName}"...`, LogLevel.INFO);

AppDataSource.initialize()
  .then(() => log('Database connected.', LogLevel.INFO))
  .then(() => RedisWorldUtils.loadWorld(worldName))
  .then(async (world) => {
    await RedisWorldUtils.registerWorld(world, redisPubClient);
    log(`World ${worldName} loaded.`, LogLevel.INFO, LogApp.PACKET_DATA_SERVER);
  });

const redisSubClient = createRedisClient() as RedisClientType;
const redisPubClient = createRedisClient() as RedisClientType;

redisPubClient.on('error', (err) => log(err, LogLevel.ERROR));
redisPubClient.connect();

redisSubClient.on('error', (err) => log(err, LogLevel.ERROR));
redisSubClient.connect();

redisSubClient.pSubscribe(packet_origin_prefixes.router_server + worldName, (message, channel) => {
  const deconstructed_packet = DeconstructRedisPacket<unknown>(message, channel);
  packet_handler(deconstructed_packet, redisPubClient);
});

// start tick service
const tickService = new TickService();
tickService.setRedisClient(redisPubClient);
tickService.start(worldName);

async function exit() {
  if (process.env.NODE_ENV === 'production') {
    RedisWorldUtils.unregisterWorld(worldName, redisPubClient);
  }

  redisSubClient.quit();
  redisPubClient.quit();

  log('Redis clients closed and worlds cleaned up.', LogLevel.INFO);
  process.exit(0);
}
// on sigint, close the redis clients
process.on('SIGTERM', exit);
process.on('SIGINT', exit);
