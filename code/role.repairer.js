var behaviors = require('worker.behaviors');

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 reload');
	    }
	    if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
	        creep.memory.repairing = true;
	        creep.say('🚧 repair');
	    }

	    if(creep.memory.repairing) {
	        behaviors.repairBehavior(creep);
	    }
	    else {
            behaviors.loadEnergyFromContainers(creep);
	    }
	}
};

module.exports = roleRepairer;
