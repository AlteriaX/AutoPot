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
		config = require('./config.json');
	} catch(e) {
		config = {
			"HPpercentage": "25",
            "MPpercentage": "50"
		};
		saveConfig();
	}
	
	dispatch.hook('S_LOGIN', 10, event => {
		gameId = event.gameId
	})	
	
	dispatch.hook('S_USER_STATUS', 1, event => { 
		if(event.target.equals(gameId)) {
			if(event.status == 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})
	
	dispatch.hook('S_CREATURE_CHANGE_HP', 6, event => {
		if (!enabled) return;
		
		if(!hpCd && event.target.equals(gameId) && (event.curHp <= event.maxHp*(config.HPpercentage/100))) {
			ItemID = 6552;
			useItem();
			hpCd = true;
			setTimeout(function(){ hpCd = false }, 10000);
		}
	})

	dispatch.hook('S_PLAYER_CHANGE_MP', 1, event => {
		if (!enabled) return;
		
		if(!mpCd && event.target.equals(gameId) && (event.currentMp <= event.maxMp*(config.MPpercentage/100))) {
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
	
	function saveConfig() {
        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 4), err => {
        });
    }
	
	command.add('autopot', (arg) => {
        enabled = !enabled;
        command.message('(AutoPot) ' + (enabled ? 'enabled' : 'disabled'));
    })
	
	command.add('set', (type, value) => {
		switch (type) {
			case "hp":
                config.HPpercentage = value;
				command.message('HP Pot will be used under ' + value + '% HP.');
                break;
            case "mp":
                config.MPpercentage = value;
				command.message('MP Pot will be used under ' + value + '% MP.');
                break;
		}
		saveConfig();
	})
	
}
