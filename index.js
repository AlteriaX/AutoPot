module.exports = function AutoPot(mod) {
	const path = require('path'),
		fs = require('fs'),
		command = mod.command || mod.require.command
	
	let gameId,
		job,
		inCombat,
		settings,
		ItemID = null,
		mpCd = false,
		hpCd = false,
		enabled = true,
		logininfo = true
		
	try {
		settings = require('./settings.json')
	} catch(e) {
		settings = {
			"HPpercentage": "25",
			"MPpercentage": "50"
		}
		saveSettings()
	}
	
	mod.hook('S_LOGIN', mod.majorPatchVersion >= 86 ? 14 : 13, event => {
		gameId = event.gameId
		job = (event.templateId - 10101) % 100
		logininfo = true
	})
	
	mod.hook('S_SPAWN_ME', 3, event => { loginMsg() })
	
	mod.hook('S_USER_STATUS', 3, event => { 
		if(event.gameId === gameId) {
			if(event.status === 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})
	
	mod.hook('S_CREATURE_CHANGE_HP', 6, event => {
		if (!enabled) return
		
		if(!hpCd && event.target === gameId && (event.curHp.toString() <= event.maxHp.toString()*(settings.HPpercentage/100))) {
			ItemID = 6552
			useItem()
			hpCd = true
			setTimeout(function(){ hpCd = false }, 10000)
		}
	})

	mod.hook('S_PLAYER_CHANGE_MP', 1, event => {
		if (!enabled) return
		
		if(!mpCd && event.target === gameId && (event.currentMp <= event.maxMp*(settings.MPpercentage/100))) {
			ItemID = 6562
			useItem()
			mpCd = true
			setTimeout(function(){ mpCd = false }, 10000)
		}
	})
	
	function useItem() {
		if(inCombat || job === 7){
			mod.toServer('C_USE_ITEM', 3, {
				gameId: gameId,
			    id: ItemID,
			})	
		}
	}
	
	function loginMsg() {
		if(!logininfo) return
		command.message(`AutoPot Info:
HP Pot will be used under <font color="#ff3333">${settings.HPpercentage}% HP</font>
MP Pot will be used under <font color="#0099ff">${settings.MPpercentage}% MP</font>
Usage: <font color="#ffffff">ap</font> - Toggle on/off
              <font color="#ffffff">ap [hp | mp] [value]</font> - Set % HP/MP
              <font color="#ffffff">ap info</font> - Show current settings`)
		logininfo = false
	}
		
	
	function saveSettings() {
		fs.writeFile(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 4), err => {
		})
	}
	
	command.add('ap', (type, value) => {
		switch (type) {
			case undefined:
				enabled = !enabled
				command.message('[AutoPot] ' + (enabled ? 'enabled' : 'disabled'))
				break
			case "info":
				logininfo = true
				loginMsg()
				break
			case "hp":
				settings.HPpercentage = value
				command.message('[AutoPot] HP Pot will be used under ' + value + '% HP.')
				break
			case "mp":
				settings.MPpercentage = value
				command.message('[AutoPot] MP Pot will be used under ' + value + '% MP.')
				break
		}
		saveSettings()
	})
}
