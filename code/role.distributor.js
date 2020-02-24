var behaviors = require('worker.behaviors');

var roleDistributor = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.storing && creep.store.getUsedCapacity() == 0) {
            creep.memory.storing = false;
            creep.say('🔄 collect');
	    }
	    if(!creep.memory.storing && creep.store.getUsedCapacity() > creep.store.getCapacity()/2) {
	        creep.memory.storing = true;
	        creep.say('⚡ store');
	    }

	    if(!creep.memory.storing) {
            var found = false;

            if(!found) {
                found = behaviors.pickupDroppedResources(creep);
            }

            if(!found) {
                found = behaviors.lootRuins(creep);
            }

            if(!found) {
                found = behaviors.lootTombstones(creep);
            }

            if(!found) {
                found = behaviors.loadMaterialsFromContainersOnly(creep);
            }

            if(!found) {
                found = behaviors.loadEnergyFromFullestContainer(creep);
            }

            if(!found) {
                found = behaviors.moveToSpawn(creep);
            }

        } else {
            if(creep.store.getUsedCapacity() > creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
                var unloaded = false;

                if(!unloaded) {
                    unloaded = behaviors.transferMaterialsToStorage(creep);
                }

                if(!unloaded) {
                    unloaded = behaviors.unloadResources(creep);
                }
            } else {
                behaviors.transferEnergyToEmptiestContainer(creep);
            }
        }
	}
};

module.exports = roleDistributor;
