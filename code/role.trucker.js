var behaviors = require('worker.behaviors');

var roleTrucker = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(!creep.memory.fetching && creep.store[RESOURCE_ENERGY] == 0 &&
            !(creep.memory.followFlag == "Flag1" && creep.memory.flagReached)) {
            creep.memory.fetching = true;
            creep.memory.followFlag = "Flag1";
            creep.memory.flagReached = false;
            creep.say('🔄 fetch');
            //console.log(creep.name + " start fetch at ", creep.ticksToLive);
	    }
	    if(!creep.spawning && creep.memory.fetching && creep.store.getFreeCapacity() == 0 &&
            !(creep.memory.followFlag == "Flag2" && creep.memory.flagReached)) {
	        creep.memory.fetching = false;
            creep.memory.followFlag = "Flag2";
            creep.memory.flagReached = false;
	        creep.say('⚡ return');
            //console.log(creep.name + " start return at ", creep.ticksToLive);
	    }

        if(creep.memory.flagReached) {
    	    if(creep.memory.fetching) {
    	        behaviors.loadEnergyFromContainers(creep);
            } else {
                behaviors.unloadResources(creep);
            }
        }
	}
};

module.exports = roleTrucker;
