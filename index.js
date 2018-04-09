const Command = require('command')

module.exports = function AutoPot(dispatch) {
	const command = Command(dispatch)
	
	let gameId = null,
		inCombat,
		ItemID = null,
		mpCd = false,
		hpCd = false,
		enabled = true
	
	dispatch.hook('S_LOGIN', 9, event => {
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
		if (!enabled) return
		
		if(!hpCd && event.target.equals(gameId) && (event.curHp <= event.maxHp/4)) { // Change value here
			ItemID = 6552;
			useItem();
			hpCd = true;
			setTimeout(function(){ hpCd = false }, 10000);
		}
	})

	dispatch.hook('S_PLAYER_CHANGE_MP', 1, event => {
		if (!enabled) return
		
		if(!mpCd && event.target.equals(gameId) && (event.currentMp <= event.maxMp/2)) { // Change value here
			ItemID = 6562;
			useItem();
			mpCd = true;
			setTimeout(function(){ mpCd = false }, 10000);
		}
	})
	
	function useItem() {
		if(inCombat){
			dispatch.toServer('C_USE_ITEM', 1, {
				ownerId: gameId,
			    item: ItemID,
			})	
		}
	}
	
	command.add('autopot', (arg) => {
        enabled = !enabled;
        command.message('(AutoPot) ' + (enabled ? 'enabled' : 'disabled'));
    })
	
}
