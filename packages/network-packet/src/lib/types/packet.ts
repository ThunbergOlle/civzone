import { ServerPlayer } from '@shared';

export enum PacketType {
  JOIN = 'join',
  DISCONNECT = 'disconnect',
  PLAYER_MOVE = 'playerMove',
  LOAD_WORLD = 'loadWorld',
  PLAYER_SET_POSITION = 'playerSetPosition',
  REQUEST_PLAYER_INVENTORY = 'requestPlayerInventory',
  PLAYER_INVENTORY = 'playerInventory',
  REQUEST_JOIN = 'requestJoin',
  REQUEST_MOVE_INVENTORY_ITEM = 'requestMoveInventoryItem',
}

export interface NetworkPacketData<T> {
  world_id?: string;
  packet_type: PacketType;
  packet_target?: string;
  data: T;
}
export interface NetworkPacketDataWithSender<T> extends NetworkPacketData<T> {
  packet_sender: ServerPlayer;
  world_id: string;
}
