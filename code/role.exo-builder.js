var behaviors = require('worker.behaviors');

var roleExoBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 reload');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        behaviors.buildBehavior(creep);
	    } else {
            if(!behaviors.loadEnergyFromContainers(creep)) {
                behaviors.harvestClosestSource(creep);
            }
	    }
	}
};

module.exports = roleExoBuilder;
