//---------VALUES---------\\

//CONSTs
const discord = require('Discord.js');
const client = new discord.Client();


//VARs
var shots = 0;
var outOfCombat = 0;
var startupArgs = process.argv.slice(2);
var prefix = "/";
var typeClient;
var deaths = 0;
var bombings = 0;
let battleTakingPlace = false;
var battleChannel = ""
var battleChannelName = ""

//COLLECTIONS
var deadMen = []; //dead dudes
const ports = ["749952382099521607", "749687231391727726", "749687135585697853", "749688105530949733", "749687935221366824", "749687905793998949", "749975133052993576", "759444037308252160", "759442798063124540", "760198847514935397", "760199213349863475", "760199682034237481", "760200031432736768", "760200169328738365", "749685251600810075", "749685519386017925", "749685606983925813", "762309710522220564", "749962142278484008", "749962182028034137", "749688788871151696", "749688946841223248"]; //this are shipyards my boy
let outOfCombatMen = new Map();
let hidden = new Map();
let aiming = new Map();
let classes = new Map();
let ammo = new Map();
let medics = new Map();
let health = new Map();


//--------FUNCTIONS--------\\

function resetBattleStats() {
    deaths = 0
    outOfCombat = 0
    shots = 0
    bombings = 0
    ammo = new Map();
    hidden = new Map();
}

//---------EVENTS---------\\

client.once('ready', () => {
    console.log(client.user.tag, " ready"); //Ready for battle babe!
})

