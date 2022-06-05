module.exports = bot => {

    let lastPos
    let logger

    bot.mymine.plugins.coords = {}

    bot.mymine.plugins.coords.start = () => {
        logger = setInterval(logCoords, 500)
    }

    bot.mymine.plugins.coords.stop = () => {
        clearInterval(logger)
    }

    function logCoords() {
        lastPos = bot.entity.position
    }

    function returnToDeath() {
        bot.log("Going to death location...", 6, bot.username)
        bot.mymine.nav.to(lastPos.x, lastPos.y, lastPos.z, 1)
    }

    bot.on('death', returnToDeath)

}