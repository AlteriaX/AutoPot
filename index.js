const Command = require('command')

module.exports = function AutoPot(dispatch) {
	const command = Command(dispatch),
		path = require('path'),
	    fs = require('fs');
	
	let gameId = null,
		inCombat,
		ItemID = null,
		mpCd = false,
		hpCd = false,
		enabled = true
		
    try {
		settings = require('./settings.json');
	} catch(e) {
		settings = {
			"HPpercentage": "25",
            "MPpercentage": "50"
		};
		saveSettings();
	}
	
	dispatch.hook('S_LOGIN', 10, event => {
		gameId = event.gameId
	})	
	
	dispatch.hook('S_USER_STATUS', 2, event => { 
		if(event.gameId == gameId) {
			if(event.status == 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})
	
	dispatch.hook('S_CREATURE_CHANGE_HP', 6, event => {
		if (!enabled) return;
		
		if(!hpCd && event.target == gameId && (event.curHp <= event.maxHp.toString()*(settings.HPpercentage/100))) {
			ItemID = 6552;
			useItem();
			hpCd = true;
			setTimeout(function(){ hpCd = false }, 10000);
		}
	})

	dispatch.hook('S_PLAYER_CHANGE_MP', 1, event => {
		if (!enabled) return;
		
		if(!mpCd && event.target == gameId && (event.currentMp <= event.maxMp*(settings.MPpercentage/100))) {
			ItemID = 6562;
			useItem();
			mpCd = true;
			setTimeout(function(){ mpCd = false }, 10000);
		}
	})
	
	function useItem() {
		if(inCombat){
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: gameId,
			    id: ItemID,
			})	
		}
	}
	
	function saveSettings() {
        fs.writeFile(path.join(__dirname, 'settings.json'), JSON.stringify(settings, null, 4), err => {
        });
    }
	
	command.add('autopot', (arg) => {
        enabled = !enabled;
        command.message('(AutoPot) ' + (enabled ? 'enabled' : 'disabled'));
    })
	
	command.add('set', (type, value) => {
		switch (type) {
			case "hp":
                settings.HPpercentage = value;
				command.message('HP Pot will be used under ' + value + '% HP.');
                break;
            case "mp":
                settings.MPpercentage = value;
				command.message('MP Pot will be used under ' + value + '% MP.');
                break;
		}
		saveSettings();
	})
	
}
