//var resources = [RESOURCE_GHODIUM_OXIDE, RESOURCE_KEANIUM_OXIDE, RESOURCE_ZYNTHIUM_HYDRIDE, RESOURCE_UTRIUM_HYDRIDE, RESOURCE_ENERGY];
var resources = RESOURCES_ALL;
var materials = resources.filter((resource) => {
    return resource != RESOURCE_ENERGY;
});

var buildPriorityList = [STRUCTURE_SPAWN, STRUCTURE_WALL]; // STRUCTURE_RAMPART, STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_CONTAINER, STRUCTURE_SPAWN

function withdrawEnergy(creep, target) {
    var error = creep.withdraw(target, RESOURCE_ENERGY);
    if(error == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    return error;
}

function depositEnergy(creep, target) {
    var error = creep.transfer(target, RESOURCE_ENERGY);
    if(error == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    return error;
}

function withdrawMaterials(creep, target) {
    for(var mat of materials) {
        var error = creep.withdraw(target, mat);
        if(error == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            break;
        }
    }
    return error;
}

function depositMaterials(creep, target) {
    for(var mat of materials) {
        var error = creep.transfer(target, mat);
        if(error == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            break;
        }
    }
    return error;
}

function harvestSource(creep) {
    var source, harvestError;

    if (creep.memory.rememberedSourceId) {
        source = Game.getObjectById(creep.memory.rememberedSourceId);

        harvestError = creep.harvest(source);

        if(harvestError == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        } else if (harvestError != 0){
            creep.memory.rememberedSourceId = null;
            source = null;
        }
    }

    if(!source) {
        source = creep.pos.findClosestByPath(FIND_SOURCES, {
            filter: (sourc) => {
                return sourc.energy > 0;
            }
        });

        harvestError = creep.harvest(source);

        if(harvestError == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }

        if(harvestError == 0 || harvestError == ERR_NOT_IN_RANGE) {
            creep.memory.rememberedSourceId = source.id;
        } else {
            source = null;
        }
    }

    return source;
}

function harvestClosestSource(creep) {
    var source, harvestError;

    if (creep.memory.rememberedSourceId) {
        source = Game.getObjectById(creep.memory.rememberedSourceId);

        harvestError = creep.harvest(source);

        if(harvestError == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }

    if(!source) {
        source = creep.pos.findClosestByPath(FIND_SOURCES);
        if(source) {
            harvestError = creep.harvest(source);

            if(harvestError == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }

            creep.memory.rememberedSourceId = source.id;
        }
    }

    return source;
}

function harvestAssignedSource(creep) {
    var assignedSource, harvestError;

    if (creep.memory.rememberedSourceId) {
        assignedSource = Game.getObjectById(creep.memory.rememberedSourceId);

        harvestError = creep.harvest(assignedSource);

        if(harvestError == ERR_NOT_IN_RANGE) {
            creep.moveTo(assignedSource, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    } else {
        for(var sourceId in Memory.sources) {
            var sourceMemory = Memory.sources[sourceId];

            if(!sourceMemory.creeps) {
                Memory.sources[sourceId] = {
                    spawnName: "",
                    supplySpawn: false,
                    creeps: [],
                    desiredCreepCount: 0
                }
            }

            if(sourceMemory.spawnName == creep.memory.spawnName) {
                if(sourceMemory.creeps.length < sourceMemory.desiredCreepCount) {
                    sourceMemory.creeps.push(creep.name);
                    creep.memory.rememberedSourceId = sourceId;
                    creep.memory.supplySpawn = sourceMemory.supplySpawn;
                    break;
                } else {
                    sourceMemory.creeps.forEach((creepName) => {
                        if(!Game.creeps[creepName]) {
                            console.log("Creep " + creepName + " of source " + sourceId + " doesn't exist!");
                        }
                        if(Game.creeps[creepName].memory.role != "harvester") {
                            console.log("Creep " + creepName + " of source " + sourceId + " isn't harvester!");
                        }
                    });
                }
            }

        }
    }

    return creep.memory.rememberedSourceId;
}

function pickupDroppedResources(creep) {
    var drop = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
    if(drop) {
        if(creep.pickup(drop) == ERR_NOT_IN_RANGE) {
            creep.moveTo(drop, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }

    return drop;
}

function lootRuins(creep) {
    var ruin;
    var ruins = creep.room.find(FIND_RUINS, {
        filter: (ruin) => {
            return ruin.store.getUsedCapacity() > 0;
        }
    });
    if(ruins.length) {
        ruin = ruins[0];
        for(var res of resources) {
            if(creep.withdraw(ruin, res) == ERR_NOT_IN_RANGE) {
                creep.moveTo(ruin, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        found = true;
    }

    return ruin;
}

function lootTombstones(creep) {
    var tombstone;
    var tombstones = creep.room.find(FIND_TOMBSTONES, {
        filter: (tombstone) => {
            return tombstone.store.getFreeCapacity() < tombstone.store.getCapacity();
        }
    });
    if(tombstones.length) {
        tombstone = tombstones[0];
        for(var res of resources) {
            if(creep.withdraw(tombstone, res) == ERR_NOT_IN_RANGE) {
                creep.moveTo(tombstone, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        found = true;
    }

    return tombstone;
}

function unloadResources(creep) {
    var target;
    if(creep.memory.supplySpawn) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });
    }

    if(!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store.getFreeCapacity() > 0;
                }
        });
    }

    if(target) {
        for(var res of resources) {
            if(creep.transfer(target, res) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }

    return target;
}

function loadEnergyFromContainers(creep) {
    var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
                && structure.store[RESOURCE_ENERGY] > creep.store.getCapacity(RESOURCE_ENERGY);
        }
    });

    if(container) {
        withdrawEnergy(creep, container);
    }

    return container;
}

function loadEnergyFromFullestContainer(creep) {
    var fullestContainer;
    var maxEnergy = -1;

    var containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER)
                && (structure.store[RESOURCE_ENERGY] > 2*creep.store.getCapacity()
                    || structure.store.getFreeCapacity() == 0);
        }
    });

    containers.forEach((container) => {
        if(container.store[RESOURCE_ENERGY] > maxEnergy) {
            fullestContainer = container;
            maxEnergy = container.store[RESOURCE_ENERGY];
        }
    });

    if(fullestContainer) {
        withdrawEnergy(creep, fullestContainer);
    }

    return fullestContainer;
}

/** @param {Creep} creep **/
/** @param {StructureLink} link **/
function loadEnergyFromLinkContainers(creep, link) {
    var containers = link.pos.findInRange(FIND_STRUCTURES, 2, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
                && structure.store[RESOURCE_ENERGY] > creep.store.getCapacity(RESOURCE_ENERGY);
        }
    });

    var container = containers[0];

    if(container) {
        withdrawEnergy(creep, container);
    }

    return container;
}

