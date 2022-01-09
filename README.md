# discordAtWar v2 (reached final commit)
Pew pew pew but polished

### Known bugs
- Because of how the role cache works, players cannot be registered if they don't first send a message while the bot is online, if the bot shutsdown the cache is wiped.

# What is this madness?
This is the bot used in the Italian discord-RP KOI, you can make wars with it reworked 23/March/2021, you can still find the first original code in the "legacy" branch. Please always link this repos as source. 

## What features are in the bot?
- [x] Classes for players (Infantry, arty, ships, cavalry)
- [x] Commands for get cover and for aiming
- [x] Commands for shooting
- [ ] Commands for use torpedos (only ships) __WIP, postponed to v3__
- [x] Commands for melee fighting (only land classes)

#### I want to contribute! 
That's awesome, feel free to contact me in anyway you want to __(post scriptum: do not ring at my door, thanks)__  and I will review your code and add it in the file along with credits

# Node dependencies:
> discord.js (latest stable/v12)
> 
> discord-reply

# DISCLAIMER
Please, do not ask me basic questions about how to make this work, before trying to use this at least learn how to make a "ping/pong" bot, then try to do something with this code. This code has reached already EOL as this is the final release. I will push a new version later on reworking the whole code as I am still having issues with the fact that this is based on the legacy one and I was inexperienced at the time. Discord At War v3 will be based on fresh code and will use DiscordJS v13 (or v14 if it will be already out since I don't know when I'll be back on this project) and will achieve modularity. 
