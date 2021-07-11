//---------VALUES---------\\

//CONSTs
const discord = require('discord.js');
require('discord-reply');
const client = new discord.Client();
const fs = require('fs');

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
var { translationDeaths, translationShots, translationBombings, translationKnockedOut, translationBattleStarted, translationBattleEnded, translationBattleOngoing, translationNoBattlesOngoing, translationBattleOf, translationBattleStats, translationReloadingConfiguration, translationMustReload, translationHit, translationHitAndSocked, translationUsage, translationUser, translationMustBeNear, translationMustBeInAShipyard, translationMiss, translationAlreadyKnockedOut, translationNotAMedic } = require('./lang.json');
var { infantryAmmo, cavarlyAmmo, navyAmmo, artilleryAmmo, deadPlayers, infantryRole, cavalryRole, artilleryRole, navyRole, adminRole, woundedRole, prefix, startbattle, endbattle, setclasses, addmedic, removemedic, addinfantry, addcavalry, addship, addartillery, remove, reload, cure, takecover, aim, getnear, kickoff, stab, shoot, navalcannon, reloadconf, deathNickname, drownNickname } = require('./configs.json');

//COLLECTIONS
var deadMen = [];
const shipyards = ["863516974268547072"];
let knockedOutMen = new Map();
let hidden = new Map();
let aiming = new Map();
let classes = new Map();
let ammo = new Object();
let medics = new Map();
let health = new Map();
let usersInProximity = new Map();

//--------FUNCTIONS--------\\

function resetBattleStats() {
    deaths = 0
    knockedOut = 0
    shots = 0
    bombings = 0
    ammo = new Object();
    hidden = new Map();
	usersInProximity = new Map();
}

