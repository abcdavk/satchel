var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _QIDB_instances, _QIDB_validNamespace, _QIDB_queuedKeys, _QIDB_settings, _QIDB_quickAccess, _QIDB_queuedValues, _QIDB_dimension, _QIDB_sL, _QIDB_load, _QIDB_save, _QIDB_queueSaving, _QIDB_romSave;
import { world, system, ItemStack, Player } from '@minecraft/server';
// About the project
// QIDB - QUICK ITEM DATABASE
// GitHub:          https://github.com/Carchi777/QUICK-ITEM-DATABASE
// Discord:         https://discord.com/channels/523663022053392405/1252014916496527380
// Made by Carchi77
// My Github:       https://github.com/Carchi777
// My Discord:      https://discordapp.com/users/985593016867778590
export class QIDB {
    /**
         * @param {string} namespace The unique namespace for the database keys.
         * @param {number} cacheSize Quick the max amount of keys to keep quickly accessible. A small size can couse lag on frequent iterated usage, a large number can cause high hardware RAM usage.
         * @param {number} saveRate the background saves per tick, (high performance impact) saveRate1 is 20 keys per second
         */
    constructor(namespace = "", cacheSize = 100, saveRate = 1) {
        _QIDB_instances.add(this);
        _QIDB_validNamespace.set(this, void 0);
        _QIDB_queuedKeys.set(this, void 0);
        _QIDB_settings.set(this, void 0);
        _QIDB_quickAccess.set(this, void 0);
        _QIDB_queuedValues.set(this, void 0);
        _QIDB_dimension.set(this, void 0);
        _QIDB_sL.set(this, void 0);
        __classPrivateFieldSet(this, _QIDB_settings, {
            namespace: namespace
        }, "f");
        __classPrivateFieldSet(this, _QIDB_queuedKeys, [], "f");
        __classPrivateFieldSet(this, _QIDB_queuedValues, [], "f");
        __classPrivateFieldSet(this, _QIDB_quickAccess, new Map(), "f");
        __classPrivateFieldSet(this, _QIDB_validNamespace, /^[A-Za-z0-9_]*$/.test(__classPrivateFieldGet(this, _QIDB_settings, "f").namespace), "f");
        __classPrivateFieldSet(this, _QIDB_dimension, world.getDimension("overworld"), "f");
        this.logs = {
            startUp: true,
            save: false,
            load: false,
            set: false,
            get: false,
            has: false,
            delete: false,
            clear: false,
            values: false,
            keys: false,
        };
        let sl = world.scoreboard.getObjective('qidb');
        __classPrivateFieldGet(this, _QIDB_sL, "f");
        const player = world.getPlayers()[0];
        if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
            throw new Error(`§cQIDB > ${namespace} isn't a valid namespace. accepted char: A-Z a-z 0-9 _`);
        if (player)
            if (!sl || sl?.hasParticipant('x') === false) {
                if (!sl)
                    sl = world.scoreboard.addObjective('qidb');
                sl.setScore('x', player.location.x);
                sl.setScore('z', player.location.z);
                __classPrivateFieldSet(this, _QIDB_sL, { x: sl.getScore('x'), y: 318, z: sl.getScore('z') }, "f");
                __classPrivateFieldGet(this, _QIDB_dimension, "f").runCommand(`/tickingarea add ${__classPrivateFieldGet(this, _QIDB_sL, "f").x} 319 ${__classPrivateFieldGet(this, _QIDB_sL, "f").z} ${__classPrivateFieldGet(this, _QIDB_sL, "f").x} 318 ${__classPrivateFieldGet(this, _QIDB_sL, "f").z} storagearea`);
                this.logs.startUp == true && console.log(`§qQIDB > is initialized successfully. namespace: ${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}`);
            }
            else {
                __classPrivateFieldSet(this, _QIDB_sL, { x: sl.getScore('x'), y: 318, z: sl.getScore('z') }, "f");
                this.logs.startUp == true && console.log(`§qQIDB > is initialized successfully. namespace: ${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}`);
            }
        world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
            if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
                throw new Error(`§cQIDB > ${namespace} isn't a valid namespace. accepted char: A-Z a-z 0-9 _`);
            if (!initialSpawn)
                return;
            if (!sl || sl?.hasParticipant('x') === false) {
                if (!sl)
                    sl = world.scoreboard.addObjective('qidb');
                sl.setScore('x', player.location.x);
                sl.setScore('z', player.location.z);
                __classPrivateFieldSet(this, _QIDB_sL, { x: sl.getScore('x'), y: 318, z: sl.getScore('z') }, "f");
                __classPrivateFieldGet(this, _QIDB_dimension, "f").runCommand(`/tickingarea add ${__classPrivateFieldGet(this, _QIDB_sL, "f").x} 319 ${__classPrivateFieldGet(this, _QIDB_sL, "f").z} ${__classPrivateFieldGet(this, _QIDB_sL, "f").x} 318 ${__classPrivateFieldGet(this, _QIDB_sL, "f").z} storagearea`);
                this.logs.startUp == true && console.log(`§qQIDB > is initialized successfully. namespace: ${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}`);
            }
            else {
                try {
                    sl.getScore('x');
                }
                catch {
                    console.log(`§cQIDB > Initialization Error. namespace: ${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}`);
                }
                __classPrivateFieldSet(this, _QIDB_sL, { x: sl.getScore('x'), y: 318, z: sl.getScore('z') }, "f");
                this.logs.startUp == true && console.log(`§qQIDB > is initialized successfully. namespace: ${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}`);
            }
        });
        // save
        let show = true;
        let runId;
        const self = this;
        let lastam;
        system.runInterval(() => {
            const diff = __classPrivateFieldGet(self, _QIDB_quickAccess, "f").size - cacheSize;
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    __classPrivateFieldGet(self, _QIDB_quickAccess, "f").delete(__classPrivateFieldGet(self, _QIDB_quickAccess, "f").keys().next()?.value);
                }
            }
            if (__classPrivateFieldGet(self, _QIDB_queuedKeys, "f").length) {
                if (!runId) {
                    log();
                    runId = system.runInterval(() => {
                        log();
                    }, 120);
                }
                show = false;
                const start = Date.now();
                const k = Math.min(saveRate, __classPrivateFieldGet(this, _QIDB_queuedKeys, "f").length);
                for (let i = 0; i < k; i++) {
                    __classPrivateFieldGet(this, _QIDB_instances, "m", _QIDB_romSave).call(this, __classPrivateFieldGet(this, _QIDB_queuedKeys, "f")[0], __classPrivateFieldGet(this, _QIDB_queuedValues, "f")[0]);
                    // log here
                    __classPrivateFieldGet(this, _QIDB_queuedKeys, "f").shift();
                    __classPrivateFieldGet(this, _QIDB_queuedValues, "f").shift();
                }
            }
            else if (runId) {
                system.clearRun(runId);
                runId = undefined;
                show == false && this.logs.save == true && console.log("§aQIDB >Saved, You can now close the world safely.");
                show = true;
                return;
            }
            else
                return;
        }, 1);
        function log() {
            const abc = (-(__classPrivateFieldGet(self, _QIDB_queuedKeys, "f").length - lastam) / 6).toFixed(0) || '//';
            self.logs.save == true && console.log(`§eQIDB > Saving, Dont close the world.\n§r[Stats]-§eRemaining: ${__classPrivateFieldGet(self, _QIDB_queuedKeys, "f").length} keys | speed: ${abc} keys/s`);
            lastam = __classPrivateFieldGet(self, _QIDB_queuedKeys, "f").length;
        }
        world.beforeEvents.playerLeave.subscribe(() => {
            if (__classPrivateFieldGet(this, _QIDB_queuedKeys, "f").length && world.getPlayers().length < 2) {
                console.error(`\n\n\n\n§cQIDB > Fatal Error > World closed too early, items not saved correctly. \n\n` +
                    `Namespace: ${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}\n` +
                    `Lost Keys amount: ${__classPrivateFieldGet(this, _QIDB_queuedKeys, "f").length}\n\n\n\n`);
            }
        });
    }
    /**
     * Sets a value as a key in the item database.
     * @param {string} key The unique identifier of the value.
     * @param {ItemStack[] | ItemStack} value The `ItemStack[]` or `itemStack` value to set.
     * @throws Throws if `value` is an array that has more than 255 items.
     */
    set(key, value) {
        if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
            throw new Error(`§cQIDB > Invalid name: <${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}>. accepted char: A-Z a-z 0-9 _`);
        if (!/^[A-Za-z0-9_]*$/.test(key))
            throw new Error(`§cQIDB > Invalid name: <${key}>. accepted char: A-Z a-z 0-9 _`);
        const time = Date.now();
        key = __classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":" + key;
        if (Array.isArray(value)) {
            if (value.length > 255)
                throw new Error(`§cQIDB > Out of range: <${key}> has more than 255 ItemStacks`);
            world.setDynamicProperty(key, true);
        }
        else {
            world.setDynamicProperty(key, false);
        }
        __classPrivateFieldGet(this, _QIDB_quickAccess, "f").set(key, value);
        if (__classPrivateFieldGet(this, _QIDB_queuedKeys, "f").includes(key)) {
            const i = __classPrivateFieldGet(this, _QIDB_queuedKeys, "f").indexOf(key);
            __classPrivateFieldGet(this, _QIDB_queuedValues, "f").splice(i, 1);
            __classPrivateFieldGet(this, _QIDB_queuedKeys, "f").splice(i, 1);
        }
        __classPrivateFieldGet(this, _QIDB_instances, "m", _QIDB_queueSaving).call(this, key, value);
        this.logs.set == true && console.log(`§aQIDB > Set key <${key}> succesfully. ${Date.now() - time}ms`);
    }
    /**
     * Gets the value of a key from the item database.
     * @param {string} key The identifier of the value.
     * @returns {ItemStack | ItemStack[]} The `ItemStack` | `ItemStack[]` saved as `key`
     * @throws Throws if the key doesn't exist.
     */
    get(key) {
        if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
            throw new Error(`§cQIDB > Invalid name: <${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}>. accepted char: A-Z a-z 0-9 _`);
        if (!/^[A-Za-z0-9_]*$/.test(key))
            throw new Error(`§cQIDB > Invalid name: <${key}>. accepted char: A-Z a-z 0-9 _`);
        const time = Date.now();
        key = __classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":" + key;
        if (__classPrivateFieldGet(this, _QIDB_quickAccess, "f").has(key)) {
            this.logs.get == true && console.log(`§aQIDB > Got key <${key}> succesfully. ${Date.now() - time}ms`);
            return __classPrivateFieldGet(this, _QIDB_quickAccess, "f").get(key);
        }
        const structure = world.structureManager.get(key);
        if (!structure)
            throw new Error(`§cQIDB > The key < ${key} > doesn't exist.`);
        const { canStr, inv } = __classPrivateFieldGet(this, _QIDB_instances, "m", _QIDB_load).call(this, key);
        const items = [];
        for (let i = 0; i < 256; i++)
            items.push(inv.getItem(i));
        for (let i = 255; i >= 0; i--)
            if (!items[i])
                items.pop();
            else
                break;
        __classPrivateFieldGet(this, _QIDB_instances, "m", _QIDB_save).call(this, key, canStr);
        this.logs.get == true && console.log(`§aQIDB > Got items from <${key}> succesfully. ${Date.now() - time}ms`);
        if (world.getDynamicProperty(key)) {
            __classPrivateFieldGet(this, _QIDB_quickAccess, "f").set(key, items);
            return items;
        }
        else {
            __classPrivateFieldGet(this, _QIDB_quickAccess, "f").set(key, items[0]);
            return items[0];
        }
    }
    /**
     * Checks if a key exists in the item database.
     * @param {string} key The identifier of the value.
     * @returns {boolean}`true` if the key exists, `false` if the key doesn't exist.
     */
    has(key) {
        if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
            throw new Error(`§cQIDB > Invalid name: <${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}>. accepted char: A-Z a-z 0-9 _`);
        if (!/^[A-Za-z0-9_]*$/.test(key))
            throw new Error(`§cQIDB > Invalid name: <${key}>. accepted char: A-Z a-z 0-9 _`);
        const time = Date.now();
        key = __classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":" + key;
        const exist = __classPrivateFieldGet(this, _QIDB_quickAccess, "f").has(key) || world.structureManager.get(key);
        this.logs.has == true && console.log(`§aQIDB > Found key <${key}> succesfully. ${Date.now() - time}ms`);
        if (exist)
            return true;
        else
            return false;
    }
    /**
     * Deletes a key from the item database.
     * @param {string} key The identifier of the value.
                    * @throws Throws if the key doesn't exist.
                    */
    delete(key) {
        if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
            throw new Error(`§cQIDB > Invalid name: <${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}>. accepted char: A-Z a-z 0-9 _`);
        if (!/^[A-Za-z0-9_]*$/.test(key))
            throw new Error(`§cQIDB > Invalid name: <${key}>. accepted char: A-Z a-z 0-9 _`);
        const time = Date.now();
        key = __classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":" + key;
        if (__classPrivateFieldGet(this, _QIDB_quickAccess, "f").has(key))
            __classPrivateFieldGet(this, _QIDB_quickAccess, "f").delete(key);
        const structure = world.structureManager.get(key);
        if (structure)
            world.structureManager.delete(key), world.setDynamicProperty(key, null);
        else
            throw new Error(`§cQIDB > The key <${key}> doesn't exist.`);
        this.logs.delete == true && console.log(`§aQIDB > Deleted key <${key}> succesfully. ${Date.now() - time}ms`);
    }
    /**
     * Gets all the keys of your namespace from item database.
     * @return {string[]} All the keys as an array of strings.
                        */
    keys() {
        if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
            throw new Error(`§cQIDB > Invalid name: <${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}>. accepted char: A-Z a-z 0-9 _`);
        const allIds = world.getDynamicPropertyIds();
        const ids = [];
        allIds.filter(id => id.startsWith(__classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":")).forEach(id => ids.push(id.replace(__classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":", "")));
        this.logs.keys == true && console.log(`§aQIDB > Got the list of all the ${ids.length} keys.`);
        return ids;
    }
    /**
     * Gets all the keys of your namespace from item database (takes some time if values aren't alredy loaded in quickAccess).
     * @return {ItemStack[][]} All the values as an array of ItemStack or ItemStack[].
                            */
    values() {
        if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
            throw new Error(`§cQIDB > Invalid name: <${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}>. accepted char: A-Z a-z 0-9 _`);
        const time = Date.now();
        const allIds = world.getDynamicPropertyIds();
        const values = [];
        const filtered = allIds.filter(id => id.startsWith(__classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":")).map(id => id.replace(__classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":", ""));
        for (const key of filtered) {
            values.push(this.get(key));
        }
        this.logs.values == true && console.log(`§aQIDB > Got the list of all the ${values.length} values. ${Date.now() - time}ms`);
        return values;
    }
    /**
     * Clears all, CAN NOT REWIND.
     */
    clear() {
        if (!__classPrivateFieldGet(this, _QIDB_validNamespace, "f"))
            throw new Error(`§cQIDB > Invalid name: <${__classPrivateFieldGet(this, _QIDB_settings, "f").namespace}>. accepted char: A-Z a-z 0-9 _`);
        const time = Date.now();
        const allIds = world.getDynamicPropertyIds();
        const filtered = allIds.filter(id => id.startsWith(__classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":")).map(id => id.replace(__classPrivateFieldGet(this, _QIDB_settings, "f").namespace + ":", ""));
        for (const key of filtered) {
            this.delete(key);
        }
        this.logs.clear == true && console.log(`§aQIDB > Cleared, deleted ${filtered.length} values. ${Date.now() - time}ms`);
    }
}
_QIDB_validNamespace = new WeakMap(), _QIDB_queuedKeys = new WeakMap(), _QIDB_settings = new WeakMap(), _QIDB_quickAccess = new WeakMap(), _QIDB_queuedValues = new WeakMap(), _QIDB_dimension = new WeakMap(), _QIDB_sL = new WeakMap(), _QIDB_instances = new WeakSet(), _QIDB_load = function _QIDB_load(key) {
    if (key.length > 30)
        throw new Error(`§cQIDB > Out of range: <${key}> has more than 30 characters`);
    let canStr = false;
    try {
        world.structureManager.place(key, __classPrivateFieldGet(this, _QIDB_dimension, "f"), __classPrivateFieldGet(this, _QIDB_sL, "f"), { includeEntities: true });
        canStr = true;
    }
    catch {
        __classPrivateFieldGet(this, _QIDB_dimension, "f").spawnEntity("qidb:storage", __classPrivateFieldGet(this, _QIDB_sL, "f"));
    }
    const entities = __classPrivateFieldGet(this, _QIDB_dimension, "f").getEntities({ location: __classPrivateFieldGet(this, _QIDB_sL, "f"), type: "qidb:storage" });
    if (entities.length > 1)
        entities.forEach((e, index) => entities[index + 1]?.remove());
    const entity = entities[0];
    const inv = entity.getComponent("inventory").container;
    this.logs.load == true && console.log(`§aQIDB > Loaded entity <${key}>`);
    return { canStr, inv };
}, _QIDB_save = async function _QIDB_save(key, canStr) {
    if (canStr)
        world.structureManager.delete(key);
    world.structureManager.createFromWorld(key, __classPrivateFieldGet(this, _QIDB_dimension, "f"), __classPrivateFieldGet(this, _QIDB_sL, "f"), __classPrivateFieldGet(this, _QIDB_sL, "f"), { saveMode: "World", includeEntities: true });
    const entities = __classPrivateFieldGet(this, _QIDB_dimension, "f").getEntities({ location: __classPrivateFieldGet(this, _QIDB_sL, "f"), type: "qidb:storage" });
    entities.forEach(e => e.remove());
}, _QIDB_queueSaving = async function _QIDB_queueSaving(key, value) {
    __classPrivateFieldGet(this, _QIDB_queuedKeys, "f").push(key);
    __classPrivateFieldGet(this, _QIDB_queuedValues, "f").push(value);
}, _QIDB_romSave = async function _QIDB_romSave(key, value) {
    const { canStr, inv } = __classPrivateFieldGet(this, _QIDB_instances, "m", _QIDB_load).call(this, key);
    if (!value)
        for (let i = 0; i < 256; i++)
            inv.setItem(i, undefined), world.setDynamicProperty(key, null);
    if (Array.isArray(value)) {
        try {
            for (let i = 0; i < 256; i++)
                inv.setItem(i, value[i] || undefined);
        }
        catch {
            throw new Error(`§cQIDB > Invalid value type. supported: ItemStack | ItemStack[] | undefined`);
        }
        world.setDynamicProperty(key, true);
    }
    else {
        try {
            inv.setItem(0, value), world.setDynamicProperty(key, false);
        }
        catch {
            throw new Error(`§cQIDB > Invalid value type. supported: ItemStack | ItemStack[] | undefined`);
        }
    }
    __classPrivateFieldGet(this, _QIDB_instances, "m", _QIDB_save).call(this, key, canStr);
};
