var behaviors = require('worker.behaviors');

var roleExoHarvester = {

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
            behaviors.harvestClosestSource(creep);
        } else {
            behaviors.transferEnergyToEmptiestContainer(creep);
        }
	}
};

module.exports = roleExoHarvester;
