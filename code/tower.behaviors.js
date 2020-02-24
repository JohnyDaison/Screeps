var minWallHits = 1000000;
var desiredWallHits = 10000000;

function repairWeakestStructure(tower, structures, byRatio = false) {
    var minRatio = -1;
    var minHits = -1;
    var minStructure;
    structures.forEach((structure) => {
        var ratio = structure.hits/structure.hitsMax;
        if(minHits == -1
                || (!byRatio && structure.hits < minHits)
                || (byRatio && ratio < minRatio)) {
            minHits = structure.hits;
            minRatio = ratio;
            minStructure = structure;
        }
    });

    if (minStructure) {
        tower.repair(minStructure);
    }

    return minStructure;
}

function towerBehavior(tower) {
    var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    var healer = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: (creep) => {
            return creep.body.find((part) => {
                return part.type == HEAL;
            });
        }
    });


    /*if (healer) {
        tower.attack(healer);
    } else if (target) {
        tower.attack(target);
    } else */ if (tower.store[RESOURCE_ENERGY] > tower.store.getCapacity(RESOURCE_ENERGY) * 0.6) {
        var repairStructure;

        if (!repairStructure) {
            var walls = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_WALL && structure.hits < (structure.hitsMax - TOWER_POWER_REPAIR) && structure.hits < (minWallHits - TOWER_POWER_REPAIR);
                }
            });

            repairStructure = repairWeakestStructure(tower, walls);
        }
        /*
        if (!repairStructure) {
            var structures = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_ROAD
                            || structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_TOWER)
                        && structure.hits < (structure.hitsMax - TOWER_POWER_REPAIR);
                }
            });

            repairStructure = repairWeakestStructure(tower, structures);
        }
        */

        if (!repairStructure) {
            var walls = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_WALL && structure.hits < (structure.hitsMax - TOWER_POWER_REPAIR) && structure.hits < (desiredWallHits - TOWER_POWER_REPAIR);
                }
            });

            repairStructure = repairWeakestStructure(tower, walls);
        }
    }
}

module.exports = {
    towerBehavior
};
