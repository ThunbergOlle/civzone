import { User } from '@virtcon2/database-postgres';
import { World } from '@virtcon2/database-redis';
import { JoinPacketData, LoadWorldPacketData, NetworkPacketData, PacketType, RedisPacketBuilder, RequestJoinPacketData } from '@virtcon2/network-packet';
import { RedisClientType } from 'redis';
import { TickService } from '../../services/tick_service';

export default async function request_join_packet(packet: NetworkPacketData<RequestJoinPacketData>, redisClient: RedisClientType) {
  // get player inventory from database.
  const player = await User.findOne({ where: { token: packet.data.token } });

  const redisWorld = await World.getWorld(packet.world_id, redisClient);

  const loadWorldPacketData: LoadWorldPacketData = {
    player: {
      id: player.id,
      name: player.display_name,
      world_id: packet.world_id,
      socket_id: packet.data.socket_id,
      position: [0, 0],
      inventory: [],
    },
    world: redisWorld,
  };

  // construct a JoinPacket
  const loadWorldPacket = new RedisPacketBuilder().packet_type(PacketType.LOAD_WORLD).data(loadWorldPacketData).target(packet.data.socket_id, 'socket').build();

  const joinPacketData: JoinPacketData = {
    id: player.id,
    name: player.display_name,
    position: [0, 0],
    socket_id: packet.data.socket_id,
  };
  const joinPacket = new RedisPacketBuilder().packet_type(PacketType.JOIN).data(joinPacketData).target(packet.world_id, 'world').build();

  TickService.getInstance().add_outgoing_packet(loadWorldPacket);
  TickService.getInstance().add_outgoing_packet(joinPacket);
}
