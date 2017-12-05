module.exports = function AutoPot(dispatch) {
	
	let cid = null,
		player,
		inCombat,
		ItemID = null,
		mpCd = false,
		hpCd = false,
		enabled = true
	
	dispatch.hook('S_LOGIN', 2, event => {
		cid = event.cid
		player = event.name
	})	
	
	dispatch.hook('S_USER_STATUS', 1, event => { 
		if(event.target.equals(cid)) {
			if(event.status == 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})
	
	dispatch.hook('S_CREATURE_CHANGE_HP', 3, event => {
		if (!enabled) return
		
		if(!hpCd && event.target.equals(cid) && (event.curHp <= event.maxHp/2)) { // Change value here
			ItemID = 6552
			useItem()
			hpCd = true
			setTimeout(function(){ hpCd = false }, 10000)
		}
	})

	dispatch.hook('S_PLAYER_CHANGE_MP', 1, event => {
		if (!enabled) return
		
		if(!mpCd && event.target.equals(cid) && (event.currentMp <= event.maxMp/2)) { // Change value here
			ItemID = 6562
			useItem()
			mpCd = true
			setTimeout(function(){ mpCd = false }, 10000)
		}
	})
	
	function useItem() {
		if(inCombat){
			dispatch.toServer('C_USE_ITEM', 1, {
				ownerId: cid,
			    item: ItemID,
			    id: 0,
			    unk1: 0,
			    unk2: 0,
			    unk3: 0,
			    unk4: 1,
			    unk5: 0,
			    unk6: 0,
			    unk7: 0,
			    x: 0, 
			    y: 0, 
			    z: 0, 
			    w: 0, 
			    unk8: 0,
			    unk9: 0,
			    unk10: 0,
			    unk11: 1,
			})	
		}
	}
	
	dispatch.hook('C_CHAT', 1, event => {
		if(/^<FONT>!autopot<\/FONT>$/i.test(event.message)) {
			if(!enabled) {
				enabled = true
				message('AutoPot <font color="#00ff99">Enabled</font>')
			}
			else {
				enabled = false
				message('AutoPot <font color="#ff3300">Disabled</font>')
			}
			return false
		}
	})
	
	function message(msg) {
		dispatch.toClient('S_WHISPER', 1, {
			player: cid,
			unk1: 0,
			gm: 0,
			unk2: 0,
			author: 'AutoPot',
			recipient: player,
			message: msg
		})
	}
}
