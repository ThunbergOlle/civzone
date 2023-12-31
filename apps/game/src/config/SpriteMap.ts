import { DBItemName, ResourceNames } from "@virtcon2/static-game-data";

export interface TextureMetaData {
  textureId: number; // for ECS
  textureName: string; // for Phaser
  texturePath: string; // for Phaser
  animations?: {
    name: string;
    frames: number[];
    frameRate: number;
    repeat: number;
    playOnCreate?: boolean;
  }[];
  spriteSheetFrameWidth?: number;
  spriteSheetFrameHeight?: number;
}
export const ItemTextureMap: Record<DBItemName, TextureMetaData | null> = {
  [DBItemName.WOOD]: {
    textureId: 2,
    textureName: "wood",
    texturePath: "sprites/items/wood.png",
  },
  [DBItemName.WOOD_BIG]: {
    textureId: 2,
    textureName: "wood",
    texturePath: "sprites/items/wood.png",
  },
  [DBItemName.STICK]: {
    textureId: 3,
    textureName: "stick",
    texturePath: "sprites/items/stick.png",
  },
  [DBItemName.SAND]: {
    textureId: 4,
    textureName: "sand",
    texturePath: "sprites/items/sand.png",
  },
  [DBItemName.GLASS]: {
    textureId: 5,
    textureName: "glass",
    texturePath: "sprites/items/glass.png",
  },
  [DBItemName.COAL]: {
    textureId: 6,
    textureName: "coal",
    texturePath: "sprites/items/coal.png",
  },

  [DBItemName.STONE]: {
    textureId: 9,
    textureName: "stone",
    texturePath: "sprites/items/stone.png",
  },
  [DBItemName.IRON]: {
    textureId: 12,
    textureName: "iron",
    texturePath: "sprites/items/iron.png",
  },
};

export const ResourceTextureMap: Record<ResourceNames, TextureMetaData | null> =
  {
    [ResourceNames.WOOD_BIG]: {
      textureId: 100,
      textureName: "resource_wood_big",
      texturePath: "sprites/resources/wood_big.png",
    },
    [ResourceNames.WOOD]: {
      textureId: 101,
      textureName: "resource_wood",
      texturePath: "sprites/resources/wood.png",
    },
    [ResourceNames.STONE]: {
      textureId: 102,
      textureName: "resource_stone",
      texturePath: "sprites/resources/stone.png",
    },
    [ResourceNames.IRON]: {
      textureId: 103,
      textureName: "resource_iron",
      texturePath: "sprites/resources/iron.png",
    },
    [ResourceNames.COAL]: {
      textureId: 104,
      textureName: "resource_coal",
      texturePath: "sprites/resources/coal.png",
    },
  };

export const MiscTextureMap: Record<string, TextureMetaData | null> = {
  player_character: {
    textureId: 1000,
    textureName: "player_character",
    texturePath: "sprites/player_tmp.png",
  },
  unknown: {
    textureId: 0,
    textureName: "unknown",
    texturePath: "sprites/misc/unknown.png",
  },
};
export const AllTextureMaps = {
  ...ItemTextureMap,
  ...ResourceTextureMap,
  ...MiscTextureMap,
};
export const getTextureNameFromTextureId = (
  textureId: number
): string | null => {
  const allTextureMaps = Object.keys(AllTextureMaps) as string[];
  for (const textureMapKey of allTextureMaps) {
    const textureMap =
      AllTextureMaps[textureMapKey as keyof typeof AllTextureMaps];
    if (textureMap && textureMap.textureId === textureId) {
      return textureMap.textureName;
    }
  }
  return null;
};
export const getTextureFromTextureId = (
  textureId: number
): TextureMetaData | null => {
  const allTextureMaps = Object.keys(AllTextureMaps) as string[];
  for (const textureMapKey of allTextureMaps) {
    const textureMap =
      AllTextureMaps[textureMapKey as keyof typeof AllTextureMaps];
    if (textureMap && textureMap.textureId === textureId) {
      return textureMap;
    }
  }
  return null;
};
