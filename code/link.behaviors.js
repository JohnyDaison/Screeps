function linkBehavior(link) {
    var roomMemory = link.room.memory;
    var myLinkMemory = roomMemory.links[link.id];
    for (var linkId in roomMemory.links) {
        if(linkId === link.id) {
            continue;
        }
        var otherLinkMemory = roomMemory.links[linkId];

        if(myLinkMemory.isInput && otherLinkMemory.isOutput) {
            var otherLink = Game.getObjectById(linkId);
            if(link.store[RESOURCE_ENERGY] > 0 && otherLink && otherLink.store.getFreeCapacity(RESOURCE_ENERGY) >= link.store[RESOURCE_ENERGY]) {
                link.transferEnergy(otherLink);
            }
        }

    }

}

module.exports = {
    linkBehavior
};
