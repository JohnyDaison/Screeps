var behaviors = require('worker.behaviors');

var roleDismantler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        behaviors.dismantleBehavior(creep);
	}
};

module.exports = roleDismantler;
