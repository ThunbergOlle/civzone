import { ServerInventoryItem } from '@shared';
import { UserInventoryItem } from '@virtcon2/database-postgres';
import { NetworkPacketDataWithSender, PacketType, PlayerInventoryPacketData, RedisPacketBuilder, RequestPlayerInventoryPacket } from '@virtcon2/network-packet';
import { RedisClientType } from 'redis';
import { TickService } from '../../services/tick_service';

export default async function request_player_inventory_packet(
  packet: NetworkPacketDataWithSender<RequestPlayerInventoryPacket>,
  redisPubClient: RedisClientType,
) {
  // get player inventory from database.
  const inventory = await UserInventoryItem.find({
    where: { user: { id: packet.packet_sender.id } },
    relations: ['item', 'item.building', 'item.building.items_to_be_placed_on'],
  });
  // send player inventory to client.
  const packet_data: PlayerInventoryPacketData = {
    player_id: packet.packet_sender.id,
    inventory: inventory as Array<ServerInventoryItem>,
  };

  const player_inventory_packet = new RedisPacketBuilder().packet_type(PacketType.PLAYER_INVENTORY).data(packet_data).target(packet.packet_target).build();

  TickService.getInstance().add_outgoing_packet(player_inventory_packet);
}
