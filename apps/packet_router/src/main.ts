import cors from 'cors';

import { LogApp, LogLevel, log } from '@shared';
import { World } from '@virtcon2/database-redis';
import {
  DeconstructRedisPacket,
  NetworkPacketData,
  PacketType,
  RedisPacketBuilder,
  RequestJoinPacketData,
  packet_origin_prefixes,
} from '@virtcon2/network-packet';
import dotenv from 'dotenv';
import * as express from 'express';
import * as http from 'http';
import { cwd } from 'process';
import { RedisClientType, createClient, createClient as createRedisClient } from 'redis';
import * as socketio from 'socket.io';

dotenv.config({ path: `${cwd()}/.env` });

const redisClient = createRedisClient() as RedisClientType;

redisClient.on('error', (err) => console.log('Redis Client Error', err));

/* Temporary code, will be moved later. */
redisClient.connect().then(async () => {
  await redisClient.json.set('worlds', '$', {});
});

const redisPubSub = createClient() as RedisClientType;
redisPubSub.on('error', (err) => log(err, LogLevel.ERROR, LogApp.SERVER));
redisPubSub.connect();

const app = express.default();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (_req, res) => {
  res.send({ uptime: process.uptime() });
});

const server = http.createServer(app);
const io = new socketio.Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('disconnect', async () => {
    const player = await World.getPlayerBySocketId(socket.id, redisClient);
    if (!player) return;
    await new RedisPacketBuilder()
      .sender(player)
      .target(player.world_id, 'world')
      .packet_type(PacketType.DISCONNECT)
      .data({ id: player.id })
      .build()
      .publish_redis('overworld', redisPubSub);
  });

  socket.on('packet', async (packet: string) => {
    const sender = await World.getPlayerBySocketId(socket.id, redisClient);
    const packetJson = JSON.parse(packet) as NetworkPacketData<unknown>;
    packetJson.world_id = packetJson.world_id.replace(/\s/g, '_'); // replace all spaces in world_id with underscores
    if (packetJson.packet_type === PacketType.REQUEST_JOIN) {
      packetJson.data = { ...(packetJson.data as RequestJoinPacketData), socket_id: socket.id };
      socket.join(packetJson.world_id);
    }

    if (!socket.rooms.has(packetJson.world_id) && packetJson.packet_type !== PacketType.REQUEST_JOIN) {
      log(`Player tried to send packet to world they are not in: ${packetJson.world_id}`, LogLevel.WARN, LogApp.SERVER);
      socket.emit('error', 'You are not in this world!');
      return;
    }

    let packetBuilder = new RedisPacketBuilder().target(packetJson.world_id).packet_type(packetJson.packet_type);

    packetBuilder =
      packetJson.packet_type === PacketType.REQUEST_JOIN
        ? packetBuilder.target(socket.id).sender(null)
        : packetBuilder.target(packetJson.packet_target).sender(sender);

    packetBuilder = packetBuilder.data(packetJson.data);

    await packetBuilder.build().publish_redis(packet_origin_prefixes.router_server + packetJson.world_id, redisPubSub);
  });
});

app.get('/worlds', async (_req, res) => {
  const worlds = await redisClient.json.get('worlds', {
    path: '$.*',
  });

  res.send(worlds);
});

server.listen(4000, () => {
  log('Server started on port 4000', LogLevel.INFO, LogApp.SERVER);
});

/* Implement SIGKILL logic */
process.on('SIGINT', async () => {
  await redisClient.disconnect();

  process.exit();
});

/* Subscribe to packet messages from the world */
(async () => {
  const client = createClient();
  await client.connect();

  client.pSubscribe('tick_*', (message, channel) => {
    const packets = message.split(';;').filter((packet) => packet.length);
    if (!packets.length) return;

    for (let i = 0; i < packets.length; i++) {
      const packet = DeconstructRedisPacket(packets[i], channel);

      if (packet.packet_target.startsWith('socket:') || packet.packet_target.startsWith('world:')) {
        const room = packet.packet_target.split(':')[1];
        io.sockets.to(room).emit('packet', packet);
      } else {
        log(`Unknown packet target: ${packet.packet_target}`, LogLevel.WARN, LogApp.SERVER);
      }
    }
  });
})();
