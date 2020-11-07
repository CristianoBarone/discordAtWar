//---------VALUES---------\\

//CONSTs
const discord = require('Discord.js');
const client = new discord.Client();


//VARs
var colpiSparati = 0; //Shots
var fuoriCombattimento = 0; //Out of combat users
var startupArgs = process.argv.slice(2);
var prefix = "/";
var typeClient;
var morti = 0; //Deaths
var bombardamenti = 0; //Bombings
let battagliaInCorso = false; //Is battle started?
var canaleBattaglia = "" //what's the battle's channel's id?
var nomeCanaleBattaglia = "" //what's the battle's channel's name?

//COLLECTIONS
var userMorti = []; //dead dudes
const porti = ["749952382099521607", "749687231391727726", "749687135585697853", "749688105530949733", "749687935221366824", "749687905793998949", "749975133052993576", "759444037308252160", "759442798063124540", "760198847514935397", "760199213349863475", "760199682034237481", "760200031432736768", "760200169328738365", "749685251600810075", "749685519386017925", "749685606983925813", "762309710522220564", "749962142278484008", "749962182028034137", "749688788871151696", "749688946841223248"]; //this are shipyards my boy
let userFuoriCombattimento = new Map(); //knocked out users
let sottoCoperta = new Map(); //covered users
let mira = new Map(); //users aiming
let classi = new Map(); //users classes
let munizioni = new Map(); //users ammo
let medici = new Map(); //medics
let vita = new Map(); //this is deprecated because I suck at coding


//--------FUNCTIONS--------\\

//DEPRECATED AND NOT USED IN CODE, UNABLE TO GET USED TOO AS ARGUMENTS ARE NOT PROVIDED
async function morte() { 
    let guild = client.guilds.cache.get('749681267565658165') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
    guild.users.cache.each(async user => {
        console.log(vita.get(user.id))
        if (vita.has(user.id)) {
            console.log(vita.get(user.id))
            if (vita.get(user.id) <= 0) {
                let prob = Math.random() * 10;
                let vittima = guild.members.fetch(user.id);
                if (prob <= 1) {
                    morti = morti++
                    vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                    userMorti.push(user.id);
                    vittima.setNickname("MORTO ☠")
                    return;
                } else {
                    fuoriCombattimento = fuoriCombattimento++
                    vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                    vittima.setNickname("SVENUTO")
                }
            }
        }
    })
}

function resetBattleStats() {
    morti = 0
    fuoriCombattimento = 0
    colpiSparati = 0
    bombardamenti = 0
    munizioni = new Map();
    sottoCoperta = new Map();
}

//DEPRECATED AND NOT USED IN CODE BUT COULD STILL FUNCTION AT THE MOMENT
function filterArray(filter, array) {
    let falseArrayLocal = [];
    array.forEach(x => {
        if (x == filter) {} else {
            array.push(x);
        }
    });
    return falseArrayLocal;
}

//---------EVENTS---------\\

client.once('ready', () => {
    console.log(client.user.tag, " ready"); //Ready for battle babe!
})

