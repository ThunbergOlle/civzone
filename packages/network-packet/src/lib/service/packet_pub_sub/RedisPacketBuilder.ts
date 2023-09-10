import { ServerPlayer } from '@shared';
import { RedisClientType } from 'redis';

export const packet_origin_prefixes = {
  router_server: 'router_',
  data_server: 'data_',
};
/* Use Builder pattern */
export class RedisPacketBuilder {
  private _packet_type = '';
  private _target = 'all';
  private _sender: ServerPlayer = { id: '', name: '', inventory: [], position: [0, 0], socket_id: '', world_id: '' };
  private _data = '';
  private _packet: string;

  sender(sender: ServerPlayer) {
    if (!sender) return this;
    this._sender = sender;
    return this;
  }

  packet_type(packet_type: string) {
    this._packet_type = packet_type;
    return this;
  }
  target(target?: string, type: 'world' | 'socket' = 'world') {
    this._target = `${type}:${target}`;
    return this;
  }
  data(data: unknown) {
    this._data = JSON.stringify(data);
    return this;
  }
  build() {
    if (!this._packet_type || !this._data || !this._sender || !this._target) {
      throw new Error(
        'Packet not correctly built, missing data: ' +
          JSON.stringify({ target: this._target, packet_type: this._packet_type, data: this._data, sender: this._sender }),
      );
    }

    this._packet = this._packet_type + '#' + this._target + '#' + JSON.stringify(this._sender) + '#' + this._data;
    return this;
  }

  get_packet() {
    if (!this._packet) {
      throw new Error('Packet not built');
    }
    return this._packet;
  }

  async publish_redis(channel: string, client: RedisClientType) {
    if (!this._packet) {
      throw new Error('Packet not built');
    }
    await client.publish(channel, this._packet);
  }
}
