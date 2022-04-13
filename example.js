// If you're using the Web MIDI API, you probably have a message handler function that looks somewhat
// similar to this...

function midiMessageReceived (msgs) {
    for (i=0; i < msgs.length; i++) {
      var cmd = msgs[i].data[0] >> 4;
      var channel = msgs[i].data[0] & 0xf;
      var noteNumber = msgs[i].data[1];
      var velocity = msgs[i].data[2];
  
      if (cmd==8) {
        myNode.noteOff(0);
      } else if (cmd == 9) {
        myNode.noteOn(0);
      } 
    }
  }
  
  // Including Midikeys.js in your project file packages fake MIDI messages the same as a normal message,
  // so you can then just attach your message handler to MIDI keys and you're done
  
  MIDIKeys.onmessage = midiMessageReceived;