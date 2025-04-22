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
        let dim = world.getDimension(player.dimension.id);
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
        dim.getEntities({
            type: "dave:satchel"
        }).forEach(satchelSpawn => {
            if (!satchelSpawn)
                return;
            let satchelInv = satchelSpawn.getComponent(EntityComponentTypes.Inventory);
            let satchelCon = satchelInv?.container;
            let savedItem = satchelSpawn.getDynamicProperty("satchel:item");
            let savedAmount = satchelSpawn.getDynamicProperty("satchel:amount");
            let satchelCredential = satchelSpawn.getDynamicProperty("satchel:credential");
            let satchelColor = satchelSpawn.getDynamicProperty("satchel:color");
            if (savedItem &&
                savedAmount &&
                satchelColor &&
                satchelCredential &&
                satchelInv &&
                satchelCon) {
                const maxStack = 1;
                let remaining = savedAmount;
                while (remaining > 0) {
                    let currentSlot = satchelCon.getItem(0);
                    if (!currentSlot) {
                        const stack = new ItemStack(savedItem, maxStack);
                        satchelCon.setItem(0, stack);
                        remaining -= maxStack;
                    }
                    else {
                        break;
                    }
                }
                satchelSpawn.setDynamicProperty("satchel:amount", remaining);
                // player.onScreenDisplay.setActionBar(`Remaining: ${remaining}`);
            }
        });
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
                    // 0
                    if (satchelItem.getDynamicProperty("satchel:placeBlock")) {
                        form.button('§l§2Place Block');
                    }
                    else {
                        form.button('§l§cPlace Block');
                    }
                    // 1
                    if (satchelItem.getDynamicProperty("satchel:placeSatchel")) {
                        form.button('§l§2Place Satchel');
                    }
                    else {
                        form.button('§l§cPlace Satchel');
                    }
                    // 2
                    if (satchelItem.getDynamicProperty("satchel:enable")) {
                        form.button('§l§2Enable');
                    }
                    else {
                        form.button('§l§cDisabled');
                    }
                    // 3
                    form.button('§lUnbind');
                    // 4
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
                                satchelItem.setDynamicProperty("satchel:placeSatchel", false);
                                con?.setItem(player.selectedSlotIndex, satchelItem);
                            }
                        }
                        if (r.selection === 1) {
                            // Place Satchel
                            if (satchelItem.getDynamicProperty("satchel:placeSatchel")) {
                                // turn off
                                satchelItem.setDynamicProperty("satchel:placeSatchel", false);
                                con?.setItem(player.selectedSlotIndex, satchelItem);
                            }
                            else {
                                // turn on
                                satchelItem.setDynamicProperty("satchel:placeSatchel", true);
                                satchelItem.setDynamicProperty("satchel:placeBlock", false);
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
        let satchelCredential = satchelItem?.getDynamicProperty("satchel:credential");
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
            else if (satchelItem.getDynamicProperty("satchel:placeSatchel")) {
                if (player.isSneaking)
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
                        let faceBlock = faceMap[blockFace]?.();
                        let faceLocationCenter = faceBlock?.center();
                        let faceLocation = faceBlock?.location;
                        if (faceLocationCenter === undefined || faceLocation === undefined)
                            return;
                        let satchelSpawn = dim.spawnEntity("dave:satchel", {
                            x: faceLocationCenter.x,
                            y: faceLocation.y,
                            z: faceLocationCenter.z
                        });
                        satchelSpawn.triggerEvent(satchelItem.typeId);
                        console.warn(faceLocationCenter.x, faceLocationCenter.y, faceLocationCenter.z);
                        satchelSpawn.setDynamicProperty("satchel:item", savedItem);
                        satchelSpawn.setDynamicProperty("satchel:amount", savedAmount);
                        satchelSpawn.setDynamicProperty("satchel:credential", satchelCredential);
                        satchelSpawn.setDynamicProperty("satchel:color", satchelItem.typeId);
                        con?.setItem(player.selectedSlotIndex, undefined);
                    }
                    catch (error) {
                        player.sendMessage(`${error}`);
                        return;
                    }
                }
            }
        });
    }
});
world.afterEvents.playerInteractWithEntity.subscribe(({ player, target }) => {
    let inv = player.getComponent(EntityComponentTypes.Inventory);
    let con = inv?.container;
    if (player.isSneaking && target.typeId === "dave:satchel" && con && inv) {
        let satchelSpawn = target;
        let savedItem = satchelSpawn.getDynamicProperty("satchel:item");
        let savedAmount = satchelSpawn.getDynamicProperty("satchel:amount");
        let satchelCredential = satchelSpawn.getDynamicProperty("satchel:credential");
        let satchelColor = satchelSpawn.getDynamicProperty("satchel:color");
        console.warn(satchelColor);
        if (!con.getItem(player.selectedSlotIndex)) {
            let newSatchel = new ItemStack(satchelColor);
            newSatchel.setDynamicProperty("satchel:credential", satchelCredential);
            newSatchel.setDynamicProperty("satchel:item", savedItem);
            newSatchel.setDynamicProperty("satchel:amount", savedAmount);
            newSatchel.setDynamicProperty("satchel:enable", true);
            newSatchel?.setLore([
                `§r§7Item:§e ${formatIdToName(savedItem)}`,
                `§r§7Amount:§e ${savedAmount}`, // FIXED: use countAmount, not savedAmount
            ]);
            con.setItem(player.selectedSlotIndex, newSatchel);
            satchelSpawn.remove();
        }
        else {
            player.sendMessage("§cEmpty the selected slot to pick up the satchel!");
        }
    }
});
