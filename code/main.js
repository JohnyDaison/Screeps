var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleSupplier = require('role.supplier');
var roleDistributor = require('role.distributor');
var roleDismantler = require('role.dismantler');
var roleRepairer = require('role.repairer');
var roleExoBuilder = require('role.exo-builder');
var roleExoHarvester = require('role.exo-harvester');
var roleTrucker = require('role.trucker');
var roleLinkHandler = require('role.link-handler');
var roleAttacker = require('role.attacker');
var roleRangedAttacker = require('role.ranged-attacker');
var towerBehavior = require('tower.behaviors').towerBehavior;
var linkBehavior = require('link.behaviors').linkBehavior;

var roleMap = {
    "harvester": roleHarvester,
    "builder": roleBuilder,
    "upgrader": roleUpgrader,
    "supplier": roleSupplier,
    "distributor": roleDistributor,
    "dismantler": roleDismantler,
    "repairer": roleRepairer,
    "exobuilder": roleExoBuilder,
    "exorepairer": roleRepairer,
    "exoharvester": roleExoHarvester,
    "exoupgrader": roleUpgrader,
    "exodistributor": roleDistributor,
    "exosupplier": roleSupplier,
    "trucker": roleTrucker,
    "linkhandler": roleLinkHandler,
    "attacker": roleAttacker,
    "rangedattacker": roleRangedAttacker,
};

var tagMap = {
    "trucker": "T",
    "exorepairer": "ER",
    "distributor": "D",
    /*
    "exodistributor": "ED",
    "supplier": "S",
    "harvester": "x",
    */
}

module.exports.initMemory = function()  {
    if(!Memory.spawnPriority) {
        Memory.spawnPriority = [];
    }

    for(var role in roleMap) {
        if(!Memory.spawnPriority.includes(role)) {
            Memory.spawnPriority.push(role);
        }
    }

    for(var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        var memory = spawn.memory;

        if(!memory.desiredCreepCount) {
            memory.desiredCreepCount = {};
        }

        if(!memory.currentCreepCount) {
            memory.currentCreepCount = {};
        }

        for(var role in roleMap) {
            if(memory.desiredCreepCount[role] == null) {
                memory.desiredCreepCount[role] = 0;
            }
        }

        if(!Memory.rooms) {
            Memory.rooms = {};
        }

        if(!Memory.rooms[spawn.room.name]) {
            Memory.rooms[spawn.room.name] = {
                links: {}
            };
        }

        var roomMemory = spawn.room.memory;

        var links = spawn.room.find(FIND_MY_STRUCTURES, {filter: (structure) => structure.structureType === STRUCTURE_LINK});

        links.forEach((link) => {
            if(!roomMemory.links[link.id]) {
                roomMemory.links[link.id] = {
                    isInput: false,
                    isOutput: false,
                    handler: null
                }
            }
        });
    }

    if(!Memory.currentCreepCount) {
        Memory.currentCreepCount = {};
    }

    if(!Memory.dismantleTargets) {
        Memory.dismantleTargets = [];
    }
};

function getCreepParts(role, energyLimit) {
    var desired = getDesiredCreepParts(role);
    console.log(desired);
    var origCost = getBodyCost(desired);

    if(origCost > energyLimit) {
        console.log(origCost);
        var ratio = energyLimit/origCost;
        console.log(ratio);
        var partsObj = partsArrayToObj(desired);
        for(var part in partsObj) {
            if(part === MOVE) {
                partsObj[part] = Math.max(1, Math.ceil(partsObj[part] * ratio));
            } else {
                partsObj[part] = Math.max(1, Math.floor(partsObj[part] * ratio));
            }
        }

        var parts = partsObjToArray(partsObj);

        console.log(parts);
        var newCost = getBodyCost(parts);
        console.log(newCost);


        return parts;
    }

    return desired;
}

function partsArrayToObj(parts) {
    var obj = {};

    parts.forEach((part) => {
        if(obj[part] == null) {
            obj[part] = 0;
        }

        obj[part]++;
    });

    return obj;
}

