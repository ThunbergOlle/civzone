import { LogLevel, log } from '@shared';
import { RedisPlayerUtils } from '@virtcon2/database-redis';
import { NetworkPacketData, PacketType, PlayerMovePacketData, RedisPacketBuilder } from '@virtcon2/network-packet';
import { RedisClientType } from 'redis';
import { TickService } from '../../services/tick_service';

export default async function player_set_position(packet: NetworkPacketData<PlayerMovePacketData>, redisClient: RedisClientType) {
  const playerId = packet.data.player_id;
  const [x, y] = packet.data.position;
  const redisPlayer = await RedisPlayerUtils.getPlayerInWorld(playerId, packet.world_id, redisClient);
  if (!redisPlayer) {
    log(`Player ${playerId} not found in world ${packet.world_id}`, LogLevel.WARN);
  }

  redisPlayer.position = [x, y];
  await RedisPlayerUtils.savePlayer(redisPlayer, redisClient);

  const playerSetPositionPacket: NetworkPacketData<PlayerMovePacketData> = {
    packet_type: packet.packet_type,
    data: {
      player_id: playerId,
      position: redisPlayer.position,
    },
    world_id: packet.world_id,
  };

  const outgoing_packet = new RedisPacketBuilder()
    .packet_type(PacketType.PLAYER_SET_POSITION)
    .data(playerSetPositionPacket.data)
    .sender(redisPlayer)
    .target(packet.world_id, 'world')
    .build();
  TickService.getInstance().add_outgoing_packet(outgoing_packet);
}