client.on('message', async msg => {
    if (msg.member.hasPermission("MANAGE_MESSAGES")) {
        if (msg.content.startsWith(prefix + "battlestart")) {
            if (!battagliaInCorso) {
                resetBattleStats();
                battagliaInCorso = true
                canaleBattaglia = msg.channel.id
                nomeCanaleBattaglia = msg.channel.name
                msg.reply(" BATTAGLIA INIZIATA"); //THE BATTLE STARTED!

            } else {
                msg.reply(" c'è già una battaglia in corso in " + nomeCanaleBattaglia); //there is already a battle taking place in ..
            }
        }

        if (msg.content.startsWith(prefix + "setclasses")) {
            let guild = msg.channel.guild
            let rolefante = guild.roles.cache.get('749980482334228512') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            rolefante.members.each(x => {
                classi.set(x.user.id, "fante")
                munizioni.set(x.user.id, 1)
            });
            let rolecav = guild.roles.cache.get('749980570918060174') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            rolecav.members.each(x => {
                classi.set(x.user.id, "cavaliere")
                munizioni.set(x.user.id, 30)
            });
            let rolenav = guild.roles.cache.get('749981637927764099') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            rolenav.members.each(x => {
                classi.set(x.user.id, "nave")
                munizioni.set(x.user.id, 1)
            });
            let roleart = guild.roles.cache.get('749980903358464021') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            roleart.members.each(x => {
                classi.set(x.user.id, "artigliere")
                munizioni.set(x.user.id, 1)
            });
            let roleadmin = guild.roles.cache.get('758408981826764871') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            roleadmin.members.each(x => {
                userMorti.push(x.user.id)
            });
            let roleadmin2 = guild.roles.cache.get('749682979562979348') //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
            roleadmin2.members.each(x => {
                userMorti.push(x.user.id)
            });
        }

        if (msg.content.startsWith(prefix + "battleend")) {
            if (battagliaInCorso) {
                battagliaInCorso = false
                canaleBattaglia = ""
                let answ = new discord.MessageEmbed();
                answ.setColor("RANDOM");
                answ.setFooter("Battaglia di " + nomeCanaleBattaglia)
                answ.setDescription("Morti: " + morti + "\nColpi sparati: " + colpiSparati + "\nFuori combattimento: " + fuoriCombattimento + "\nBombardamenti: " + bombardamenti);
                answ.setTitle("BILANCIO BATTAGLIA"); //Stats
                msg.channel.send(answ);
            } else {
                msg.reply(" nessuna battaglia in corso!"); //No battles are taking place!
            }
        }

        if (msg.content.startsWith(prefix + "addmedic")) {
            let vittimauser = msg.mentions.users.first();
            medici.set(vittimauser.id, true);
        }

        if (msg.content.startsWith(prefix + "removemedic")) {
            let vittimauser = msg.mentions.users.first();
            medici.delete(vittimauser.id);
        }

        if (msg.content.startsWith(prefix + "addinf")) {
            let vittimauser = msg.mentions.users.first();
            classi.set(vittimauser.id, "fante");
            vita.set(vittimauser.id, 10);
            munizioni.set(vittimauser.id, 1)
            //msg.reply(" hai ricaricato"); !! Do not remove comments if you don't want API-Clogging !!

        }

        if (msg.content.startsWith(prefix + "addcav")) {
            let vittimauser = msg.mentions.users.first();
            classi.set(vittimauser.id, "cavaliere");
            vita.set(vittimauser.id, 10);
            munizioni.set(vittimauser.id, 30)

            //msg.reply(" hai ricaricato");

        }

        if (msg.content.startsWith(prefix + "addnavy")) {
            let vittimauser = msg.mentions.users.first();
            classi.set(vittimauser.id, "nave");
            vita.set(vittimauser.id, 100);
            munizioni.set(vittimauser.id, 1)

            //msg.reply(" hai ricaricato");

        }



        if (msg.content.startsWith(prefix + "remove")) {
            let vittimauser = msg.mentions.users.first();
            classi.delete(vittimauser.id);
            munizioni.delete(vittimauser.id);
        }

        if (msg.content.startsWith(prefix + "addarty")) {
            let vittimauser = msg.mentions.users.first();
            classi.set(vittimauser.id, "artigliere");
            vita.set(vittimauser.id, 10);
            munizioni.set(vittimauser.id, 1)
            //msg.reply(" hai ricaricato");
        }

    }

    if (msg.content.startsWith(prefix + "ricarica")) { //reload
        if (classi.get(msg.author.id) == "fante") {
            munizioni.set(msg.author.id, 1)
        }
        if (classi.get(msg.author.id) == "cavaliere") {
            munizioni.set(msg.author.id, 30)
        }
        if (classi.get(msg.author.id) == "artigliere" || classi.get(msg.author.id) == "nave") {
            munizioni.set(msg.author.id, 1)
        }
        msg.delete();
        //console.log(munizioni.get(msg.author.id))
    }

    if (msg.content.startsWith(prefix + "cura")) { //cure
        if (medici.has(msg.author.id)) {
            let vittima = msg.mentions.members.first();
            let vittimauser = msg.mentions.users.first();
            userFuoriCombattimento.delete(vittimauser.id)
            vittima.roles.set([]);

        } else return msg.reply(" non sei un medico"); //you're not a medic!
    }

    if (msg.content.startsWith(prefix + "prendicopertura")) { //GET COVER BOI
        if (classi.get(msg.author.id) == "fante" || classi.get(msg.author.id) == "cavaliere" || classi.get(msg.author.id) == "artigliere") {
            if (sottoCoperta.has(msg.author.id)) {} else {
                sottoCoperta.set(msg.author.id, true)
                msg.delete();
            }
        }
    }

    if (msg.content.startsWith(prefix + "mira")) {
        mira.set(msg.author.id, true);
        msg.delete();
    }

    if (msg.content.startsWith(prefix + "spara")) { //SHOOT
        sottoCoperta.delete(msg.author.id)
        //console.log(classi.get(msg.author.id));
        if (!classi.has(msg.author.id)) return;
        if (!battagliaInCorso) return;

        if (userMorti.includes(msg.author.id) || userFuoriCombattimento.has(msg.author.id)) {} else {
            if (classi.get(msg.author.id) == "fante" || classi.get(msg.author.id) == "cavaliere") {
                let prob = Math.random() * 10;
                let vittima = msg.mentions.members.first();
                let vittimauser = msg.mentions.users.first();
                if (munizioni.get(msg.author.id) == 0 || munizioni.get(msg.author.id) == NaN || munizioni.get(msg.author.id) == undefined) return msg.reply(" devi ricaricare!"); //reload dude
                //ricaricano.push(msg.author.id);
                if (!vittima) {
                    return msg.reply(" uso corretto: /spara + @<Utente>");
                }
                if (userMorti.includes(vittimauser.id)) {
                    return msg.reply(" è già morto");
                }

                if (classi.get(vittimauser.id) == "nave") {
                    if (!porti.includes(msg.channel.id)) {
                        return msg.reply(" non puoi sparare ad una nave in un canale non marittimo, come lei non può sparare a te."); //you cannot shoot a ship if you're not in a shipyard as she cannot shoot you
                    }
                }
                colpiSparati++

                if (vittima == msg.member) {
                    vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                    msg.reply(" colpito!");
                    userMorti.push(vittimauser.id);
                    vittima.setNickname("MORTO ☠")
                    munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                    return;
                }

                

                if (sottoCoperta.has(vittimauser.id)) {

                    if (mira.has(msg.author.id)) {
                        if (prob > 5) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                                console.log(prob);
                                morti++
                                vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                userMorti.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                return;
                            } else {
                                fuoriCombattimento++
                                userFuoriCombattimento.set(vittimauser.id, true)
                                vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                                return;
                            }
                        }
                    }

                    if (prob > 7) {
                        //vita.set(vittimauser.id, (vita.get(vittimauser.id)-(Math.random()*11)+6));
                        //console.log(vita.get(vittimauser.id))
                        //if (vita.get(vittimauser.id) < 1) {
                        if (!vittima) return;
                        msg.reply(" colpito! ");
                        let probe = Math.random() * 10;
                        if (probe < 1) {
                            munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                            console.log(prob);
                            morti++
                            vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                            userMorti.push(vittimauser.id);
                            vittima.setNickname("MORTO ☠")
                            return;
                        } else {
                            fuoriCombattimento++
                            userFuoriCombattimento.set(vittimauser.id, true)
                            vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                            munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                            return;
                        }
                    }
                    //msg.push(vittimauser.id);
                    // }
                    else {
                        munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1))
                        return msg.reply(" mancato!");
                    }
                } else {
                    if (mira.has(msg.author.id)) {
                        if (prob > 2) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                                console.log(prob);
                                morti++
                                vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                userMorti.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                mira.delete(msg.author.id);
                                return;
                            } else {
                                fuoriCombattimento++
                                userFuoriCombattimento.set(vittimauser.id, true)
                                vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                                mira.delete(msg.author.id);
                                return;
                            }
                        } else {
                            msg.reply(" mancato!");
                            munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1))
                            mira.delete(msg.author.id);
                            return;
                        }

                        if (prob > 5) {
                            //vita.set(vittimauser.id, (vita.get(vittimauser.id)-(Math.random()*11)+6));
                            //console.log(vita.get(vittimauser.id))
                            //if (vita.get(vittimauser.id) < 1) {
                            if (!vittima) return;
                            msg.reply(" colpito! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                                console.log(prob);
                                morti++
                                vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                userMorti.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                mira.delete(msg.author.id);
                                return;
                            } else {
                                fuoriCombattimento++
                                userFuoriCombattimento.set(vittimauser.id, true)
                                vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1));
                                mira.delete(msg.author.id);
                                return;
                            }
                        }
                        //msg.push(vittimauser.id);
                        // }
                        else {
                            munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1))
                            mira.delete(msg.author.id);
                            return msg.reply(" mancato!"); //ya missed
                        }
                        //morte()
                    }
                }
            } else {
                if (classi.has(msg.author.id) && classi.get(msg.author.id) == "artigliere") {
                    if (munizioni.get(msg.author.id) == 0) {
                        return msg.reply(" devi ricaricare!");
                    } else {

                        let vittima = msg.mentions.members.first();
                        let vittimauser = msg.mentions.users.first();
                        if (!vittima) {
                            msg.channel.send("https://tenor.com/view/ww2-italy-artillery-army-cannon-gif-17499773").then(console.log()).catch(console.error); //Did the Piave say something?
                            msg.channel.setRateLimitPerUser(15)
                            munizioni.set(msg.author.id, 0);
                            bombardamenti++
                            setTimeout(function() {
                                msg.channel.setRateLimitPerUser(0).then(console.log()).catch(console.error)
                            }, 5000)
                        } else {
                            msg.channel.send("https://tenor.com/view/ww2-italy-artillery-army-cannon-gif-17499773").then(console.log()).catch(console.error);
                            msg.channel.setRateLimitPerUser(15)
                            bombardamenti++
                            setTimeout(function() {
                                msg.channel.setRateLimitPerUser(0).then(console.log()).catch(console.error)
                            }, 15000)
                        }
                        if (!vittima) return;
                        let probe = Math.random() * 10;
                        if (probe < 1) {
                            munizioni.set(msg.author.id, 0);
                            console.log(prob);
                            morti++
                            vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                            userMorti.push(vittimauser.id);
                            vittima.setNickname("MORTO ☠")
                            return;
                        } else {
                            fuoriCombattimento++
                            userFuoriCombattimento.set(vittimauser.id, true)
                            vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                            munizioni.set(msg.author.id, 0);
                        }
                    }
                }
            }
        }
    }


    if (msg.content.startsWith(prefix + "cannoneggia")) { //Ships gonna shoot mate
        if (!battagliaInCorso) return; {
            if (userMorti.includes(msg.author.id) || userFuoriCombattimento.has(msg.author.id)) {} else {
                if (classi.has(msg.author.id) && porti.includes(msg.channel.id)) {

                    let prob = Math.random() * 10;
                    let vittima = msg.mentions.members.first();
                    let vittimauser = msg.mentions.users.first();
                    if (munizioni.get(msg.author.id) == 0) {
                        return msg.reply(" devi ricaricare!");
                    } else {
                        msg.channel.send("https://lh3.googleusercontent.com/proxy/rxX5eGw8DbxsFkj6oQY9k7jCqFSp5vRkq5lrub7IEghu222dOAuK1tFYHrbWQqyzj1D_copE0rfZMhk2SxSX-bkzF4_nLyXtbk-ntp4hDHeRl-yn9CBefQ58d2uy5hNCFZl_k7u-uGepV_c").then(console.log()).catch(console.error);
                        if (!vittima || vittima == msg.member) {
                            return msg.reply(" uso corretto: /spara + @<Utente>");
                        }

                        if (prob > 5) {
                            //vita.set(vittimauser.id, (vita.get(vittimauser.id)-(Math.random()*23)+9));
                            //console.log(vita.get(vittimauser.id))
                            msg.reply(" colpito! ");
                            // if (vita.get(vittimauser.id) < 1) {
                            if (!vittima) return;
                            msg.reply(" colpito e messo fuori gioco! ");
                            let probe = Math.random() * 10;
                            if (probe < 1) {
                                munizioni.set(msg.author.id, 0);
                                console.log(prob);
                                morti++
                                vittima.roles.set(['751063437504675852']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                userMorti.push(vittimauser.id);
                                vittima.setNickname("MORTO ☠")
                                return;
                            } else {
                                fuoriCombattimento++
                                userFuoriCombattimento.set(vittimauser.id, true)
                                vittima.roles.set(['751094437148622848']); //!!CHANGE THE ID IF YOU DON'T WANT AN ERROR!!
                                munizioni.set(msg.author.id, 0);
                            }
                        }
                        //msg.push(vittimauser.id); ?? IDK what I wanted to do here but surely I was drunk or something
                        // }
                        else {
                            munizioni.set(msg.author.id, (munizioni.get(msg.author.id) - 1))
                            return msg.reply(" mancato!");
                        }
                        munizioni.set(msg.author.id, 0);
                        bombardamenti++
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