function partsObjToArray(partsObj) {
    var parts = [];

    for(var part in partsObj) {
        for(var i=0; i < partsObj[part]; i++) {
            parts.push(part);
        }
    }

    return parts;
}

function getDesiredCreepParts(role) {
    switch(role) {
        case "harvester":
        case "exoharvester":
            return [WORK,WORK,WORK,WORK, CARRY,CARRY,CARRY,CARRY, MOVE,MOVE,MOVE,MOVE];
            break;

        case "upgrader":
        case "exoupgrader":
            return [WORK,WORK, CARRY,CARRY,CARRY,CARRY, MOVE,MOVE,MOVE];
            break;
            /*
        case "exoupgrader":
            return [CLAIM, WORK, CARRY, MOVE,MOVE];
            break;
            */
        case "builder":
        case "exobuilder":
        case "repairer":
        case "exorepairer":
            return [WORK,WORK,WORK, CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, MOVE,MOVE,MOVE,MOVE,MOVE];
            break;

        case "supplier":
        case "exosupplier":
            return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, MOVE,MOVE,MOVE,MOVE];
            break;

        case "distributor":
        case "exodistributor":
            return [CARRY,CARRY,CARRY,CARRY, MOVE,MOVE,MOVE,MOVE];
            break;

        case "trucker":
            return [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY, MOVE,MOVE,MOVE,MOVE];
            break;

        case "dismantler":
            return [WORK,WORK,WORK,WORK,WORK, MOVE,MOVE,MOVE];
            break;

        case "linkhandler":
            return [CARRY, MOVE];
            break;

        case "attacker":
            return [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK];
            break;

        case "rangedattacker":
            return [MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK];
            break;
    }

    return [];
}

function getBodyCost(parts) {
    var cost = 0;

    parts.forEach((part) => {
        cost += BODYPART_COST[part];
    });

    return cost;
}

function autoSpawnCreeps(spawn, role) {
    var spawnMemory = spawn.memory;
    var desiredCount = spawn.memory.desiredCreepCount[role];
    var wannaSpawn = false;
    var creeps = _.filter(Game.creeps, (creep) => {
        return creep.memory.role == role && creep.memory.spawnName == spawn.name;
    });

    spawnMemory.currentCreepCount[role] = creeps.length;
    if(spawnMemory.currentCreepCount[role] < desiredCount) {
        makeSpawnReport(spawn, role + 's: ' + creeps.length + " should be " + desiredCount);
    }

    var spawnBusy = (spawn.spawning && spawn.spawning.remainingTime > 0);

    if(!spawnBusy && creeps.length < desiredCount) {
        var newName = role + Game.time;
        var parts = getCreepParts(role, spawn.room.energyCapacityAvailable);
        var cost = getBodyCost(parts);

        if (parts.length) {
            makeSpawnReport(spawn, 'Cost: ' + cost + " Energy: " + spawn.room.energyAvailable + "/" + spawn.room.energyCapacityAvailable);
            wannaSpawn = true;
            var newMemory = {role: role, spawnName: spawn.name};
            if(role.substr(0,3) == "exo") {
                newMemory.followFlag = "Flag1";
            }
            if(role.includes("attacker")) {
                var enemy = spawn.room.find(FIND_HOSTILE_CREEPS)[0];
                if(!enemy) {
                    newMemory.followFlag = "AttackFlag";
                }
            }
            var spawnError = spawn.spawnCreep(parts, newName, {memory: newMemory});
            if(spawnError != 0) {
                makeSpawnReport(spawn, "spawnError: "+ spawnError);
                wannaSpawn = false;
            } else {
                makeSpawnReport(spawn, 'Spawning new ' + role + ': ' + newName);
                //makeSpawnReport(spawn, 'with memory ' + JSON.stringify(newMemory));
            }
        } else {
            makeSpawnReport(spawn, "Unknown role: " + role);
        }
    }

    return wannaSpawn;
}

