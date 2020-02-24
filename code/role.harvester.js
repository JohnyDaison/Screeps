var behaviors = require('worker.behaviors');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.storing && creep.store.getFreeCapacity() == creep.store.getCapacity()) {
            creep.memory.storing = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.storing && creep.store.getFreeCapacity() == 0) {
	        creep.memory.storing = true;
	        creep.say('⚡ store');
	    }

	    if(!creep.memory.storing) {
            behaviors.harvestAssignedSource(creep);
        } else {
            behaviors.unloadResources(creep);
        }
	}
};

module.exports = roleHarvester;
