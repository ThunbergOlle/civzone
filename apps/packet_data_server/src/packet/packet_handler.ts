import {
  NetworkPacketData,
  NetworkPacketDataWithSender,
  PacketType,
  PlayerMovePacketData,
  RequestJoinPacketData,
  RequestPlayerInventoryPacket,
} from '@virtcon2/network-packet';
import { RedisClientType } from 'redis';
import request_join_packet from './packets/request_join_packet';
import request_player_inventory_packet from './packets/request_player_inventory_packet';

import { LogLevel, log } from '@shared';
import player_set_position from './packets/player_set_position';

export function packet_handler(packet: NetworkPacketData<unknown>, redisPubClient: RedisClientType) {
  switch (packet.packet_type) {
    case PacketType.REQUEST_PLAYER_INVENTORY: {
      request_player_inventory_packet(packet as NetworkPacketDataWithSender<RequestPlayerInventoryPacket>, redisPubClient);
      break;
    }
    case PacketType.REQUEST_JOIN: {
      request_join_packet(packet as NetworkPacketData<RequestJoinPacketData>, redisPubClient);
      break;
    }
    case PacketType.PLAYER_SET_POSITION: {
      player_set_position(packet as NetworkPacketDataWithSender<PlayerMovePacketData>, redisPubClient);
      break;
    }

    default: {
      log(`Unhandled packet type: ${packet.packet_type}`, LogLevel.WARN);
      break;
    }
  }
}
