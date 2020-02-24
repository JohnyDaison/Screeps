var behaviors = require('worker.behaviors');

var roleRangedAttacker = {

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
            behaviors.attackCreepRangedBehavior(creep, healer);
        } else if (target) {
            behaviors.attackCreepRangedBehavior(creep, target);
        }
	}
};

module.exports = roleRangedAttacker;
