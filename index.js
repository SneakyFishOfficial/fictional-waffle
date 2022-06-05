//Init start

const config = require('./config.js')

var cursor = require('ansi')(process.stdout)
cursor.hide()

const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals

const mineflayerViewer = require('prismarine-viewer').mineflayer

const inventoryViewer = require('mineflayer-web-inventory')

const fs = require('fs');

var Jetty = require("jetty");
var jetty = new Jetty(process.stdout);

var clc = require("cli-color");
const { workerPlugins, masterPlugins } = require('./config.js')

const mPlugins = config.masterPlugins//
const wPlugins = config.workerPlugins//

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function IntTwoChars(i) {
    return (`0${i}`).slice(-2);
}

const colour = (target, text) => {
    switch(target) {
        case 0:
            return clc.white(text);
        break;
        case 1:
            return clc.yellow(text);
        break;
        case 2:
            return clc.magenta(text);
        break;
        case 3:
            return clc.red(text);
        break;
        case 4:
            return clc.green(text);
        break;
        case 5:
            return clc.blue(text);
        break;
        case 6:
            return clc.cyanBright(text);
        break;
        default:
            return clc.blackBright(text);
      }
}

var lastMessage = "";
var plusone = 1;
var jetty_y = 1;
var meslength = 0;

const log = (message, importance, username, forceShow) => {

    if(config.usernames.includes(username) && !forceShow) { return; }

    if(lastMessage == message) {

        jetty.moveTo([jetty_y,0]).text(colour(importance, "  [" + IntTwoChars(plusone) + "]  "))
        plusone += 1
    } else {

        lastMessage = message
        let date_ob = new Date();

        let hours = IntTwoChars(date_ob.getHours());
        let minutes = IntTwoChars(date_ob.getMinutes());
        let seconds = IntTwoChars(date_ob.getSeconds());

        let display = `${hours}:${minutes}:${seconds}`;

        if(!username) { username = "SYSTEM-TASK" }
        let mes = colour(importance, '\n  [01]  [' + display + ']  [' + username + ']\t\t' + message);
        meslength = mes.length;
        if(plusone != 1) { jetty.moveTo([jetty_y, meslength + 1]) }
        jetty.text(mes);
        jetty_y += 1;
        plusone = 1;
    }
}

function between(min, max) {  
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}


    //-----Web Server----- [Start]

    let indexFile
    
    const http = require('http');
    const webHost = 'localhost'
    const webPort = 8000

    const requestListener = function (req, res) {
        res.setHeader("Content-Type", "text/html")
        res.writeHead(200)
        res.end(indexFile)
    }

    const webServer = http.createServer(requestListener);

    fs.readFile(__dirname + "/website/index.html", 'utf8', (err, contents) => {
        if(err){
            log(err, 3)
            process.exit(1)
        }
        indexFile = contents
        webServer.listen(webPort, webHost, () => {
            log("[^]\tMain webServer running on http://" + webHost + ":" + webPort, 5)
        });
    })

    //-----Web Server----- [Finish]

function showKey() {
    fs.readFile('./importances.txt', 'utf8', (err, data) => {
        if (err) {
          log(err, 3);
          return;
        }
        
        let lines = data.toString().replace(/\r\n/g,'\n').split('\n');
        for(let i of lines) {
            log(i);
        }

      });
}

function getOptions(workerOrMaster, userIndex) {
    //true = worker, false = master
    if(workerOrMaster) {
        //var userIndex = between(1, config.usernames.length) - 1
        log("[!]\tWorker Init:   index: " + userIndex + " | username: '" + config.usernames[userIndex] + "' | password: '" + config.passwords[userIndex] + "'", 4, config.usernames[userIndex])
        return {
            verbose: true,
            host: config.host,
            port: config.port,
            username: config.usernames[userIndex],
            password: config.passwords[userIndex],
            mymineid: userIndex + 3001
        }
    } else {
        return {
            verbose: true,
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            mymineid: 3000
        }
    }
}


var workerbots = []
var wbotsOp = []
var masterbot
async function assignWorker (item, index) {
    
    await delay(5000 * index)
    var workeroptions = getOptions(true, index)

    var workerbot = await mineflayer.createBot(workeroptions)
    await workerbot.loadPlugin(pathfinder)
    await bindEvents(workerbot, workeroptions, true)
    workerbots.push(workerbot)
    wbotsOp.push(workeroptions)
}

async function doInit() {

    //assign master
    var options = getOptions(false, null)

    var bot = await mineflayer.createBot(options)
    await bot.loadPlugin(pathfinder)
    await bindEvents(bot, options, false)

    masterbot = bot

    await delay(5000)

    if(!config.onlyMaster) {
        //assign workers
        config.usernames.forEach(assignWorker)
        await delay(5000)
    }
}
doInit()

//Init finish

