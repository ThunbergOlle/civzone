import { WorldSettings } from '@shared';
import seedRandom from 'seedrandom';
import { createNoise2D } from 'simplex-noise';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { AppDataSource } from '../../data-source';

@ObjectType()
@Entity()
export class World extends BaseEntity {
  @PrimaryColumn({ type: 'text', unique: true })
  @Field(() => String)
  id: string; // id is the world name

  @Column({ type: 'int', nullable: false })
  @Field(() => Number)
  seed: number;

  @BeforeInsert()
  replaceSpacesInId() {
    this.id = this.id.replace(/\s/g, '_');
  }

  static Get2DWorldMap(seed: number, size = WorldSettings.world_size): number[][] {
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

  static async GenerateNewWorld(world_name: string): Promise<World> {
    return new Promise((resolve) => {
      AppDataSource.manager.transaction(async (transaction) => {
        const world = World.create();
        world.seed = Math.floor(Math.random() * 1000000000);
        world.id = world_name;

        await transaction.save(world);

        return resolve(world);
      });
    });
  }
}
