var behaviors = require('worker.behaviors');

var roleSupplier = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 reload');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ supply');
	    }

	    if(creep.memory.upgrading) {
	        behaviors.supplyTowers(creep);
        } else {
            behaviors.loadEnergyFromContainers(creep);
        }
	}
};

module.exports = roleSupplier;
