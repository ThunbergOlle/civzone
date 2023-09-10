import { ServerPlayer } from '@shared';
import { NetworkPacketDataWithSender, PacketType } from '../../types/packet';

export function DeconstructRedisPacket<T>(packet_data: string, channel: string): NetworkPacketDataWithSender<T> {
  const world_id = channel.split('_')[1];
  const packet_parts = packet_data.split('#');
  const packet_type = packet_parts[0] as PacketType;
  const packet_target = packet_parts[1];
  const packet_sender = JSON.parse(packet_parts[2]) as ServerPlayer;
  const data: T = JSON.parse(packet_parts[3]);

  return {
    world_id,
    packet_type,
    packet_target,
    packet_sender,
    data,
  };
}
