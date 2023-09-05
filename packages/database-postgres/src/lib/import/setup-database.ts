import { LogApp, LogLevel, log } from "@shared";
import {
  all_db_buildings,
  all_db_items,
  all_db_items_recipes,
} from "@virtcon2/static-game-data";
import { promises as fs } from "fs";
import { validate } from "jsonschema";
import { Item } from "../entity/item/Item";

export async function setupDatabase() {
  setupItems();
}

const setupItems = async () => {
  /* Import items */
  for (const item of all_db_items) {
    await Item.upsert(item as unknown as Item, {
      upsertType: "on-conflict-do-update",
      conflictPaths: ["id"],
    });
  }
};

async function getJsonSchema(type: string) {
  const jsonSchema = await fs.readFile(
    `packages/static-game-data/src/lib/${type}/db/_schema.json`,
    "utf-8"
  );
  return JSON.parse(jsonSchema);
}