/** @param {Creep} creep **/
/** @param {StructureLink} link **/
function transferEnergyToLinkContainers(creep, link) {
    var minContainer;
    var minEnergy = -1;

    var containers = link.pos.findInRange(FIND_STRUCTURES, 2, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
                && structure.store.getFreeCapacity() > 0;
        }
    });

    containers.forEach((container) => {
        var ratio = container.store[RESOURCE_ENERGY]/container.store.getCapacity();
        if(minEnergy == -1 || ratio < minEnergy) {
            minContainer = container;
            minEnergy = ratio;
        }
    });

    if(minContainer) {
        depositEnergy(creep, minContainer);
    }

    return minContainer;
}

function transferEnergyToEmptiestContainer(creep) {
    var minContainer;
    var minEnergy = -1;

    var containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
                && structure.store.getFreeCapacity() > 0;
        }
    });

    containers.forEach((container) => {
        var ratio = container.store[RESOURCE_ENERGY]/container.store.getCapacity();
        if(minEnergy == -1 || ratio < minEnergy) {
            minContainer = container;
            minEnergy = ratio;
        }
    });

    if(minContainer) {
        depositEnergy(creep, minContainer);
    }

    return minContainer;
}

function loadMaterialsFromContainersOnly(creep) {
    var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER)
                && structure.store.getUsedCapacity(RESOURCE_ENERGY) < structure.store.getUsedCapacity() && structure.store.getUsedCapacity() > 0;
        }
    });

    if(container) {
        withdrawMaterials(creep, container);
    }

    return container;
}

/** @param {Creep} creep **/
function transferMaterialsToStorage(creep) {
    var storages = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_STORAGE)
                && structure.store.getFreeCapacity() > 0;
        }
    });

    var notFullStorage = storages[0];

    if(notFullStorage) {
        depositMaterials(creep, notFullStorage);
    }

    return notFullStorage;
}

