module.exports = bot => {

    let finder
    let targetType = 'mob'

    bot.mymine.plugins.killaura = {}

    bot.mymine.plugins.killaura.start = () => {
        finder = setInterval(find, 500)
    }

    bot.mymine.plugins.killaura.stop = () => {
        clearInterval(finder)
    }

    function find () {
        var entity = bot.mymine.nearestEntity(targetType)
        if(entity) {
            if(bot.entity.position.distanceTo(entity.position) < 5) {
                bot.lookAt(entity.position.offset(0, 1, 0), false)
                if(!bot.entityAtCursor()) { return; }
                if(bot.entityAtCursor().type == targetType) {
                    bot.log("[#]\tAttacking: " + entity.name, 6, bot.username)
                    bot.attack(entity, false)
                }
            }
        } else {
            bot.setControlState('forward', false)
            bot.setControlState('jump', false)
        }
    }

    /*function nearestEntity(type) {
        var id, entity, dist;
        var best =null;
        var bestDistance = null;
        for(id in bot.entities) {
            entity = bot.entities[id];
            if(type && entity.type !== type) continue;
            if(entity === bot.entity) continue;
            dist = bot.entity.position.distanceTo(entity.position);
            if(!best || dist < bestDistance) {
                best = entity;
                bestDistance = dist;
            }
        }
        return best
    }*/
}