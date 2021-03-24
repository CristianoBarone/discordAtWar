//---------VALUES---------\\

//CONSTs
const discord = require('Discord.js');
const client = new discord.Client();
//VARs
var shots = 0;
var knockedOut = 0;
var startupArgs = process.argv.slice(2);
var typeClient;
var deaths = 0;
var bombings = 0;
let battleTakingPlace = false;
var battleChannel = "";
var battleChannelName = "";
var { translationBattleStarted, translationBattleEnded, translationBattleOngoing, translationNoBattlesOngoing, translationBattleOf, translationBattleStats, translationReloadingConfiguration } = require('./lang.json');
var { prefix, startbattle, endbattle, setclasses, addmedic, removemedic, addinfantry, addcavalry, addship, addartillery, remove, reload, cure, takecover, aim, shoot, navalcannon, reloadconf } = require('./commands.json');
var { deadPlayers, infantryRole, cavalryRole, artilleryRole, navyRole, adminRole, woundedRole } = require("./roles.json");

//COLLECTIONS
var deadMen = [];
const shipyards = ["749952382099521607", "749687231391727726", "749687135585697853", "749688105530949733", "749687935221366824", "749687905793998949", "749975133052993576", "759444037308252160", "759442798063124540", "760198847514935397", "760199213349863475", "760199682034237481", "760200031432736768", "760200169328738365", "749685251600810075", "749685519386017925", "749685606983925813", "762309710522220564", "749962142278484008", "749962182028034137", "749688788871151696", "749688946841223248"];
let knockedOutMen = new Map();
let hidden = new Map();
let aiming = new Map();
let classes = new Map();
let ammo = new Object();
let medics = new Map();
let health = new Map();
let usersInProximity = new Object();

//--------FUNCTIONS--------\\

function resetBattleStats() {
    deaths = 0
    knockedOut = 0
    shots = 0
    bombings = 0
    ammo = new Object();
    hidden = new Map();
	usersInProximity = new Object();
}

function reloadConfs() {
 var { translationBattleStarted, translationBattleEnded, translationBattleOngoing, translationNoBattlesOngoing, translationBattleOf, translationBattleStats, translationReloadingConfiguration } = require('./lang.json');
 var { prefix, startbattle, endbattle, setclasses, addmedic, removemedic, addinfantry, addcavalry, addship, addartillery, remove, reload, cure, takecover, aim, shoot, navalcannon, reloadconf } = require('./commands.json');
 var { deadPlayers, infantryRole, cavalryRole, artilleryRole, navyRole, adminRole, woundedRole } = require("./roles.json");
}

//---------EVENTS---------\\

client.once('ready', () => {
    console.log(client.user.tag, " ready");
})