function upgradeControllerBehavior(creep) {
    var controller = creep.room.controller;

    if(controller) {
        var upgradeError = creep.upgradeController(controller);

        if(upgradeError == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
        } else if (upgradeError == ERR_NOT_OWNER){
            if(controller.owner) {
                attackControllerBehavior(creep);
            } else {
                claimControllerBehavior(creep);
            }
        } else if (upgradeError != 0){
            console.log("upgradeError", upgradeError);
        }
    }

    return controller;
}

function attackControllerBehavior(creep) {
    var controller = creep.room.controller;

    if(controller) {
        var attackError = creep.attackController(controller);

        if(attackError == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
        } else if (attackError != 0){
            console.log("attackError", attackError);
        }
    }

    return controller;
}

function claimControllerBehavior(creep) {
    var controller = creep.room.controller;

    if(controller) {
        var claimError = creep.claimController(controller);

        if(claimError == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
        } else if (claimError == ERR_GCL_NOT_ENOUGH) {
            reserveControllerBehavior(creep);
        } else if (claimError != 0) {
            console.log("claimError", claimError);
        }
    }

    return controller;
}

function reserveControllerBehavior(creep) {
    var controller = creep.room.controller;

    if(controller) {
        var reserveError = creep.reserveController(controller);

        if(reserveError == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
        } else if (reserveError != 0) {
            console.log("reserveError", reserveError);
        }
    }

    return controller;
}

function supplyTowers(creep) {
    var towers = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    var minTower;
    var minEnergy = -1;
    towers.forEach((tower) => {
        if(minEnergy == -1 || tower.store[RESOURCE_ENERGY] < minEnergy) {
            minEnergy = tower.store[RESOURCE_ENERGY];
            minTower = tower;
        }
    });

    if(minTower) {
        if(creep.transfer(minTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(minTower, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }

    return minTower;
}

function buildBehavior(creep) {
    var target, maxRatio;

    for(var prioType of buildPriorityList) {
        maxRatio = -1;
        target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: (site) => {
                if (site.structureType == prioType) {
                    var ratio = site.progress/site.progressTotal;
                    if(ratio >= maxRatio) {
                        maxRatio = ratio;
                        return true;
                    }
                }

                return false;
            }
        });

        if(target) {
            break;
        }
    }

    if(!target) {
        var maxRatio = -1;
        var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
            filter: (site) => {

                var ratio = site.progress/site.progressTotal;
                if(ratio >= maxRatio) {
                    maxRatio = ratio;
                    return true;
                }

                return false;
            }
        });
    }

    if(target) {
        if(creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }

    return target;
}

function repairBehavior(creep) {
    var minHits = -1;

    var target;
    target = Memory.repairTarget && Game.getObjectById(Memory.repairTarget);

    if(!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.hits < structure.hitsMax) {
                    if(minHits == -1 || structure.hits <= minHits) {
                        minHits = structure.hits;
                        return true;
                    }
                }

                return false;
            }
        });
    }

    if(target) {
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }

    return target;
}

function dismantleBehavior(creep) {
    var targetId, target;

    if(Memory.dismantleTargets.length) {
        targetId = Memory.dismantleTargets[0];
        target = Game.getObjectById(targetId);
        if(target) {
            if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            Memory.dismantleTargets.splice(0, 1);
        }
    }

    return target;
}

function attackCreepBehavior(creep, target) {
    var error = creep.attack(target);
    if(error == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    return error;
}

function attackCreepRangedBehavior(creep, target) {
    var error = creep.rangedAttack(target);
    if(error == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
    return error;
}

/** @param {Creep} creep **/
function moveToSpawn(creep) {
    var spawn = creep.room.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType === STRUCTURE_SPAWN})[0];

    if(spawn) {
        if(creep.pos.getRangeTo(spawn) > 3) {
            creep.moveTo(spawn);
        }
    }
}

module.exports = {
    withdrawEnergy,
    depositEnergy,
    harvestSource,
    harvestClosestSource,
    harvestAssignedSource,
    pickupDroppedResources,
    lootRuins,
    lootTombstones,
    unloadResources,
    loadEnergyFromContainers,
    loadEnergyFromFullestContainer,
    loadEnergyFromLinkContainers,
    transferEnergyToLinkContainers,
    transferEnergyToEmptiestContainer,
    loadMaterialsFromContainersOnly,
    transferMaterialsToStorage,
    upgradeControllerBehavior,
    attackControllerBehavior,
    claimControllerBehavior,
    reserveControllerBehavior,
    supplyTowers,
    buildBehavior,
    repairBehavior,
    dismantleBehavior,
    attackCreepBehavior,
    attackCreepRangedBehavior,
    moveToSpawn
};
