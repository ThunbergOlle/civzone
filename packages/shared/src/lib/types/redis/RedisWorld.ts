import { ServerPlayer } from "./RedisPlayer";

export interface RedisWorld {
  players: ServerPlayer[];
  height_map: number[][];
  id: string;
}