function makeSpawnReport(spawn, message) {
    if(spawn.memory.report == null) {
        spawn.memory.report = [];
    }

    spawn.memory.report.push(message);
}

function postSpawnReport(spawn) {
    var report = spawn.memory.report;
    if(!report) {
        return;
    }

    if(report.length) {
        report.unshift(spawn.name);
        report.unshift("----------");
    }

    for(var line of report) {
        console.log(line);
    }

    spawn.memory.report = [];
}

function memoryCleanup() {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            var creepMemory = Memory.creeps[name];

            var sourceId = creepMemory.rememberedSourceId;
            // console.log('sourceId: ', sourceId);
            if(sourceId) {
                var sourceMemory = Memory.sources[sourceId];
                if(sourceMemory) {
                    var creepList = sourceMemory.creeps;
                    var index = creepList.indexOf(name);
                    if(index > -1) {
                        creepList.splice(index, 1);
                        console.log('Removing non-existing creep from sourceMemory:', name);
                    }
                }
            }

            var linkId = creepMemory.linkId;
            if(linkId) {
                for(var roomName in Memory.rooms) {
                    var roomMemory = Memory.rooms[roomName];
                    if(roomMemory.links[linkId]) {
                        roomMemory.links[linkId].handler = null;
                    }
                }
            }

            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

function autoAdjustDesiredCreepCount(spawn, role, condition, count = 1) {
    var memory = spawn.memory;

    if(condition && memory.desiredCreepCount[role] == 0) {
        memory.desiredCreepCount[role] = count;
    }
    if(!condition && memory.desiredCreepCount[role] > 0) {
        memory.desiredCreepCount[role] = 0;
    }
}

module.exports.loop = function () {
    memoryCleanup();

    // handle spawns
    for(var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        var sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        var enemyCreeps = spawn.room.find(FIND_HOSTILE_CREEPS);

        // adjust desired creep counts
        autoAdjustDesiredCreepCount(spawn, "builder", sites.length > 0);
        autoAdjustDesiredCreepCount(spawn, "distributor", enemyCreeps.length > 0);
        autoAdjustDesiredCreepCount(spawn, "attacker", enemyCreeps.length > 0, 2);
        autoAdjustDesiredCreepCount(spawn, "rangedattacker", enemyCreeps.length > 0, 2);

        // auto spawn
        for(var role of Memory.spawnPriority) {
            if(autoSpawnCreeps(spawn, role)) {
                break;
            }
        }

        // display spawning and assign spawn
        if(spawn.spawning && spawn.spawning.remainingTime) {
            var spawningCreep = Game.creeps[spawn.spawning.name];

            spawn.room.visual.text(
                'Building: ' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }

        postSpawnReport(spawn);
    }

    // structure behavior
    for(var structureName in Game.structures) {
        var structure = Game.structures[structureName];
        if(structure.structureType == STRUCTURE_TOWER) {
            towerBehavior(structure);
        }
        if(structure.structureType == STRUCTURE_LINK) {
            linkBehavior(structure);
        }
    }

    // creep behavior
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        var role = creep.memory.role;
        var flagName = creep.memory.followFlag;
        var flagReached = creep.memory.flagReached;
        var roleClass = roleMap[role];
        var creepTag = tagMap[role];

        if(creepTag) {
            creep.room.visual.text(
                creepTag,
                creep.pos.x,
                creep.pos.y,
                {align: 'left', opacity: 0.8});
        }

        if(flagName && !flagReached) {
            var flag = Game.flags[flagName]
            creep.moveTo(flag);
            if(creep.pos.getRangeTo(flag) <= 2) {
                creep.memory.flagReached = true;
            }
        } else if(roleClass) {
            roleClass.run(creep);
        } else {
            console.log("No class for role " + role + " at " + creep.name);
        }
    }
}

module.exports.getDesiredCreepParts = getDesiredCreepParts;

module.exports.getBodyCost = function (role) {
    return getBodyCost(getDesiredCreepParts(role));
};

module.exports.partsObjToArray = partsObjToArray;