client.on('message', async msg => {
    if (msg.member.hasPermission("MANAGE_MESSAGES")) {
        if (msg.content.startsWith(prefix + startbattle)) {
            if (!battleTakingPlace) {
                resetBattleStats();
                battleTakingPlace = true
                battleChannel = msg.channel.id
                battleChannelName = msg.channel.name
                msg.reply(` ${translationBattleStarted}`);
            } else {
                msg.reply(` ${translationBattleOngoing} ${battleChannelName}`);
            }
        }

        if (msg.content.startsWith(prefix + reloadconf)) {
			msg.reply(` ${translationReloadingConfiguration}`);
            reloadConfs();
        }

        if (msg.content.startsWith(prefix + setclasses)) {
            let guild = msg.channel.guild
            let roleInfantry = guild.roles.cache.get(infatryRole)
            roleInfantry.members.each(x => {
                classes.set(x.user.id, "infantry")
                ammo[x.user.id] = 1;
            });
            let roleCavalry = guild.roles.cache.get(cavalryRole)
            roleCavalry.members.each(x => {
                classes.set(x.user.id, "cavarly")
                ammo[x.user.id] = 30;
            });
            let roleNavy = guild.roles.cache.get(navyRole)
            roleNavy.members.each(x => {
                classes.set(x.user.id, "navy")
                ammo[x.user.id] = 1;
            });
            let roleart = guild.roles.cache.get(artilleryRole)
            roleart.members.each(x => {
                classes.set(x.user.id, "artillery")
                ammo[x.user.id] = 1;
            });
            let roleadmin = guild.roles.cache.get(adminRole)
            roleadmin.members.each(x => {
                deadMen.push(x.user.id)
            });
            let roleadmin2 = guild.roles.cache.get( deadPlayers)
            roleadmin2.members.each(x => {
                deadMen.push(x.user.id)
            });
        }

        if (msg.content.startsWith(prefix + endbattle)) {
            if (battleTakingPlace) {
                battleTakingPlace = false
                battleChannel = ""
                let answ = new discord.MessageEmbed();
                answ.setColor("RANDOM");
                answ.setFooter(`${translationBattleOf}` + battleChannelName)
                answ.setDescription(translationBattleEnded + "\ndeaths: " + deaths + "\nColpi sparati: " + shots + "\nFuori combattimento: " + knockedOut + "\nBombardamenti: " + bombings);
                answ.setTitle(`${translationBattleStats}`); //Stats
                msg.channel.send(answ);
            } else {
                msg.reply(` ${translationNoBattlesOngoing}`); //No battles are taking place!
            }
        }

        if (msg.content.startsWith(prefix + addmedic)) {
            let vittimauser = msg.mentions.users.first();
            medics.set(vittimauser.id, true);
        }

        if (msg.content.startsWith(prefix + removemedic)) {
            let vittimauser = msg.mentions.users.first();
            medics.delete(vittimauser.id);
        }

        if (msg.content.startsWith(prefix + addinfantry)) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "infantry");
            health.set(vittimauser.id, 10);
			ammo[x.user.id] = 1;
        }

        if (msg.content.startsWith(prefix + addcavalry)) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "cavarly");
            health.set(vittimauser.id, 10);
			ammo[x.user.id] = 30;
        }

        if (msg.content.startsWith(prefix + addship)) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "navy");
            health.set(vittimauser.id, 100);
			ammo[x.user.id] = 1;
        }



        if (msg.content.startsWith(prefix + remove)) {
            let vittimauser = msg.mentions.users.first();
            classes.delete(vittimauser.id);
            ammo.delete(vittimauser.id);
        }

        if (msg.content.startsWith(prefix + addartillery)) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "artillery");
            health.set(vittimauser.id, 10);
			ammo[x.user.id] = 1;
        }

    }

    if (msg.content.startsWith(prefix + reload)) { //reload
        if (classes.get(msg.author.id) == "infantry") {
			ammo[x.user.id] = 1;
        }
        if (classes.get(msg.author.id) == "cavarly") {
			ammo[x.user.id] = 30;
        }
        if (classes.get(msg.author.id) == "artillery" || classes.get(msg.author.id) == "navy") {
			ammo[x.user.id] = 1;
        }
        msg.delete();
    }

    if (msg.content.startsWith(prefix + cure)) {
        if (medics.has(msg.author.id)) {
            let vittima = msg.mentions.members.first();
            let vittimauser = msg.mentions.users.first();
            knockedOutMen.delete(vittimauser.id)
            vittima.roles.set([]);

        } else return msg.reply(" non sei un medico"); 
    }

    if (msg.content.startsWith(prefix + takecover)) { 
        if (classes.get(msg.author.id) == "infantry" || classes.get(msg.author.id) == "cavarly" || classes.get(msg.author.id) == "artillery") {
            if (hidden.has(msg.author.id)) {} else {
                hidden.set(msg.author.id, true)
                msg.delete();
            }
        }
    }

    if (msg.content.startsWith(prefix + aim)) {
        aiming.set(msg.author.id, true);
        msg.delete();
    }

    if (msg.content.startsWith(prefix + shoot)) { 
        hidden.delete(msg.author.id)
        if (!classes.has(msg.author.id)) return;
        if (!battleTakingPlace) return;

        if (deadMen.includes(msg.author.id) || knockedOutMen.has(msg.author.id)) {} else {
            if (classes.get(msg.author.id) == "infantry" || classes.get(msg.author.id) == "cavarly") {
                let prob = Math.random() * 10;
                let vittima = msg.mentions.members.first();
                let vittimauser = msg.mentions.users.first();
                if (ammo[msg.author.id] == 0 || ammo[msg.author.id] == NaN || ammo[msg.author.id] == undefined) return msg.reply(" devi ricaricare!"); 
                if (!vittima) {
                    return msg.reply(" uso corretto: /spara + @<Utente>");
                }
                if (deadMen.includes(vittimauser.id)) {
                    return msg.reply(" è già morto");
                }

                if (classes.get(vittimauser.id) == "navy") {
                    if (!shipyards.includes(msg.channel.id)) {
                        return msg.reply(" non puoi sparare ad una navy in un canale non marittimo, come lei non può sparare a te."); //you cannot shoot a ship if you're not in a shipyard as she cannot shoot you
                    }
                }
                shots++

                if (vittima == msg.member) {
                    vittima.roles.set([ deadPlayers]);  
                    msg.reply(" colpito!");
                    deadMen.push(vittimauser.id);
                    vittima.setNickname("MORTO ☠")
                    ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                    return;
                }

                

                if (hidden.has(vittimauser.id)) {

                    if (aiming.has(msg.author.id)) {
                        if (prob > 5) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
								ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                return;
                            } else {
                                knockedOut++
                                knockedOutMen.set(vittimauser.id, true)
                                vittima.roles.set([ woundedRole]);  
								ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                return;
                            }
                        }
                    }

                    if (prob > 7) {
                        if (!vittima) return;
                        msg.reply(" colpito! ");
                        let probe = Math.random() * 10;
                        if (probe < 1) {
							ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            console.log(prob);
                            deaths++
                            vittima.roles.set([ deadPlayers]);  
                            deadMen.push(vittimauser.id);
                            vittima.setNickname("MORTO ☠")
                            return;
                        } else {
                            knockedOut++
                            knockedOutMen.set(vittimauser.id, true)
                            vittima.roles.set([ woundedRole]);  
							ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            return;
                        }
                    }
                    else {
						ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                        return msg.reply(" mancato!");
                    }
                } else {
                    if (aiming.has(msg.author.id)) {
                        if (prob > 2) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
								ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                aiming.delete(msg.author.id);
                                return;
                            } else {
                                knockedOut++
                                knockedOutMen.set(vittimauser.id, true)
                                vittima.roles.set([ woundedRole]);  
								ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                aiming.delete(msg.author.id);
                                return;
                            }
                        } else {
                            msg.reply(" mancato!");
							ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            aiming.delete(msg.author.id);
                            return;
                        }

                        if (prob > 5) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                aiming.delete(msg.author.id);
                                return;
                            } else {
                                knockedOut++
                                knockedOutMen.set(vittimauser.id, true)
                                vittima.roles.set([ woundedRole]);  
                                ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                aiming.delete(msg.author.id);
                                return;
                            }
                        }
                        else {
                            ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            aiming.delete(msg.author.id);
                            return msg.reply(" mancato!");
                        }
                    }
                }
            } else {
                if (classes.has(msg.author.id) && classes.get(msg.author.id) == "artillery") {
                    if (ammo[msg.author.id] == 0) {
                        return msg.reply(" devi ricaricare!");
                    } else {

                        let vittima = msg.mentions.members.first();
                        let vittimauser = msg.mentions.users.first();
                        if (!vittima) {
                            msg.channel.send("https://tenor.com/view/ww2-italy-artillery-army-cannon-gif-17499773").then(console.log()).catch(console.error); //Did the Piave say something?
                            msg.channel.setRateLimitPerUser(15)
                            ammo[msg.author.id] = 0;
                            bombings++
                            setTimeout(function() {
                                msg.channel.setRateLimitPerUser(0).then(console.log()).catch(console.error)
                            }, 5000)
                        } else {
                            msg.channel.send("https://tenor.com/view/ww2-italy-artillery-army-cannon-gif-17499773").then(console.log()).catch(console.error);
                            msg.channel.setRateLimitPerUser(15)
                            bombings++
                            setTimeout(function() {
                                msg.channel.setRateLimitPerUser(0).then(console.log()).catch(console.error)
                            }, 15000)
                        }
                        if (!vittima) return;
                        let probe = Math.random() * 10;
                        if (probe < 1) {
                            ammo[msg.author.id] = 0;
                            console.log(prob);
                            deaths++
                            vittima.roles.set([ deadPlayers]);  
                            deadMen.push(vittimauser.id);
                            vittima.setNickname("MORTO ☠")
                            return;
                        } else {
                            knockedOut++
                            knockedOutMen.set(vittimauser.id, true)
                            vittima.roles.set([ woundedRole]);  
                            ammo[msg.author.id] = 0;
                        }
                    }
                }
            }
        }
    }


    if (msg.content.startsWith(prefix + navalcannon)) {
        if (!battleTakingPlace) return; {
            if (deadMen.includes(msg.author.id) || knockedOutMen.has(msg.author.id)) {} else {
                if (classes.has(msg.author.id) && shipyards.includes(msg.channel.id)) {

                    let prob = Math.random() * 10;
                    let vittima = msg.mentions.members.first();
                    let vittimauser = msg.mentions.users.first();
                    if (ammo[msg.author.id] == 0) {
                        return msg.reply(" devi ricaricare!");
                    } else {
                        msg.channel.send("https://lh3.googleusercontent.com/proxy/rxX5eGw8DbxsFkj6oQY9k7jCqFSp5vRkq5lrub7IEghu222dOAuK1tFYHrbWQqyzj1D_copE0rfZMhk2SxSX-bkzF4_nLyXtbk-ntp4hDHeRl-yn9CBefQ58d2uy5hNCFZl_k7u-uGepV_c").then(console.log()).catch(console.error);
                        if (!vittima || vittima == msg.member) {
                            return msg.reply(" uso corretto: /spara + @<Utente>");
                        }

                        if (prob > 5) {
                            msg.reply(" colpito! ");
                            if (!vittima) return;
                            msg.reply(" colpito e messo fuori gioco! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                ammo[msg.author.id] = 0;
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                return;
                            } else {
                                knockedOut++
                                knockedOutMen.set(vittimauser.id, true)
                                vittima.roles.set([ woundedRole]);  
                                ammo[msg.author.id] = 0;
                            }
                        }
                        else {
                            ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            return msg.reply(" mancato!");
                        }
                        ammo[msg.author.id] = 0;
                        bombings++
                    }
                }
            }
        }
    }
});


// ::START UP::
console.log("discordAtWar: ", startupArgs);
switch (startupArgs[1]) {
    case "KOI":
        console.log("discordAtWar: logging KOI");
        typeClient = "KOI"
        client.login("YOUR-TOKEN-HERE-DARLING");
    default:
      console.log("missing startup argument");
}
