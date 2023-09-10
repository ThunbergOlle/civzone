import { LogLevel, log } from '@shared';
import { RedisPacketBuilder } from '@virtcon2/network-packet';
import { RedisClientType } from 'redis';

async function tick_loop(this: TickService) {
  this.tick++;

  const elapsed = this.last_tick ? Date.now() - this.last_tick : 0;
  if (elapsed > this.tick_interval) {
    log(`Fallen behind ${elapsed - this.tick_interval}ms on tick ${this.tick}`, LogLevel.WARN);
  }

  if (this.tick % 100 === 0) {
    log(`Tick ${this.tick}`);
  }

  await new Promise((resolve) => setTimeout(resolve, this.tick_interval - elapsed));
  this.last_tick = Date.now();
}

export class TickService {
  // Singelton instance.
  private static instance: TickService = null;
  public static readonly TPS = 20;
  private redis_client: RedisClientType;

  protected tick = 0;
  protected tick_interval = 1000 / TickService.TPS;

  protected last_tick: number;

  protected outgoing_packet_queue: RedisPacketBuilder[] = [];

  protected running = false;

  constructor() {
    if (TickService.instance === null) {
      TickService.instance = this;
    }

    return TickService.instance;
  }

  public setRedisClient(redis_client: RedisClientType) {
    this.redis_client = redis_client;
  }

  public static getInstance(): TickService {
    if (TickService.instance === null) {
      TickService.instance = new TickService();
    }

    return TickService.instance;
  }

  private checkServiceConditions() {
    if (!this.redis_client) {
      throw new Error('Redis client not set.');
    }
  }
  public start(world_name: string) {
    this.checkServiceConditions();
    this.running = true;
    this.game_loop(world_name);
  }

  public stop() {
    this.running = false;
  }

  private async game_loop(world_name: string) {
    while (this.running) {
      const outgoing = this.prepare_outgoing_packets();
      if (outgoing.length) {
        await this.publish_outgoing_packets(outgoing, world_name);
      }

      await tick_loop.call(this);
    }
  }
  private async publish_outgoing_packets(outgoing: string, world_name: string) {
    await this.redis_client.publish('tick_' + world_name, outgoing);
  }

  public add_outgoing_packet(packet: RedisPacketBuilder) {
    this.outgoing_packet_queue.push(packet);
  }
  private prepare_outgoing_packets(): string {
    const packetString = this.outgoing_packet_queue.map((packet) => packet.build().get_packet()).join(';;');
    this.outgoing_packet_queue = [];
    return packetString;
  }
}
