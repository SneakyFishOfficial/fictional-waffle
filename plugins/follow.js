module.exports = bot => {

    let follower

    bot.mymine.plugins.follow = {}

    bot.mymine.plugins.follow.start = () => {
        if(bot.mymine.isWorker) { follower = setInterval(go, 100) }
    }

    bot.mymine.plugins.follow.stop = () => {
        bot.mymine.nav.stop()
        clearInterval(follower)
    }

    function go() {
        var m = bot.mymine.master()
        if (!m) { return; }
        bot.mymine.nav.follow(m, 1)
    }
}