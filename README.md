# Oscillope.js
=========

Simple Javascript Synthesizer

This is basically just a wrapper around the oscillator in the web audio api.

## Usage

    var context = new window.webkitAudioContext(), //Make you a context
            osc = context.createOscillope();       //Make you an oscillope

    osc.connect(context.destination);              //Connect like any other audioNode
    osc.adsr(0.005, 0.05, 0.5, 1);                 //ADSR is in seconds

    //MidiNote #, startTime, duration
    osc.makeNote(60, context.currentTime, 1);

    //...that's all folks
