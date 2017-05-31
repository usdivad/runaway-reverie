let path_audio = "/path/to/audio/assets/";
let vol = 0.75;

// Create MultiSoundPlayers...
// ...for guitar samples
let tail_tabguitar = path_audio + "Tabs/" + "tail guitar.mp3";
let msp_tabguitar = new Sup.Audio.MultiSoundPlayer(
  path_audio + "Tabs/" + "init guitar.mp3",
  path_audio + "Tabs/" + "loop guitar.mp3",
  {
    0: tail_tabguitar,
    8: tail_tabguitar,
    16: tail_tabguitar,
    25: tail_tabguitar
  },
  vol,
  {logOutput: this.logOutput}
);

// ...for reversed guitar samples
let msp_tabrev = new Sup.Audio.MultiSoundPlayer(
  path_audio + "Tabs/" + "init guitar rev.mp3",
  path_audio + "Tabs/" + "loop guitar rev.mp3",
  {
    0: path_audio + "Tabs/" + "tail guitar rev.mp3"
  },
  0,
  {active: true, logOutput: this.logOutput}
);

// ...for timestretched guitar samples
let msp_stretch = new Sup.Audio.MultiSoundPlayer(
  path_audio + "Tabs/" + "initAndLoop stretch.mp3",
  path_audio + "Tabs/" + "initAndLoop stretch.mp3",
  {
    0: path_audio + "Tabs/" + "tail stretch.mp3"
  },
  0,
  {active: true, logOutput: this.logOutput}
);

// Create params object to feed into Conductor
let params = {
  bpm: 112,
  timesig: 34,
  players: {
    "guitar": msp_tabguitar,
    "rev": msp_tabrev,
    "stretch": msp_stretch
  }
};

// Construct the conductor
let conductor = new Sup.Audio.Conductor(
  params.bpm,
  params.timesig,
  params.players
);

// Start the conductor
conductor.start();

// Schedule an event
conductor.scheduleEvent(250, function() {
  Sup.Log("250 milliseconds have passed since the conductor has begun");
});

// Fade the guitar out over an entire phrase
conductor.fadePlayer(
  "guitar",
  0,
  conductor.getMillisecondsLeftUntilNextDownbeat(params.bpm)
);

// Deactivate all players after two phrases
conductor.scheduleEvent(
  conductor.getMillisecondsLeftUntilNextDownbeat(params.bpm) * 2,
  function() {
    conductor.deactivateAllPlayers();
  }
);