function setClasses(msg) {
			let guild = msg.channel.guild
            let roleInfantry = guild.roles.cache.get(infantryRole)
            roleInfantry.members.each(x => {
                classes.set(x.user.id, "infantry")
				health.set(x.user.id, 10);
                ammo[x.user.id] = infantryAmmo;
            });
            let roleCavalry = guild.roles.cache.get(cavalryRole)
            roleCavalry.members.each(x => {
                classes.set(x.user.id, "cavarly")
				health.set(x.user.id, 10);
                ammo[x.user.id] = cavarlyAmmo;
            });
            let roleNavy = guild.roles.cache.get(navyRole)
            roleNavy.members.each(x => {
                classes.set(x.user.id, "navy")
				health.set(x.user.id, 100);
                ammo[x.user.id] = navyAmmo;
            });
            let roleart = guild.roles.cache.get(artilleryRole)
            roleart.members.each(x => {
                classes.set(x.user.id, "artillery")
				health.set(x.user.id, 25);
                ammo[x.user.id] = artilleryAmmo;
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

const capitalize = (str) => {
    if(typeof str === 'string') {
        return str.replace(/^\w/, c => c.toUpperCase());
    } else {
        return '';
    }
};

function reloadConfs() {
 var { translationDeaths, translationShots, translationBombings, translationKnockedOut, translationBattleStarted, translationBattleEnded, translationBattleOngoing, translationNoBattlesOngoing, translationBattleOf, translationBattleStats, translationReloadingConfiguration, translationMustReload, translationHit, translationHitAndSocked, translationUsage, translationUser, translationMustBeNear, translationMustBeInAShipyard, translationMiss, translationAlreadyKnockedOut } = require('./lang.json');
 var { infantryAmmo, cavarlyAmmo, navyAmmo, artilleryAmmo, deadPlayers, infantryRole, cavalryRole, artilleryRole, navyRole, adminRole, woundedRole, prefix, startbattle, endbattle, setclasses, addmedic, removemedic, addinfantry, addcavalry, addship, addartillery, remove, reload, cure, takecover, aim, getnear, kickoff, stab, shoot, navalcannon, reloadconf, deathNickname, drownNickname } = require('./configs.json');
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
                setClasses(msg);
                msg.lineReply(` ${translationBattleStarted}`);
            } else {
                msg.lineReply(` ${translationBattleOngoing} ${capitalize(battleChannelName.split("-").join(" "))}`);
            }
        }
	}

        if (msg.content.startsWith(prefix + reloadconf)) {
			msg.lineReply(` ${translationReloadingConfiguration}`);
            reloadConfs();
        
		
        if (msg.content.startsWith(prefix + "info")) {
			let answ = new discord.MessageEmbed();
            answ.setColor("RANDOM");
            answ.setFooter(`https://github.com/Cristagolem/discordAtWar/`)
            answ.setDescription("This bot was created from the GitHub repository Discord At War by Cristiano Barone\nDo not remove this message as you are required by the BSL 1.0 license to include credits");
            answ.setTitle(`Discord At War v2`);
            msg.lineReplyNoMention(answ);
        }

        if (msg.content.startsWith(prefix + setclasses)) {
            setClasses(msg);
        }

        if (msg.content.startsWith(prefix + endbattle)) {
            if (battleTakingPlace) {
                battleTakingPlace = false
                battleChannel = ""
                let answ = new discord.MessageEmbed();
                answ.setColor("RANDOM");
                answ.setFooter(`${translationBattleOf} ${capitalize(battleChannelName.split("-").join(" "))}`)
                answ.setDescription(translationBattleEnded + "\n"+ translationDeaths +": " + deaths + "\n"+translationShots+": " + shots + "\n"+ translationKnockedOut +": " + knockedOut + "\n"+ translationBombings +": " + bombings);
                answ.setTitle(`${translationBattleStats}`);
                msg.lineReplyNoMention(answ);
            } else {
                msg.lineReplyNoMention(` ${translationNoBattlesOngoing}`);
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
			ammo[vittimauser.id] = infantryAmmo;
        }

        if (msg.content.startsWith(prefix + addcavalry)) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "cavarly");
            health.set(vittimauser.id, 10);
			ammo[vittimauser.id] = cavarlyAmmo;
        }

        if (msg.content.startsWith(prefix + addship)) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "navy");
            health.set(vittimauser.id, 100);
			ammo[vittimauser.id] = navyAmmo;
        }



        if (msg.content.startsWith(prefix + remove)) {
            let vittimauser = msg.mentions.users.first();
            classes.delete(vittimauser.id);
            ammo.delete(vittimauser.id);
        }

        if (msg.content.startsWith(prefix + addartillery)) {
            let vittimauser = msg.mentions.users.first();
            classes.set(vittimauser.id, "artillery");
            health.set(vittimauser.id, 25);
			ammo[vittimauser.id] = artilleryAmmo;
        }

    }

    if (msg.content.startsWith(prefix + reload)) {
        if (classes.get(msg.author.id) == "infantry") {
			ammo[msg.author.id] = infantryAmmo;
        }
        if (classes.get(msg.author.id) == "cavarly") {
			ammo[msg.author.id] = cavarlyAmmo;
        }
        if (classes.get(msg.author.id) == "artillery") {
			ammo[msg.author.id] = artilleryAmmo;
        }
		if (classes.get(msg.author.id) == "navy") {
			ammo[msg.author.id] = navyAmmo;
        }
        msg.delete();
    }

    if (msg.content.startsWith(prefix + cure)) {
        if (medics.has(msg.author.id)) {
            let vittima = msg.mentions.members.first();
            let vittimauser = msg.mentions.users.first();
			if (knockedOutMen.has(vittimauser.id)) {
            knockedOutMen.delete(vittimauser.id)
            vittima.roles.set([]);
			}
			
			if (classes.get(vittimauser.id) == "infantry") {
				health.set(vittimauser.id, 10);
			}
			if (classes.get(msg.author.id) == "cavarly") {
				health.set(vittimauser.id, 10);
			}
			if (classes.get(msg.author.id) == "artillery") {
				health.set(vittimauser.id, 25);
			}
			if (classes.get(msg.author.id) == "navy") {
				health.set(vittimauser.id, 100);
			}

        } else return msg.lineReply(translationNotAMedic); 
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

    if (msg.content.startsWith(prefix + getnear)) {
	    if (hidden.has(msg.author.id)) hidden.delete(msg.author.id);
   		let vittimauser = msg.mentions.users.first();
		if (!vittimauser) return;
        usersInProximity.set(msg.author.id, vittimauser.id);
    }
	
    if (msg.content.startsWith(prefix + kickoff)) {
	    if (hidden.has(msg.author.id)) hidden.delete(msg.author.id);
   		let vittimauser = msg.mentions.users.first();
        usersInProximity.set(vittimauser.id, null);
    }

    if (msg.content.startsWith(prefix + stab)) {
	    if (hidden.has(msg.author.id)) hidden.delete(msg.author.id);
        if (!classes.has(msg.author.id)) return;
        if (!battleTakingPlace) return;
		
		let vittimauser = msg.mentions.users.first();
		let vittima = msg.mentions.members.first();
		
		if (!vittimauser) {
                    return msg.lineReply(translationUsage+prefix+stab+translationUser);
        }
        if (deadMen.includes(msg.author.id) || knockedOutMen.has(msg.author.id) || health.get(vittimauser.id) == NaN || health.get(vittimauser.id) == undefined) {} else { 
   		
			if (usersInProximity.get(msg.author.id) == vittimauser.id || usersInProximity.get(vittimauser.id) == msg.author.id) {
				let probe = Math.random() * 10;
				if (probe < 1) {
					deaths++
                    vittima.roles.set([ deadPlayers]);  
                    deadMen.push(vittimauser.id);
                    vittima.setNickname(deathNickname)
					msg.lineReply(translationHitAndSocked)
                    return;
                } else {
                    knockedOut++
                    knockedOutMen.set(vittimauser.id, true)
                    vittima.roles.set([ woundedRole]);  
					msg.lineReply(translationHitAndSocked)
                    return;
				}
				return;
			}
			
			msg.lineReply(translationMustBeNear);
		}
    }

    if (msg.content.startsWith(prefix + shoot)) { 
	    if (hidden.has(msg.author.id)) hidden.delete(msg.author.id);
        if (!classes.has(msg.author.id)) return;
        if (!battleTakingPlace) return;

        let vittima = msg.mentions.members.first();
        let vittimauser = msg.mentions.users.first();
		
        if (deadMen.includes(msg.author.id) || knockedOutMen.has(msg.author.id)) {} else {
			
            if (classes.get(msg.author.id) == "infantry" || classes.get(msg.author.id) == "cavarly") {
			
			if (health.get(vittimauser.id) == NaN || health.get(vittimauser.id) == undefined) return;
			
                let prob = Math.random() * 10;
                if (ammo[msg.author.id] == 0 || ammo[msg.author.id] == NaN || ammo[msg.author.id] == undefined) return msg.lineReply(" "+translationMustReload); 
                if (!vittima) {
                    return msg.lineReply(translationUsage+prefix+shoot+translationUser);
                }
                if (deadMen.includes(vittimauser.id) || knockedOutMen.has(vittimauser.id)) {
                    return msg.lineReplyNoMention(translationAlreadyKnockedOut);
                }

                if (classes.get(vittimauser.id) == "navy") {
                    if (!shipyards.includes(msg.channel.id)) {
                        return msg.lineReply(translationMustBeInAShipyard); //you cannot shoot a ship if you're not in a shipyard as she cannot shoot you
                    }
                }
                shots++

                if (vittima == msg.member) {
                    vittima.roles.set([ deadPlayers]);  
                    msg.lineReplyNoMention(translationHit);
                    deadMen.push(vittimauser.id);
                    vittima.setNickname(deathNickname)
                    ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                    return;
                }

                if (usersInProximity.get(msg.author.id) == vittimauser.id || usersInProximity.get(vittimauser.id) == msg.author.id) {
				let probe = Math.random() * 10;
				if (probe < 5) {
					deaths++
                    vittima.roles.set([ deadPlayers]);  
                    deadMen.push(vittimauser.id);
                    vittima.setNickname(deathNickname)
                    return;
                } else {
                    knockedOut++
                    knockedOutMen.set(vittimauser.id, true)
                    vittima.roles.set([ woundedRole]);  
                    return;
				}
			}

                if (hidden.has(vittimauser.id)) {

                    if (aiming.has(msg.author.id)) {
                        if (prob > 5) {
                            if (!vittima) return;
							health.set(vittimauser.id, Math.floor(Math.floor(health.get(vittimauser.id)-(Math.random()*7))))
                            if (health.get(vittimauser.id) >= 0) {
								msg.lineReplyNoMention(translationHit+" ("+health.get(vittimauser.id)+" :heart:)");
							} else {
								msg.lineReplyNoMention(translationHitAndSocked);
							}
                            let probe = Math.random() * 10;
							if (health.get(vittimauser.id) <= 0) {
                            if (probe < 1) {
								ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
                                vittima.setNickname(deathNickname)
                                return;
                            } else {
                                knockedOut++
                                knockedOutMen.set(vittimauser.id, true)
                                vittima.roles.set([ woundedRole]);  
								ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                return;
                            } }
							
                        }
                    }

                    if (prob > 7) {
                        if (!vittima) return;
							health.set(vittimauser.id, Math.floor(health.get(vittimauser.id)-(Math.random()*7)))
							if (health.get(vittimauser.id) >= 0) {
								msg.lineReplyNoMention(translationHit+" ("+health.get(vittimauser.id)+" :heart:)");
							} else {
								msg.lineReplyNoMention(translationHitAndSocked);
							}
                            let probe = Math.random() * 10;
							if (health.get(vittimauser.id) <= 0) {
                        if (probe < 1) {
							ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            console.log(prob);
                            deaths++
                            vittima.roles.set([ deadPlayers]);  
                            deadMen.push(vittimauser.id);
                            vittima.setNickname(deathNickname)
                            return;
                        } else {
                            knockedOut++
                            knockedOutMen.set(vittimauser.id, true)
                            vittima.roles.set([ woundedRole]);  
							ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            return;
							} }
                    }
                    else {
						ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                        return msg.lineReplyNoMention(translationMiss);
                    }
                } else {
                    if (aiming.has(msg.author.id)) {
                        if (prob > 2) {
                            if (!vittima) return;
							health.set(vittimauser.id, Math.floor(health.get(vittimauser.id)-(Math.random()*7)))
                            if (health.get(vittimauser.id) >= 0) {
								msg.lineReplyNoMention(translationHit+" ("+health.get(vittimauser.id)+" :heart:)");
							} else {
								msg.lineReplyNoMention(translationHitAndSocked);
							}
                            let probe = Math.random() * 10;
							if (health.get(vittimauser.id) <= 0) {
                            if (probe < 1) {
								ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
                                vittima.setNickname(deathNickname)
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
                            msg.lineReplyNoMention(translationMiss);
							ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            aiming.delete(msg.author.id);
                            return;
                        } }

                        if (prob > 5) {
                            if (!vittima) return;
							health.set(vittimauser.id, Math.floor(health.get(vittimauser.id)-(Math.random()*7)))
                            if (health.get(vittimauser.id) >= 0) {
								msg.lineReplyNoMention(translationHit+" ("+health.get(vittimauser.id)+" :heart:)");
							} else {
								msg.lineReplyNoMention(translationHitAndSocked);
							}
                            let probe = Math.random() * 10;
							if (health.get(vittimauser.id) <= 0) {
                            if (probe < 1) {
                                ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
                                vittima.setNickname(deathNickname)
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
                        }
                        else {
                            ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            aiming.delete(msg.author.id);
                            return msg.lineReplyNoMention(translationMiss);
                        }
                    } else {
						if (prob > 3) {
                            if (!vittima) return;
							health.set(vittimauser.id, Math.floor(health.get(vittimauser.id)-(Math.random()*7)))
                            if (health.get(vittimauser.id) >= 0) {
								msg.lineReplyNoMention(translationHit+" ("+health.get(vittimauser.id)+" :heart:)");
							} else {
								msg.lineReplyNoMention(translationHitAndSocked);
							}
                            let probe = Math.random() * 10;
							if (health.get(vittimauser.id) <= 0) {
                            if (probe < 1) {
                                ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
                                vittima.setNickname(deathNickname)
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
						
						} else {
                            ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                            aiming.delete(msg.author.id);
                            return msg.lineReplyNoMention(translationMiss);
                        } 
					}
                }
            } else {
                if (classes.has(msg.author.id) && classes.get(msg.author.id) == "artillery") {
                    if (ammo[msg.author.id] == 0) {
                        return msg.lineReply(translationMustReload);
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
                            msg.channel.send("https://tenor.com/view/cannon-artillery-army-military-war-gif-20094241").then(console.log()).catch(console.error);
                            msg.channel.setRateLimitPerUser(5)
                            bombings++
                            setTimeout(function() {
                                msg.channel.setRateLimitPerUser(0).then(console.log()).catch(console.error)
                            }, 5000)
                        }
                        if (!vittima) return;
						if (classes.get(vittimauser.id) == "navy" || classes.get(vittimauser.id) == "artillery") {
							if (!vittima) return;
							health.set(vittimauser.id, Math.floor(health.get(vittimauser.id)-(Math.random()*27)))
                            if (health.get(vittimauser.id) >= 0) {
								msg.lineReplyNoMention(translationHit+" ("+health.get(vittimauser.id)+" :heart:)");
								return;
							} else {
								msg.lineReplyNoMention(translationHitAndSocked);
							}
                            let probe = Math.random() * 10;
							if (health.get(vittimauser.id) <= 0) {
                            if (probe < 1) {
                                ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                                console.log(prob);
                                deaths++
                                vittima.roles.set([ deadPlayers]);  
                                deadMen.push(vittimauser.id);
								if (classes.get(vittimauser.id) == "navy") {
                                vittima.setNickname(drownNickname)
								} else {
                                vittima.setNickname(deathNickname)
								}
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
                        let probe = Math.random() * 10;
							if (probe < 1) {
								ammo[msg.author.id] = 0;
								deaths++
								vittima.roles.set([ deadPlayers]);  
								deadMen.push(vittimauser.id);
								vittima.setNickname(deathNickname)
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
    } }


    if (msg.content.startsWith(prefix + navalcannon)) {
        if (!battleTakingPlace) return; {
            if (deadMen.includes(msg.author.id) || knockedOutMen.has(msg.author.id)) {} else {
                if (classes.has(msg.author.id) && shipyards.includes(msg.channel.id) && classes.get(msg.author.id) == "navy") {

                    let prob = Math.random() * 10;
                    let vittima = msg.mentions.members.first();
                    let vittimauser = msg.mentions.users.first();
                    if (ammo[msg.author.id] == 0) {
                        return msg.lineReply(" "+translationMustReload);
                    } else {
                        msg.channel.send("https://lh3.googleusercontent.com/proxy/rxX5eGw8DbxsFkj6oQY9k7jCqFSp5vRkq5lrub7IEghu222dOAuK1tFYHrbWQqyzj1D_copE0rfZMhk2SxSX-bkzF4_nLyXtbk-ntp4hDHeRl-yn9CBefQ58d2uy5hNCFZl_k7u-uGepV_c").then(console.log()).catch(console.error);
                        if (!vittima || vittima == msg.member) {
                            return msg.lineReply(translationUsage+prefix+cannoneggia+translationUser);
                        }

						if (classes.get(vittimauser.id) == "navy" || classes.get(vittimauser.id) == "artillery") {
							if (!vittima) return;
							health.set(vittimauser.id, Math.floor(health.get(vittimauser.id)-(Math.random()*27)))
                            if (health.get(vittimauser.id) >= 0) {
								msg.lineReplyNoMention(translationHit+" ("+health.get(vittimauser.id)+" :heart:)");
								return;
							} else {
								msg.lineReplyNoMention(translationHitAndSocked);
							}
                            let probe = Math.random() * 10;
							if (health.get(vittimauser.id) <= 0) {
								if (probe < 1) {
									ammo[msg.author.id] = (ammo[msg.author.id] - 1);
									console.log(prob);
									deaths++
									vittima.roles.set([ deadPlayers]);  
									deadMen.push(vittimauser.id);
									if (classes.get(vittimauser.id) == "navy") {
										vittima.setNickname(drownNickname)
									} else {
										vittima.setNickname(deathNickname)
									}
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
						} else {
							if (prob > 5) {
								msg.lineReplyNoMention(translationHit);
								if (!vittima) return;
								msg.lineReplyNoMention(translationHitAndSocked);
								let probe = Math.random() * 10;
								if (probe < 1) {
									ammo[msg.author.id] = (ammo[msg.author.id] - 1);
									deaths++
									vittima.roles.set([ deadPlayers]);  
									deadMen.push(vittimauser.id);
									vittima.setNickname(deathNickname)
									return;
								} else {
									knockedOut++
									knockedOutMen.set(vittimauser.id, true)
									vittima.roles.set([ woundedRole]);  
									ammo[msg.author.id] = (ammo[msg.author.id] - 1);
								}
							}
							else {
								ammo[msg.author.id] = (ammo[msg.author.id] - 1);
								return msg.lineReplyNoMention(translationMiss);
							} 
						
						}
						
						ammo[msg.author.id] = (ammo[msg.author.id] - 1);
                        bombings++
                    }
                }
            }
        }
    }
});

// ::START UP::
if (startupArgs.length == 0) {
    console.log("missing token");
	process.exit();
} else client.login(startupArgs[0]);
