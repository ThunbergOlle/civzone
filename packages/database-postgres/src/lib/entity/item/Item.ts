import { DBItemName } from "@virtcon2/static-game-data";
import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { UserInventoryItem } from "../user_inventory_item/UserInventoryItem";

@ObjectType()
@Entity()
export class Item extends BaseEntity {
  @PrimaryColumn({ type: "int", unique: true })
  @Field(() => Int)
  id: number;

  @Field(() => String)
  @Column({ type: "text" })
  name: string;

  @Field(() => String)
  @Column({ type: "text" })
  display_name: DBItemName;

  @Field(() => String)
  @Column({ type: "text" })
  description: string;

  @Field(() => String)
  @Column({ type: "text" })
  icon: string;

  @Field(() => String)
  @Column({ type: "text" })
  rarity: string;

  @Field(() => Int)
  @Column({ type: "int", default: 64 })
  stack_size: number;

  @OneToMany(() => UserInventoryItem, (i) => i.item)
  inventory: UserInventoryItem[];
}