client.on('message', async msg => {
    if (msg.member.hasPermission("MANAGE_MESSAGES")) {
        if (msg.content.startsWith(prefix + "battlestart")) {
            if (!battleTakingPlace) {
                resetBattleStats();
                battleTakingPlace = true
                battleChannel = msg.channel.id
                battleChannelName = msg.channel.name
                msg.reply(" BATTAGLIA INIZIATA"); //THE BATTLE STARTED!

            } else {
                msg.reply(" c'è già una battaglia in corso in " + battleChannelName); //there is already a battle taking place in ..
            }
        }

        if (msg.content.startsWith(prefix + "setclasses")) {
            let guild = msg.channel.guild
            let rolefante = guild.roles.cache.get('749980482334228512') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            rolefante.members.each(x => {
                classes.set(x.user.id, "fante")
                ammo.set(x.user.id, 1)
            });
            let rolecav = guild.roles.cache.get('749980570918060174') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            rolecav.members.each(x => {
                classes.set(x.user.id, "cavaliere")
                ammo.set(x.user.id, 30)
            });
            let rolenav = guild.roles.cache.get('749981637927764099') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            rolenav.members.each(x => {
                classes.set(x.user.id, "nave")
                ammo.set(x.user.id, 1)
            });
            let roleart = guild.roles.cache.get('749980903358464021') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            roleart.members.each(x => {
                classes.set(x.user.id, "artigliere")
                ammo.set(x.user.id, 1)
            });
            let roleadmin = guild.roles.cache.get('758408981826764871') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            roleadmin.members.each(x => {
                deadMen.push(x.user.id)
            });
            let roleadmin2 = guild.roles.cache.get('749682979562979348') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            roleadmin2.members.each(x => {
                deadMen.push(x.user.id)
            });
        }

        if (msg.content.startsWith(prefix + "battleend")) {
            if (battleTakingPlace) {
                battleTakingPlace = false
                battleChannel = ""
                let answ = new discord.MessageEmbed();
                answ.setColor("RANDOM");
                answ.setFooter("Battaglia di " + battleChannelName)
                answ.setDescription("deaths: " + deaths + "\nColpi sparati: " + shots + "\nFuori combattimento: " + outOfCombat + "\nBombardamenti: " + bombings);
                answ.setTitle("BILANCIO BATTAGLIA"); //Stats
                msg.channel.send(answ);
            } else {
                msg.reply(" nessuna battaglia in corso!"); //No battles are taking place!
            }
        }

        if (msg.content.startsWith(prefix + "addmedic")) {
            let vittimauser = msg.mentions.users.first();
            medics.set(vittimauser.id, true);
        }

        if (msg.content.startsWith(prefix + "removemedic")) {
            let vittimauser = msg.mentions.users.first();
            medics.delete(vittimauser.id);
        }

        if (msg.content.startsWith(prefix + "addinf")) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "fante");
            health.set(vittimauser.id, 10);
            ammo.set(vittimauser.id, 1)
            //msg.reply(" hai ricaricato"); !! Do not remove comments if you don't want API-Clogging !!

        }

        if (msg.content.startsWith(prefix + "addcav")) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "cavaliere");
            health.set(vittimauser.id, 10);
            ammo.set(vittimauser.id, 30)

            //msg.reply(" hai ricaricato");

        }

        if (msg.content.startsWith(prefix + "addnavy")) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "nave");
            health.set(vittimauser.id, 100);
            ammo.set(vittimauser.id, 1)

            //msg.reply(" hai ricaricato");

        }



        if (msg.content.startsWith(prefix + "remove")) {
            let vittimauser = msg.mentions.users.first();
            classes.delete(vittimauser.id);
            ammo.delete(vittimauser.id);
        }

        if (msg.content.startsWith(prefix + "addarty")) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "artigliere");
            health.set(vittimauser.id, 10);
            ammo.set(vittimauser.id, 1)
            //msg.reply(" hai ricaricato");
        }

    }

    if (msg.content.startsWith(prefix + "ricarica")) { //reload
        if (classes.get(msg.author.id) == "fante") {
            ammo.set(msg.author.id, 1)
        }
        if (classes.get(msg.author.id) == "cavaliere") {
            ammo.set(msg.author.id, 30)
        }
        if (classes.get(msg.author.id) == "artigliere" || classes.get(msg.author.id) == "nave") {
            ammo.set(msg.author.id, 1)
        }
        msg.delete();
        //console.log(ammo.get(msg.author.id))
    }

    if (msg.content.startsWith(prefix + "cura")) { //cure
        if (medics.has(msg.author.id)) {
            let vittima = msg.mentions.members.first();
            let vittimauser = msg.mentions.users.first();
            outOfCombatMen.delete(vittimauser.id)
            vittima.roles.set([]);

        } else return msg.reply(" non sei un medico"); //you're not a medic!
    }

    if (msg.content.startsWith(prefix + "prendicopertura")) { //GET COVER BOI
        if (classes.get(msg.author.id) == "fante" || classes.get(msg.author.id) == "cavaliere" || classes.get(msg.author.id) == "artigliere") {
            if (hidden.has(msg.author.id)) {} else {
                hidden.set(msg.author.id, true)
                msg.delete();
            }
        }
    }

    if (msg.content.startsWith(prefix + "aiming")) {
        aiming.set(msg.author.id, true);
        msg.delete();
    }

    if (msg.content.startsWith(prefix + "spara")) { //SHOOT
        hidden.delete(msg.author.id)
        //console.log(classes.get(msg.author.id));
        if (!classes.has(msg.author.id)) return;
        if (!battleTakingPlace) return;

        if (deadMen.includes(msg.author.id) || outOfCombatMen.has(msg.author.id)) {} else {
            if (classes.get(msg.author.id) == "fante" || classes.get(msg.author.id) == "cavaliere") {
                let prob = Math.random() * 10;
                let vittima = msg.mentions.members.first();
                let vittimauser = msg.mentions.users.first();
                if (ammo.get(msg.author.id) == 0 || ammo.get(msg.author.id) == NaN || ammo.get(msg.author.id) == undefined) return msg.reply(" devi ricaricare!"); //reload dude
                //ricaricano.push(msg.author.id);
                if (!vittima) {
                    return msg.reply(" uso corretto: /spara + @<Utente>");
                }
                if (deadMen.includes(vittimauser.id)) {
                    return msg.reply(" è già morto");
                }

                if (classes.get(vittimauser.id) == "nave") {
                    if (!ports.includes(msg.channel.id)) {
                        return msg.reply(" non puoi sparare ad una nave in un canale non marittimo, come lei non può sparare a te."); //you cannot shoot a ship if you're not in a shipyard as she cannot shoot you
                    }
                }
                shots++

                if (vittima == msg.member) {
                    vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                    msg.reply(" colpito!");
                    deadMen.push(vittimauser.id);
                    vittima.setNickname("MORTO ☠")
                    ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                    return;
                }

                

                if (hidden.has(vittimauser.id)) {

                    if (aiming.has(msg.author.id)) {
                        if (prob > 5) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                                console.log(prob);
                                deaths++
                                vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                deadMen.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                return;
                            } else {
                                outOfCombat++
                                outOfCombatMen.set(vittimauser.id, true)
                                vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                                return;
                            }
                        }
                    }

                    if (prob > 7) {
                        //health.set(vittimauser.id, (health.get(vittimauser.id)-(Math.random()*11)+6));
                        //console.log(health.get(vittimauser.id))
                        //if (health.get(vittimauser.id) < 1) {
                        if (!vittima) return;
                        msg.reply(" colpito! ");
                        let probe = Math.random() * 10;
                        if (probe < 1) {
                            ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                            console.log(prob);
                            deaths++
                            vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                            deadMen.push(vittimauser.id);
                            vittima.setNickname("MORTO ☠")
                            return;
                        } else {
                            outOfCombat++
                            outOfCombatMen.set(vittimauser.id, true)
                            vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                            ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                            return;
                        }
                    }
                    //msg.push(vittimauser.id);
                    // }
                    else {
                        ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1))
                        return msg.reply(" mancato!");
                    }
                } else {
                    if (aiming.has(msg.author.id)) {
                        if (prob > 2) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                                console.log(prob);
                                deaths++
                                vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                deadMen.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                aiming.delete(msg.author.id);
                                return;
                            } else {
                                outOfCombat++
                                outOfCombatMen.set(vittimauser.id, true)
                                vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                                aiming.delete(msg.author.id);
                                return;
                            }
                        } else {
                            msg.reply(" mancato!");
                            ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1))
                            aiming.delete(msg.author.id);
                            return;
                        }

                        if (prob > 5) {
                            //health.set(vittimauser.id, (health.get(vittimauser.id)-(Math.random()*11)+6));
                            //console.log(health.get(vittimauser.id))
                            //if (health.get(vittimauser.id) < 1) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                                console.log(prob);
                                deaths++
                                vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                deadMen.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                aiming.delete(msg.author.id);
                                return;
                            } else {
                                outOfCombat++
                                outOfCombatMen.set(vittimauser.id, true)
                                vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1));
                                aiming.delete(msg.author.id);
                                return;
                            }
                        }
                        //msg.push(vittimauser.id);
                        // }
                        else {
                            ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1))
                            aiming.delete(msg.author.id);
                            return msg.reply(" mancato!"); //ya missed
                        }
                        //morte()
                    }
                }
            } else {
                if (classes.has(msg.author.id) && classes.get(msg.author.id) == "artigliere") {
                    if (ammo.get(msg.author.id) == 0) {
                        return msg.reply(" devi ricaricare!");
                    } else {

                        let vittima = msg.mentions.members.first();
                        let vittimauser = msg.mentions.users.first();
                        if (!vittima) {
                            msg.channel.send("https://tenor.com/view/ww2-italy-artillery-army-cannon-gif-17499773").then(console.log()).catch(console.error); //Did the Piave say something?
                            msg.channel.setRateLimitPerUser(15)
                            ammo.set(msg.author.id, 0);
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
                            ammo.set(msg.author.id, 0);
                            console.log(prob);
                            deaths++
                            vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                            deadMen.push(vittimauser.id);
                            vittima.setNickname("MORTO ☠")
                            return;
                        } else {
                            outOfCombat++
                            outOfCombatMen.set(vittimauser.id, true)
                            vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                            ammo.set(msg.author.id, 0);
                        }
                    }
                }
            }
        }
    }


    if (msg.content.startsWith(prefix + "cannoneggia")) { //Ships gonna shoot mate
        if (!battleTakingPlace) return; {
            if (deadMen.includes(msg.author.id) || outOfCombatMen.has(msg.author.id)) {} else {
                if (classes.has(msg.author.id) && ports.includes(msg.channel.id)) {

                    let prob = Math.random() * 10;
                    let vittima = msg.mentions.members.first();
                    let vittimauser = msg.mentions.users.first();
                    if (ammo.get(msg.author.id) == 0) {
                        return msg.reply(" devi ricaricare!");
                    } else {
                        msg.channel.send("https://lh3.googleusercontent.com/proxy/rxX5eGw8DbxsFkj6oQY9k7jCqFSp5vRkq5lrub7IEghu222dOAuK1tFYHrbWQqyzj1D_copE0rfZMhk2SxSX-bkzF4_nLyXtbk-ntp4hDHeRl-yn9CBefQ58d2uy5hNCFZl_k7u-uGepV_c").then(console.log()).catch(console.error);
                        if (!vittima || vittima == msg.member) {
                            return msg.reply(" uso corretto: /spara + @<Utente>");
                        }

                        if (prob > 5) {
                            //health.set(vittimauser.id, (health.get(vittimauser.id)-(Math.random()*23)+9));
                            //console.log(health.get(vittimauser.id))
                            msg.reply(" colpito! ");
                            // if (health.get(vittimauser.id) < 1) {
                            if (!vittima) return;
                            msg.reply(" colpito e messo fuori gioco! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                ammo.set(msg.author.id, 0);
                                console.log(prob);
                                deaths++
                                vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                deadMen.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                return;
                            } else {
                                outOfCombat++
                                outOfCombatMen.set(vittimauser.id, true)
                                vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                ammo.set(msg.author.id, 0);
                            }
                        }
                        //msg.push(vittimauser.id); ?? IDK what I wanted to do here but surely I was drunk or something
                        // }
                        else {
                            ammo.set(msg.author.id, (ammo.get(msg.author.id) - 1))
                            return msg.reply(" mancato!");
                        }
                        ammo.set(msg.author.id, 0);
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
