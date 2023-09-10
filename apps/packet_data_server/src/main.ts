import { DeconstructRedisPacket, NetworkPacketData, packet_origin_prefixes } from '@virtcon2/network-packet';
import dotenv from 'dotenv';
import { cwd } from 'process';
import 'reflect-metadata';

import { LogApp, LogLevel, log, setApp } from '@shared';
import { AppDataSource } from '@virtcon2/database-postgres';
import { RedisClientType, createClient as createRedisClient } from 'redis';
import { async_packet_handler, sync_packet_handler } from './packet/packet_handler';
import { TickService } from './services/tick_service';
import { World, worldService } from '@virtcon2/database-redis';

setApp(LogApp.PACKET_DATA_SERVER);
dotenv.config({ path: `${cwd()}/.env` });

const worldName = process.env.WORLD_NAME;

log(`Starting packet data server for world "${worldName}"...`, LogLevel.INFO);

AppDataSource.initialize()
  .then(() => log('Database connected.', LogLevel.INFO))
  .then(() => worldService.loadWorld(worldName))
  .then(async (world) => {
    await World.registerWorld(world, redisPubClient);
    log(`World ${worldName} loaded.`, LogLevel.INFO, LogApp.PACKET_DATA_SERVER);
  });

const redisSubClient = createRedisClient() as RedisClientType;
const redisPubClient = createRedisClient() as RedisClientType;

redisPubClient.on('error', (err) => log(err, LogLevel.ERROR));
redisPubClient.connect();

redisSubClient.on('error', (err) => log(err, LogLevel.ERROR));
redisSubClient.connect();

// Packet queue for handling packets in order.
const packet_queue: NetworkPacketData<unknown>[] = [];

redisSubClient.pSubscribe(packet_origin_prefixes.router_server + worldName, (message, channel) => {
  const deconstructed_packet = DeconstructRedisPacket<unknown>(message, channel);
  async_packet_handler(deconstructed_packet, redisPubClient, packet_queue);
});

// start tick service
const tickService = new TickService();
tickService.setRedisClient(redisPubClient);
tickService.start(worldName);

// Handle the packet queue.
const handle_queue = async () => {
  if (packet_queue.length) {
    const packet = packet_queue.shift();
    await sync_packet_handler(packet, redisPubClient);
  }

  setTimeout(handle_queue, 0);
};
handle_queue();

async function exit() {
  redisSubClient.quit();
  redisPubClient.quit();

  log('Redis clients closed and worlds cleaned up.', LogLevel.INFO);
  process.exit(0);
}
// on sigint, close the redis clients
process.on('SIGTERM', exit);
process.on('SIGINT', exit);
