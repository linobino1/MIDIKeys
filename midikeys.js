/**
 * allows us to set the data property, which is read-only in MIDIMessageEvent
 */
class MyMIDIMessageEvent extends MIDIMessageEvent {
    data = null
}

export class MidiKeys {
	static KEY_TYPE_NONE = 0
	static KEY_TYPE_CONTROL = 1
	static KEY_TYPE_NOTE = 2

	static map = {
		qwertz: {
			// note keys
			65: 0,	// A -> C
			87: 1,	// W -> C#
			83: 2,	// S -> D
			69: 3,	// E -> D#
			68: 4,	// D -> E
			70: 5,	// F -> F
			84: 6,	// T -> F#
			71: 7,	// G -> G
			90: 8,	// Z -> G#
			72: 9,	// H -> A
			85: 10,	// U -> A#
			74: 11,	// J -> B
			75: 12,	// K -> C
			79: 13,	// O -> C#
			76: 14,	// L -> D
			80: 15,	// P -> D#
			186: 16,	// Ö -> E
			222: 17,	// Ä -> F

			// control keys
			89: {keydown: () => this.octaveDown()},
			88: {keydown: () => this.octaveUp()},
			67: {keydown: () => this.velDown()},
			86: {keydown: () => this.velUp()},
			32: {keydown: () => this.pedal(1), keyup: () => this.pedal(0)}
		}
	}
	static MIN_OCTAVE = 0
	static MAX_OCTAVE = 9
	static MIN_VEL = 1
	static MAX_VEL = 127
	static VEL_STEP = 10

	static verbose = false
	static octave = 3
	static vel = 127
	static keys_pressed = []

	static COMMAND_KEYDOWN = 0x9
	static COMMAND_KEYUP = 0x8
	static COMMAND_CC = 0xB
	static COMMAND_CC_PEDAL = 0x4

	static log(...o) {
		if (!this.verbose) return
		console.log("MidiKeys: OCT", this.octave, " VEL", this.vel, ...o)
	}

	static getKeyboardLayout() {
		return 'qwertz'
	}

	static getMap() {
		if (!(this.getKeyboardLayout() in this.map)) {
			throw "undefined keyboard layout"
		}
		return this.map[this.getKeyboardLayout()]
	}

	static setup(api = (msg) => console.log("MidiKeys: no api to deliver message", msg)) {
		this.api = api
		document.addEventListener("keydown", function(event) {
			MidiKeys.handleKeyEvent(event)
		});
		document.addEventListener("keyup", function(event) {
			MidiKeys.handleKeyEvent(event)
		});
	}

	static handleKeyEvent(event) {

		let keyId = this.getKeyIdOfKeyEvent(event)
		let keyType = this.getKeyType(keyId)
		
		// some other key has been pressed or released
		if (keyType === this.KEY_TYPE_NONE) return

		// prevent keys that are pressed from constantly firing keypress event
		if (event.type === 'keydown') {
			if (this.keys_pressed[keyId]) return
			this.keys_pressed[keyId] = true
		} else {
			this.keys_pressed[keyId] = false
		}

		let keyMapped = this.getMap()[keyId]

		// control key?
		if (keyType === this.KEY_TYPE_CONTROL) {
			if (event.type in keyMapped) {
				(keyMapped[event.type])()
				this.log()
			}
		}

		// note key?
		if (keyType === this.KEY_TYPE_NOTE) {
			let pitch = this.getPitch(keyMapped)
			if (event.type === 'keydown') {
				this.noteTrigger(pitch)
			} else {
				this.noteRelease(pitch)
			}
		}
	}

	static getKeyIdOfKeyEvent(event) {
		return (typeof event.which === "number") ? event.which : event.keyCode
	}

	static getKeyType(keyId) {
		if (!(keyId in this.getMap())) return this.KEY_TYPE_NONE
		let res = this.getMap()[keyId]
		if (typeof res === 'number') return this.KEY_TYPE_NOTE
		return this.KEY_TYPE_CONTROL
	}

	static noteTrigger(pitch) {
		this.sendMessage(this.COMMAND_KEYDOWN, pitch, this.vel)
	}

	static noteRelease(pitch) {
		this.sendMessage(this.COMMAND_KEYUP, pitch)
	}

	static sendMessage(command, pitch, vel) {
		let data = new Uint8Array(3)
        data[0] = (command << 4) + 0x00; // Send the command on channel 0
        data[1] = pitch; // Attach the midi note
        data[2] = vel;

		let msg = new MyMIDIMessageEvent('MIDIMessageEvent')
		msg.data = data
		console.log("MSG", data)

		this.api(msg)
	}

	static getPitch(note) {
		return (this.octave * 12) + note
	}

	/** CONTROLS **********************************************/
	static octaveDown() {
		this.octave = Math.max(this.octave - 1, this.MIN_OCTAVE)
	}
	
	static octaveUp() {
		this.octave = Math.min(this.octave + 1, this.MAX_OCTAVE)
	}

	static velDown() {
		this.vel = Math.max(this.vel - this.VEL_STEP, this.MIN_VEL)
	}

	static velUp() {
		this.vel = Math.min(this.vel + this.VEL_STEP, this.MAX_VEL)
	}
	
	static pedal(on) {
		if (on) {
			// vel >= 64: pedal on
			this.sendMessage(this.COMMAND_CC, this.COMMAND_CC_PEDAL, 127)
		} else {
			// vel < 64: pedal off
			this.sendMessage(this.COMMAND_CC, this.COMMAND_CC_PEDAL, 0)
		}
		this.log("PEDAL", !!on)
	}
}