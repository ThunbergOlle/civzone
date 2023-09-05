use derive_redis_json::RedisJsonValue;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, RedisJsonValue, Debug, Clone)]
pub struct World {
    pub id: String,
    pub players: Vec<Player>,
    pub height_map: Vec<Vec<f32>>,
}

#[derive(Serialize, Deserialize, RedisJsonValue, Debug, Clone)]
pub struct Player {
    pub id: String,
    pub name: String,
    pub position: Vec<f32>,
    pub inventory: Vec<InventoryItem>,
    pub socket_id: String,
    pub world_id: String,
}

#[derive(Serialize, Deserialize, RedisJsonValue, Debug, Clone)]
pub struct InventoryItem {
    pub quantity: i32,
    pub item: Option<Item>,
    pub slot: i32,
}

#[derive(Serialize, Deserialize, RedisJsonValue, Debug, Clone)]
pub struct Item {
    pub id: i32,
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub icon: String,
    pub rarity: String,
}
