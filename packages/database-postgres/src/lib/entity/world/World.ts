import { WorldSettings } from "@shared";
import { all_spawnable_db_items } from "@virtcon2/static-game-data";
import seedRandom from "seedrandom";
import { createNoise2D } from "simplex-noise";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { AppDataSource } from "../../data-source";
import { Item } from "../item/Item";
import { User } from "../user/User";

@ObjectType()
@Entity()
export class World extends BaseEntity {
  @PrimaryColumn({ type: "text", unique: true })
  @Field(() => String)
  id: string; // world ID is the player's display name

  @Column({ type: "int", nullable: false })
  @Field(() => Number)
  seed: number;

  @BeforeInsert()
  replaceSpacesInId() {
    this.id = this.id.replace(/\s/g, "_");
  }

  static Get2DWorldMap(
    seed: number,
    size = WorldSettings.world_size
  ): number[][] {
    const randomGenerator = seedRandom(seed);
    const noise = createNoise2D(randomGenerator);
    const map = [];
    for (let x = 0; x < size; x++) {
      map[x] = [];
      for (let y = 0; y < size; y++) {
        map[x][y] = noise(x / 20, y / 20);
      }
    }
    return map;
  }

  static async GenerateNewWorld(
    owner: User,
    size = WorldSettings.world_size
  ): Promise<World> {
    return new Promise((resolve) => {
      AppDataSource.manager.transaction(async (transaction) => {
        const world = World.create();
        world.seed = Math.floor(Math.random() * 1000000000);
        world.id = owner.display_name.replace(/\s/g, "_"); // replace spaces with underscores

        await transaction.save(world);

        return resolve(world);
      });
    });
  }
}
