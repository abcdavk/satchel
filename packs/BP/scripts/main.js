import { world, system, EntityComponentTypes, ItemStack, Direction } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { QIDB } from './QIDB.js';
const Inventories = new QIDB('inventories', 10, 270);
function createCredential(length) {
    const keys = "abcdefghijklmnopqrstuvwxyz";
    let result = ``;
    for (let i = 0; i < length; i++) {
        const randomChar = keys[Math.floor(Math.random() * keys.length)];
        result += `${randomChar}`; // §
    }
    return result;
}
// function spawnItemWithAmount(dim: Dimension, itemId: string, amount: number, location: Vector3) {
//     const maxStack = 255;
//     let remaining = amount;
//     while (remaining > 0) {
//         const stackAmount = Math.min(remaining, maxStack);
//         const stack = new ItemStack(itemId, stackAmount);
//         dim.spawnItem(stack, location);
//         remaining -= stackAmount;
//     }
// }
export function formatIdToName(typeId) {
    // Remove namespace
    const withoutNamespace = typeId.includes(":") ? typeId.split(":")[1] : typeId;
    // Replace underscores with spaces
    const withSpaces = withoutNamespace.replace(/_/g, " ");
    // Capitalize each word
    const capitalized = withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
    return capitalized;
}
system.runInterval(() => {
    world.getPlayers().forEach(player => {
        let inv = player.getComponent(EntityComponentTypes.Inventory);
        let con = inv?.container;
        if (inv && con) {
            for (let i = 0; i < inv?.inventorySize; i++) {
                if (con.getItem(i)?.hasTag("dave:satchel")) {
                    let satchelItem = con?.getItem(i);
                    let satchelLore = satchelItem?.getLore();
                    let savedItem = satchelItem?.getDynamicProperty("satchel:item");
                    let savedAmount = satchelItem?.getDynamicProperty("satchel:amount") || 0;
                    // create credential to avoid duplication - init
                    if (!satchelItem?.getDynamicProperty("satchel:credential")) {
                        satchelItem?.setDynamicProperty("satchel:credential", createCredential(10));
                        con.setItem(i, satchelItem);
                    }
                    for (let j = 0; j < inv?.inventorySize; j++) {
                        let satchelCredential = satchelItem?.getDynamicProperty("satchel:credential");
                        if (satchelCredential !== undefined) {
                            let detectedItem = con.getItem(j);
                            // trytobindvalue return satchel credential
                            try {
                                let tryToBindValue = player.getDynamicProperty("tryingtobind");
                                if (tryToBindValue) {
                                    // let bindItem = con.getItem(j);
                                    let bindItem = Inventories.get(satchelCredential);
                                    if (bindItem.typeId === con.getItem(j)?.typeId) {
                                        savedAmount += detectedItem?.amount; // FIXED: was overwritten before
                                        satchelItem?.setDynamicProperty("satchel:item", bindItem.typeId);
                                        satchelItem?.setDynamicProperty("satchel:amount", savedAmount);
                                        satchelItem?.setDynamicProperty("satchel:enable", true);
                                        satchelItem?.setLore([
                                            `§r§7Item:§e ${formatIdToName(bindItem.typeId)}`,
                                            `§r§7Amount:§e ${savedAmount}`, // FIXED: use countAmount, not savedAmount
                                        ]);
                                        con.setItem(i, satchelItem);
                                        con.setItem(j, undefined); // move this here too
                                        player.setDynamicProperty("tryingtobind");
                                        console.warn("bind success");
                                    }
                                }
                            }
                            catch (err) {
                            }
                            if (satchelItem?.getDynamicProperty("satchel:enable")) {
                                if (detectedItem && savedItem === detectedItem.typeId) {
                                    savedAmount += detectedItem?.amount; // FIXED: was overwritten before
                                    con.setItem(j, undefined);
                                }
                            }
                        }
                    }
                    if (savedItem && savedAmount) {
                        satchelItem?.setLore([
                            `§r§7Item:§e ${formatIdToName(savedItem)}`,
                            `§r§7Amount:§e ${savedAmount}`, // FIXED: use countAmount, not savedAmount
                        ]);
                        satchelItem?.setDynamicProperty("satchel:amount", savedAmount);
                        con.setItem(i, satchelItem);
                    }
                }
            }
        }
    });
});
world.beforeEvents.itemUse.subscribe((data) => {
    let { itemStack, source: player } = data;
    let inv = player.getComponent(EntityComponentTypes.Inventory);
    let con = inv?.container;
    let dim = world.getDimension(player.dimension.id);
    // trytobindvalue return satchel credential
    let tryToBindValue = player.getDynamicProperty("tryingtobind");
    if (tryToBindValue && !itemStack.hasTag("dave:satchel")) {
        let bindItem = itemStack;
        Inventories.set(tryToBindValue, bindItem);
        data.cancel = true;
    }
    if (itemStack.hasTag("dave:satchel")) {
        let satchelItem = itemStack;
        let satchelLore = satchelItem?.getLore();
        let savedItem = satchelItem?.getDynamicProperty("satchel:item");
        let savedAmount = satchelItem?.getDynamicProperty("satchel:amount");
        if (satchelLore.length === 0) {
            player.sendMessage("§aSelect and use the item yo want to bind this satchel!");
            player.setDynamicProperty("tryingtobind", satchelItem.getDynamicProperty("satchel:credential"));
            console.warn(satchelItem.getDynamicProperty("satchel:credential"));
        }
        else {
            if (player.isSneaking) {
                system.run(() => {
                    let form = new ActionFormData()
                        .title(`§l${formatIdToName(savedItem)} §rx${savedAmount}`);
                    if (satchelItem.getDynamicProperty("satchel:placeBlock")) {
                        form.button('§l§qPlace Block');
                    }
                    else {
                        form.button('§l§cPlace Block');
                    }
                    form.button('§lPlace Satchel');
                    if (satchelItem.getDynamicProperty("satchel:enable")) {
                        form.button('§l§2Enable');
                    }
                    else {
                        form.button('§l§cDisabled');
                    }
                    form.button('§lUnbind');
                    form.button('§lCancel');
                    form.show(player).then(r => {
                        if (r.selection === 0) {
                            // Place Block
                            if (satchelItem.getDynamicProperty("satchel:placeBlock")) {
                                // turn off
                                player.sendMessage(`§cPlacing ${formatIdToName(savedItem)} disabled!`);
                                satchelItem.setDynamicProperty("satchel:placeBlock", false);
                                con?.setItem(player.selectedSlotIndex, satchelItem);
                            }
                            else {
                                // turn on
                                player.sendMessage(`§aPlacing ${formatIdToName(savedItem)} enabled!`);
                                satchelItem.setDynamicProperty("satchel:placeBlock", true);
                                con?.setItem(player.selectedSlotIndex, satchelItem);
                            }
                        }
                        if (r.selection === 2) {
                            // Enable Satchel
                            if (satchelItem.getDynamicProperty("satchel:enable")) {
                                // turn off
                                player.sendMessage(`§c${formatIdToName(savedItem)} Satchel disabled!`);
                                satchelItem.setDynamicProperty("satchel:enable", false);
                                con?.setItem(player.selectedSlotIndex, satchelItem);
                            }
                            else {
                                // turn on
                                player.sendMessage(`§a${formatIdToName(savedItem)} Satchel enabled!`);
                                satchelItem.setDynamicProperty("satchel:enable", true);
                                con?.setItem(player.selectedSlotIndex, satchelItem);
                            }
                        }
                        if (r.selection === 3) {
                            // Unbind
                            player.setDynamicProperty("tryingtobind");
                            if (inv && savedAmount > inv?.inventorySize * 64) {
                                const maxStack = 64;
                                let remaining = savedAmount;
                                while (remaining > 0) {
                                    const stackAmount = Math.min(remaining, maxStack);
                                    const stack = new ItemStack(savedItem, stackAmount);
                                    dim.spawnItem(stack, player.location);
                                    remaining -= stackAmount;
                                }
                            }
                            else {
                                player.runCommand(`give @s ${savedItem} ${savedAmount}`);
                            }
                            satchelItem.setLore([]);
                            satchelItem.clearDynamicProperties();
                            con?.setItem(player.selectedSlotIndex, satchelItem);
                        }
                    });
                });
            }
        }
    }
});
const playerCooldowns = new Map();
world.beforeEvents.playerInteractWithBlock.subscribe(({ block, blockFace, itemStack, player }) => {
    const playerId = player.id;
    const now = Date.now();
    const lastUsed = playerCooldowns.get(playerId) ?? 0;
    if (now - lastUsed < 260) {
        return;
    }
    playerCooldowns.set(playerId, now);
    let inv = player.getComponent(EntityComponentTypes.Inventory);
    let con = inv?.container;
    let dim = world.getDimension(player.dimension.id);
    if (itemStack?.hasTag("dave:satchel")) {
        let satchelItem = itemStack;
        let satchelLore = satchelItem?.getLore();
        let savedItem = satchelItem?.getDynamicProperty("satchel:item");
        let savedAmount = satchelItem?.getDynamicProperty("satchel:amount");
        system.run(() => {
            const satchelLore = itemStack.getLore();
            if (itemStack.getDynamicProperty("satchel:placeBlock")) {
                if (savedAmount < 0)
                    return;
                if (block.north(1)?.isAir ||
                    block.south(1)?.isAir ||
                    block.east(1)?.isAir ||
                    block.west(1)?.isAir ||
                    block.above(1)?.isAir ||
                    block.below(1)?.isAir) {
                    try {
                        const faceMap = {
                            [Direction.North]: () => block.north(1),
                            [Direction.South]: () => block.south(1),
                            [Direction.East]: () => block.east(1),
                            [Direction.West]: () => block.west(1),
                            [Direction.Up]: () => block.above(1),
                            [Direction.Down]: () => block.below(1)
                        };
                        faceMap[blockFace]?.()?.setType(savedItem);
                        satchelItem?.setDynamicProperty("satchel:amount", savedAmount - 1);
                        con?.setItem(player.selectedSlotIndex, satchelItem);
                    }
                    catch (error) {
                        player.sendMessage(`§cThis item is unplaceable`);
                        return;
                    }
                }
            }
        });
    }
});
