module.exports = bot => {

    let rotater
    let rotated = false
    bot.mymine.plugins.afk = {}

    bot.mymine.plugins.afk.start = () => {
        bot.setControlState('forward', true)
        bot.setControlState('jump', true)
        if (rotater) return
        rotater = setInterval(rotate, 1000)
    }

    bot.mymine.plugins.afk.stop = () => {
        bot.setControlState('forward', false)
        bot.setControlState('jump', false)
        if (!rotater) return
        clearInterval(rotater)
    }

    function rotate () {
        //bot.look(rotated ? 0 : Math.PI, 0)
        bot.look(getRandom(20), getRandom(1), 0)
        rotated = !rotated
    }

    function getRandom(max) {
        return Math.random() * max;
      }

}