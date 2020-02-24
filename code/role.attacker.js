var behaviors = require('worker.behaviors');

var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var enemy;

        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var healer = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: (creep) => {
                return creep.body.find((part) => {
                    return part.type == HEAL;
                });
            }
        });

        if (healer) {
            behaviors.attackCreepBehavior(creep, healer);
        } else if (target) {
            behaviors.attackCreepBehavior(creep, target);
        }
	}
};

module.exports = roleAttacker;
