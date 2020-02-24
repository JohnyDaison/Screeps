var behaviors = require('worker.behaviors');

var roleLinkHandler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var roomMemory = creep.room.memory;

        if(!creep.memory.linkId) {
            for(var linkId in roomMemory.links) {
                var linkMemory = roomMemory.links[linkId];
                if(!linkMemory.handler) {
                    linkMemory.handler = creep.name;
                    creep.memory.linkId = linkId;
                    break;
                }
            }
        }

        if(creep.memory.linkId) {
            var linkMemory = roomMemory.links[creep.memory.linkId];
            var link = Game.getObjectById(creep.memory.linkId);

            if(!link) {
                creep.memory.linkId = null;
                return;
            }

            var inputMode = linkMemory.isInput;
            var outputMode = linkMemory.isOutput;

            if(!creep.memory.loading && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.loading = true;
                //creep.say('🔄 load');
    	    }
    	    if(creep.memory.loading && creep.store.getFreeCapacity() == 0) {
    	        creep.memory.loading = false;
    	        //creep.say('⚡ unload');
    	    }

            if(inputMode) {
        	    if(creep.memory.loading) {
        	        behaviors.loadEnergyFromLinkContainers(creep, link);
                } else {
                    behaviors.depositEnergy(creep, link);
                }
            } else if(outputMode) {
                if(creep.memory.loading) {
        	        behaviors.withdrawEnergy(creep, link);
                } else {
                    behaviors.transferEnergyToLinkContainers(creep, link);
                }
            }
        }
	}
};

module.exports = roleLinkHandler;
