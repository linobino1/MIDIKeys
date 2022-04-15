// If you're using the Web MIDI API, you probably have a message handler function that looks somewhat
// similar to this...

function midiMessageReceived(msg) {
	var cmd = msg.data[0] >> 4;
	var channel = msg.data[0] & 0xf;
	var noteNumber = msg.data[1];
	var velocity = msg.data[2];

	if (cmd == 8) {
		myNode.noteOff(0);
	} else if (cmd == 9) {
		myNode.noteOn(0);
	}
}

// import MidiKeys in your project file packages fake MIDI messages the same as a normal message,
// so you can then just attach your message handler to MIDI keys and you're done
import { MidiKeys } from './lib/MIDIKeys/midikeys.js'
MidiKeys.setup(midiMessageReceived)