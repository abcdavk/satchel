import { Direction, EntityComponentTypes, system, world } from "@minecraft/server";
function getParsedLore(lore) {
    return lore.map(line => {
        const parts = line.split(":");
        if (parts.length < 2)
            return "";
        return parts.slice(1).join(":").trim();
    });
}
function createCredential(length) {
    const keys = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomChar = keys[Math.floor(Math.random() * keys.length)];
        result += `${randomChar}`; // §
    }
    return result;
}
export function formatIdToName(typeId) {
    // Remove namespace
    const withoutNamespace = typeId.includes(":") ? typeId.split(":")[1] : typeId;
    // Replace underscores with spaces
    const withSpaces = withoutNamespace.replace(/_/g, " ");
    // Capitalize each word
    const capitalized = withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
    return capitalized;
}
world.afterEvents.playerSpawn.subscribe(({ player }) => {
    if (player.getDynamicProperty("satchel")) {
        player.setDynamicProperty("satchel", false);
        player.setDynamicProperty("satchelMode", "Binding");
    }
});
let switchCooldown = new Map();
system.runInterval(() => {
    world.getPlayers().forEach(p => {
        let inv = p.getComponent(EntityComponentTypes.Inventory);
        let con = inv?.container;
        if (inv && con) {
            let selectedSatchel = con.getItem(p.selectedSlotIndex);
            let selectedLore = selectedSatchel?.getLore();
            if (selectedSatchel && selectedSatchel.typeId === "dave:satchel" && selectedLore) {
                if (!selectedLore.some(line => line.includes("none"))) {
                    let parsedLore = getParsedLore(selectedLore);
                    p.onScreenDisplay.setActionBar(`${formatIdToName(parsedLore[0])} ${parsedLore[1]}x \nMode: ${p.getDynamicProperty("satchelMode")}`);
                }
            }
            for (let i = 0; i < inv?.inventorySize; i++) {
                if (con.getItem(i)?.typeId === "dave:satchel") {
                    let satchelItem = con?.getItem(i);
                    let satchelLore = satchelItem?.getLore();
                    if (!satchelLore || !satchelLore.some(line => line.includes("§"))) {
                        let credential = createCredential(10);
                        satchelItem?.setLore([
                            `§r§cItem§c: none`,
                            `§r§cAmount§c: 0`,
                            `§r§7Mode§e: ${p.getDynamicProperty("satchelMode")}`,
                            `${credential}`
                        ]);
                        console.warn(credential);
                        con.setItem(i, satchelItem);
                    }
                    else {
                        if (p.getDynamicProperty("satchel") && !satchelLore.some(line => line.includes("none"))) {
                            let lore = getParsedLore(satchelLore);
                            let itemId = lore[0];
                            let itemAmount = parseInt(lore[1]);
                            for (let j = 0; j < inv?.inventorySize; j++) {
                                if (con.getItem(j)?.typeId === itemId) {
                                    itemAmount += con?.getItem(j)?.amount;
                                    con.setItem(j, undefined);
                                }
                                if (con.getItem(i)?.typeId === "dave:satchel") {
                                    let satchelItem = con?.getItem(i);
                                    const currentMode = p.getDynamicProperty("satchelMode");
                                    satchelItem?.setLore([
                                        `§r§7Item§e: ${itemId}`,
                                        `§r§7Amount§e: ${itemAmount}`,
                                        `§r§7Mode§e: ${currentMode}`,
                                        `${satchelLore[3]}`
                                    ]);
                                    con.setItem(i, satchelItem);
                                }
                            }
                        }
                    }
                }
            }
            if (p.isSneaking && inv && con) {
                const SATCHEL_MODES = ["Binding", "Switch Mode", "Placing Block", "Placing satchel", "Unpack"];
                const currentTime = Date.now();
                const lastSwitch = switchCooldown.get(p.id) || 0;
                if (currentTime - lastSwitch < 1000)
                    return;
                for (let i = 0; i < inv.inventorySize; i++) {
                    const satchelItem = con.getItem(i);
                    if (satchelItem?.typeId === "dave:satchel") {
                        let satchelLore = satchelItem?.getLore();
                        let lore = getParsedLore(satchelLore);
                        let itemId = lore[0];
                        let itemAmount = parseInt(lore[1]);
                        const currentMode = p.getDynamicProperty("satchelMode");
                        let currentIndex = SATCHEL_MODES.indexOf(currentMode);
                        let nextIndex = (currentIndex + 1) % SATCHEL_MODES.length;
                        let nextMode = SATCHEL_MODES[nextIndex];
                        p.setDynamicProperty("satchelMode", nextMode);
                        satchelItem?.setLore([
                            `§r§7Item§e: ${itemId}`,
                            `§r§7Amount§e: ${itemAmount}`,
                            `§r§7Mode§e: ${nextMode}`,
                            `${satchelLore[3]}`
                        ]);
                        con.setItem(i, satchelItem);
                        // Set cooldown
                        switchCooldown.set(p.id, currentTime);
                        break;
                    }
                }
            }
        }
    });
});
world.afterEvents.itemUse.subscribe(({ source: p, itemStack }) => {
    let inv = p.getComponent(EntityComponentTypes.Inventory);
    let con = inv?.container;
    let dim = world.getDimension(p.dimension.id);
    if (p.hasTag("satchel:binding") && itemStack.typeId !== "dave:satchel") {
        if (inv && con) {
            for (let i = 0; i < inv.inventorySize; i++) {
                if (con.getItem(i)?.typeId === "dave:satchel") {
                    let satchelItem = con.getItem(i);
                    let satchelLore = satchelItem?.getLore();
                    if (satchelLore && satchelLore[3] === p.getDynamicProperty("satchel:binding") && p.hasTag("satchel:binding")) {
                        let credential = satchelLore[3];
                        satchelItem?.setLore([
                            `§r§7Item§e: ${itemStack.typeId}`,
                            `§r§7Amount§e: 0`,
                            `§r§7Mode§e: switch`,
                            `${credential}`
                        ]);
                        p.setDynamicProperty(credential, itemStack.typeId);
                        console.warn(credential);
                        con?.setItem(i, satchelItem);
                        p.removeTag("satchel:binding");
                        p.setDynamicProperty("satchelMode", "Switch Mode");
                        p.setDynamicProperty("satchel", true);
                        p.setDynamicProperty("satchelBinding");
                        p.sendMessage(`§aSuccessfully bind ${formatIdToName(itemStack.typeId)}`);
                    }
                }
            }
        }
    }
    if (itemStack.hasTag("dave:satchel")) {
        const lore = itemStack.getLore();
        if (p.getDynamicProperty("satchelMode") === "Binding" || getParsedLore(lore)[0] === "none") {
            if (lore.some(line => line.includes("none"))) {
                p.sendMessage("§aSelect and use the item yo want to bind this satchel!");
                p.addTag("satchel:binding");
                p.setDynamicProperty("satchel:binding", lore[3]);
            }
            else {
                let credential = lore[3];
                itemStack?.setLore([
                    `§r§7Item§e: none`,
                    `§r§7Amount§e: 0`,
                    `§r§7Mode§e: Binding`,
                    `${credential}`
                ]);
                let parsedLore = getParsedLore(lore);
                p.runCommand(`give @s ${parsedLore[0]} ${parsedLore[1]}`);
                p.setDynamicProperty("satchel", false);
            }
        }
        if (getParsedLore(lore)[0] !== "none") {
            if (p.getDynamicProperty("satchelMode") === "Switch Mode") {
                console.warn("switching on/off");
                if (!p.getDynamicProperty("satchel")) {
                    p.setDynamicProperty("satchel", true);
                    console.warn("Satchel active: Saving item");
                }
                else {
                    p.setDynamicProperty("satchel", false);
                    console.warn("Satchel disabled");
                }
            }
            else if (p.getDynamicProperty("satchelMode") === "Placing satchel") {
                console.warn("placing satchel");
            }
            else if (p.getDynamicProperty("satchelMode") === "Unpack") {
                console.warn("droping");
            }
            else {
                console.warn("Something else.");
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
    if (itemStack?.typeId === "dave:satchel") {
        system.run(() => {
            const satchelLore = itemStack.getLore();
            if (player.getDynamicProperty("satchelMode") === "Placing Block") {
                let lore = getParsedLore(satchelLore);
                let itemId = lore[0];
                let itemAmount = parseInt(lore[1]);
                if (itemAmount <= 0)
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
                        faceMap[blockFace]?.()?.setType(itemId);
                        itemStack.setLore([
                            `§r§7Item§e: ${itemId}`,
                            `§r§7Amount§e: ${itemAmount - 1}`,
                            `§r§7Mode§e: ${player.getDynamicProperty("satchelMode")}`,
                            `${satchelLore[3]}`
                        ]);
                        con?.setItem(player.selectedSlotIndex, itemStack);
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
