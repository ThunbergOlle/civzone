import {
  NetworkPacketData,
  NetworkPacketDataWithSender,
  PacketType,
  RequestJoinPacketData,
  RequestMoveInventoryItemPacketData,
  RequestPlayerInventoryPacket,
} from '@virtcon2/network-packet';
import { RedisClientType } from 'redis';
import request_join_packet from './packets/request_join_packet';
import request_player_inventory_packet from './packets/request_player_inventory_packet';

import request_move_inventory_item_packet from './packets/request_move_inventory_item_packet';

export default function all_packet_handler(packet: NetworkPacketData<unknown>, redisPubClient: RedisClientType, packet_queue: NetworkPacketData<unknown>[]) {
  switch (packet.packet_type) {
    case PacketType.REQUEST_PLAYER_INVENTORY: {
      request_player_inventory_packet(packet as NetworkPacketDataWithSender<RequestPlayerInventoryPacket>, redisPubClient);
      break;
    }
    case PacketType.REQUEST_JOIN: {
      request_join_packet(packet as NetworkPacketData<RequestJoinPacketData>, redisPubClient);
      break;
    }

    case PacketType.REQUEST_MOVE_INVENTORY_ITEM: {
      packet_queue.push(packet);
      // request_move_inventory_item_packet(packet as NetworkPacketDataWithSender<RequestMoveInventoryItemPacketData>, redisPubClient);
      break;
    }

    default: {
      break;
    }
  }
}

export async function sync_packet_handler(packet: NetworkPacketData<unknown>, redisPubClient: RedisClientType) {
  switch (packet.packet_type) {
    case PacketType.REQUEST_MOVE_INVENTORY_ITEM: {
      await request_move_inventory_item_packet(packet as NetworkPacketDataWithSender<RequestMoveInventoryItemPacketData>, redisPubClient);
      break;
    }
  }
}