function bindEvents(bot, options, isWorker) {

    //----------
    //bot.mymine

    bot.mymine = {}
    bot.mm = bot.mymine

    bot.log = (message, importance, username, forceShow) => {
        log(message, importance, username, forceShow)
    }
    bot.mymine.log = bot.log

    bot.mymine.config = config
    bot.mymine.delay = delay
    bot.mymine.inttwochars = IntTwoChars
    bot.mymine.between = between
    bot.mymine.workerbots = workerbots
    bot.mymine.masterbot = masterbot

    bot.mymine.isWorker = isWorker
    bot.mymine.mastername = config.username
    bot.mymine.mid = options.mymineid

    //bot.mymine.plugins

    bot.mymine.plugins = {}

    bot.mymine.pluginslist = {}
    bot.mymine.pluginslist.worker = workerPlugins
    bot.mymine.pluginslist.master = masterPlugins
    bot.mymine.pluginslist.w = bot.mymine.pluginslist.worker
    bot.mymine.pluginslist.m = bot.mymine.pluginslist.master
    bot.mymine.pl = bot.mymine.pluginslist

    if(isWorker) {
        wPlugins.forEach(plugin => {
            bot.loadPlugin(require('./plugins/' + plugin + '.js'))
        })
    } else {
        mPlugins.forEach(plugin => {
            bot.loadPlugin(require('./plugins/' + plugin + '.js'))
        })
    }

    //----------

    const onLogin = () => {
        log("[!]\tLogged into '" + options.host + ":" + options.port + "'!", 4, options.username, true)
    }
    
    const onSpawn = () => {

        var mcData = require('minecraft-data')(bot.version)
        var Entity = require('prismarine-entity')(bot.version)
        var defaultMove = new Movements(bot, mcData)

        if(!isWorker) { 
            mineflayerViewer(bot, { firstPerson: true, port: 4000 }) 
            mineflayerViewer(bot, { firstPerson: false, port: 5000 })

            bot.on('path_update', (r) => {
                var nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
                var path = [bot.entity.position.offset(0, 0.5, 0)]
                for (const node of r.path) {
                    path.push({ x: node.x, y: node.y + 0.5, z: node.z })
                }
                bot.viewer.drawLine('path', path, 0xffffff)
            })

            bot.viewer.on('blockClicked', (block, face, button) => {
                if (button !== 0) return // only left click
            
                const p = block.position.offset(0, 1, 0)
            
                bot.pathfinder.setMovements(defaultMove)
                bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
            })
        }

        //bot.mymine
        bot.mymine.master = () => { return Object.values(bot.entities).filter(entity => entity.type === 'player' && entity.username === config.username)[0]; }
        bot.mymine.mcdata = mcData
        bot.mymine.pentity = Entity
        bot.mymine.defaultmove = defaultMove

        bot.mymine.startinv = (tbot, tid, tname) => {
            inventoryViewer(tbot, { port: tid, startOnLoad: true })
            log("[$]\tInventory Viewer Setup *:" + tid, 5, tname, true)
        }

        bot.mymine.nav = {}
        bot.mymine.nav.to = (x, y, z, r) => {
            log('[=]\tOn my way to [x:' + x + ' | y:' + y + ' | z: ' + z + ' | range: ' + r + ']', 2, options.username)
            bot.pathfinder.setGoal(new GoalNear(x, y, z, r), false)
        }
        bot.mymine.nav.stop = () => {
            log('[=]\tNavigation stopped', 2, options.username)
            bot.pathfinder.stop()
            bot.pathfinder.setGoal(null, false)
        }
        bot.mymine.nav.follow = (e, r) => {
            if(e.type == "player") {
                log('[=]\tOn my way to [entity:' + e.username + ' | range: ' + r + ']', 2, options.username)
            } else {
                log('[=]\tOn my way to [entity:' + e.name + ' | range: ' + r + ']', 2, options.username)
            }
            bot.pathfinder.setGoal(new GoalNear(e.position.x,e.position.y,e.position.z,r), false)
        }

        bot.mymine.nearestEntity = (type) => {
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
        }

        bot.chat("Hello! I am " + bot.username + "!")
        if(isWorker) {
            wPlugins.forEach(plugin => {
                log('[$]\tNow Starting \'' + plugin + '\'', 5, options.username)
                eval('bot.mymine.plugins.' + plugin + '.start()')
            })
        } else {
            mPlugins.forEach(plugin => {
                log('[$]\tNow Starting \'' + plugin + '\'', 5, options.username)
                eval('bot.mymine.plugins.' + plugin + '.start()')
            })
        }
    }
    
    const onChat = (username, message) => {
        log("[+]\t<" + username + "> " + message, 0, options.username)
    }
    
    const onWhisper = (username, message) => {
        log("[-]\t<" + username + "> " + message, 0, options.username)
    }
    
    const onKicked = (reason) => {
        log("[*]\tKicked for: " + reason, 1, options.username, true)
    }
    
    const onError = (err) => {
        log("[*]\tError occured: " + err, 1, options.username, true)
    }
    
    const onDeath = () => {
        bot.chat(":(")
    }
    
    const onMessage = (message, messagePosition) => {
        if(messagePosition != "chat") {
            log("[*]\t" + message, 1, options.username)
        }
    }

    const onEnd = () => {
        if(isWorker) {
            wPlugins.forEach(plugin => {
                log('[$]\tNow Stopping \'' + plugin + '\'', 5, options.username)
                eval('bot.mymine.plugins.' + plugin + '.stop()')
            })
        } else {
            mPlugins.forEach(plugin => {
                log('[$]\tNow Stopping \'' + plugin + '\'', 5, options.username)
                eval('bot.mymine.plugins.' + plugin + '.stop()')
            })
        }

        log("[!]\tBot Has Ended...", 3, options.username, true)
        log("[!]\tTrying again in 5 seconds...", 3, options.username, true)
        setTimeout(relog, 5000)
    }

    bot.once('login', onLogin)
    bot.once('spawn', onSpawn)
    bot.on('end', onEnd)
    bot.on('chat', onChat)
    bot.on('whisper', onWhisper)
    bot.on('kicked', onKicked)
    bot.on('error', onError)
    bot.on('death', onDeath)
    bot.on('messagestr', onMessage)

    function relog() {
        log("[!]\tAttempting to reconnect...", 3, options.username, true)
        bot = mineflayer.createBot(options)
        bindEvents(bot, options, isWorker)
    }

}