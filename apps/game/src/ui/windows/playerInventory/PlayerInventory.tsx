import { InventoryType, ServerInventoryItem } from '@shared';
import { NetworkPacketData, PacketType, RequestMoveInventoryItemPacketData, RequestPlayerInventoryPacket } from '@virtcon2/network-packet';
import { useContext, useEffect, useRef, useState } from 'react';

import { events } from '../../../events/Events';
import Game from '../../../scenes/Game';
import InventoryItem, { InventoryItemPlaceholder, InventoryItemType } from '../../components/inventoryItem/InventoryItem';
import Window from '../../components/window/Window';
import { WindowStackContext } from '../../context/window/WindowContext';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { WindowType } from '../../lib/WindowManager';

export default function PlayerInventoryWindow() {
  const windowManagerContext = useContext(WindowStackContext);
  const forceUpdate = useForceUpdate();

  const isOpen = useRef(false);

  const [inventory, setInventory] = useState<Array<ServerInventoryItem>>([]);

  function toggleInventory() {
    if (!isOpen.current) {
      const packet: NetworkPacketData<RequestPlayerInventoryPacket> = {
        data: {},
        packet_type: PacketType.REQUEST_PLAYER_INVENTORY,
      };
      Game.network.sendPacket(packet);
      isOpen.current = true;
    } else {
      isOpen.current = false;
    }
    windowManagerContext.setWindowStack({ type: 'toggle', windowType: WindowType.VIEW_PLAYER_INVENTORY });
    forceUpdate();
  }
  useEffect(() => {
    events.subscribe('onInventoryButtonPressed', toggleInventory);
    events.subscribe('networkPlayerInventoryPacket', ({ inventory }) => {
      setInventory(inventory);
    });
    return () => {
      events.unsubscribe('networkPlayerInventoryPacket', () => {});
      events.unsubscribe('onInventoryButtonPressed', () => {});
    };
  }, []);

  const onInventoryDropItem = (item: InventoryItemType, slot: number, inventoryId: number) => {
    // Construct network packet to move the item to the new invenory.
    const packet: NetworkPacketData<RequestMoveInventoryItemPacketData> = {
      data: {
        ...item,
        toInventoryId: inventoryId,
        toInventorySlot: slot,
        toInventoryType: InventoryType.PLAYER,
      },
      packet_type: PacketType.REQUEST_MOVE_INVENTORY_ITEM,
    };
    Game.network.sendPacket(packet);
  };
  return (
    <Window
      title="Inventory"
      width={800}
      height={500}
      defaultPosition={{ x: window.innerWidth / 2 - 400, y: 40 }}
      windowType={WindowType.VIEW_PLAYER_INVENTORY}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h2 className="text-2xl">Inventory</h2>
          <div className="flex flex-row flex-wrap">
            {inventory
              ?.sort((a, b) => a.slot - b.slot)
              .map((item) => {
                return item && item.item ? (
                  <InventoryItem
                    key={item.slot}
                    item={item}
                    slot={item.slot}
                    onDrop={onInventoryDropItem}
                    fromInventoryType={InventoryType.PLAYER}
                    fromInventoryId={0}
                    fromInventorySlot={item.slot}
                  />
                ) : (
                  <InventoryItemPlaceholder key={item.slot} inventoryId={0} slot={item.slot} onDrop={onInventoryDropItem} />
                );
              })}
          </div>
        </div>
      </div>
    </Window>
  );
}
