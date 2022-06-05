module.exports = bot => {

    bot.mymine.plugins.webinv = {}

    bot.mymine.plugins.webinv.start = () => {
        bot.mymine.startinv(bot, bot.mymine.mid, bot.entity.username)
    }

    bot.mymine.plugins.webinv.stop = () => {
    }
}