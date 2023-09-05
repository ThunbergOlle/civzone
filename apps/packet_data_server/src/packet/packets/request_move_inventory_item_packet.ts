import { safe_move_items_between_inventories } from '@virtcon2/database-postgres';
import { NetworkPacketDataWithSender, RequestMoveInventoryItemPacketData } from '@virtcon2/network-packet';
import { RedisClientType } from 'redis';
import request_player_inventory_packet from './request_player_inventory_packet';

export default async function request_move_inventory_item_packet(
  packet: NetworkPacketDataWithSender<RequestMoveInventoryItemPacketData>,
  redisPubClient: RedisClientType,
) {
  return request_move_inventory_item_inside_player_inventory(packet, redisPubClient);
}

async function request_move_inventory_item_inside_player_inventory(
  packet: NetworkPacketDataWithSender<RequestMoveInventoryItemPacketData>,
  redisPubClient: RedisClientType,
) {
  await safe_move_items_between_inventories({
    fromId: packet.packet_sender.id,
    toId: packet.packet_sender.id,
    itemId: packet.data.item.item.id,
    quantity: packet.data.item.quantity,
    fromSlot: packet.data.fromInventorySlot,
    toSlot: packet.data.toInventorySlot,
  });
  request_player_inventory_packet(packet, redisPubClient);
}
