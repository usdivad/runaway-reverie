// cannon
let world = Sup.Cannon.getWorld();
world.gravity.set(0, -100, 0);
world.defaultContactMaterial.friction = 0.1;

let playerMaterial = new CANNON.Material("playerMaterial");
world.addContactMaterial(new CANNON.ContactMaterial(playerMaterial, world.defaultMaterial, {
  friction: 0,
  restitution: 0,
  contactEquationStiffness: 1e8,
  contactEquationRelaxation: 3
}));

// scene
Sup.loadScene("Room Scene");
let playerActor = Sup.getActor("Player");


/*
  AUDIO TESTS
*/

/*
// create MultiSoundPlayers for instrumental entrance
// riff
let vol = 0.5;
let inst = "riff";
let path_audio = "Audio/";
let path_instrumentalEntrance = path_audio + "Instrumental Entrance/";
let msp_riff = new Sup.Audio.MultiSoundPlayer(
  path_instrumentalEntrance+"init " + inst + ".mp3",
  path_instrumentalEntrance+"loop " + inst + ".mp3",
  {
    0: path_instrumentalEntrance+"tail " + inst + ".mp3" // <- passing in tail(s) as object
  },
  vol
);
// Sup.log(msp_riff);

// drums
inst = "drums - dub remix kit";
let msp_drums = new Sup.Audio.MultiSoundPlayer(
  path_instrumentalEntrance+"init " + inst + ".mp3", 
  path_instrumentalEntrance+"loop " + inst + ".mp3", // <- note that init and loop are two diff audio phrases!
  path_instrumentalEntrance+"tail " + inst + ".mp3", // <- passing in single tail as string
  vol,
  {active: false}
);
// Sup.log(msp_drums);

// msps for tab section
let msp_tabguitar = new Sup.Audio.MultiSoundPlayer(
  path_audio + "Tabs/" + "init guitar.mp3",
  path_audio + "Tabs/" + "loop guitar.mp3",
  {
    0: path_audio + "Tabs/" + "tail guitar.mp3"
  },
  vol
);

let msp_tabrev = new Sup.Audio.MultiSoundPlayer(
  path_audio + "Tabs/" + "init guitar rev.mp3",
  path_audio + "Tabs/" + "loop guitar rev.mp3",
  {
    0: path_audio + "Tabs/" + "tail guitar rev.mp3"
  },
  vol,
  {active: false}
);

// params to set as conductor's nextParams
let tabParams = {
  bpm: 112,
  timesig: 34,
  players: {
    "guitar": msp_tabguitar,
    "rev": msp_tabrev
  }
};

// create Conductor
let conductor = new Sup.Audio.Conductor(180, 15, {"riff": msp_riff, "drums": msp_drums});
conductor.start(); // start playing!
Sup.log(conductor);

// activate drums for second cycle, after just guitar init
Sup.setTimeout(4000, function() {
  conductor.activatePlayer("drums");
  Sup.log("drums activated for next cycle");
});

// let conductor run through another cycle (guitar: loop, drums: init),
// and then set transition to "tab" section
Sup.setTimeout(6000, function() {
  conductor.setNextParams(tabParams);
  conductor.setToNext(true);
  conductor.setTransition(true);
  Sup.log("conductor will transition next cycle");
});

Sup.setTimeout(18000, function() {
  conductor.activatePlayer("rev");
  Sup.log("activating reversed guitar for next cycle");
});
*/


// links to ext libs
/*
declare const window;
let linkType = "external"; // "external" for dev/testing, "local" for production

let scriptLinks = {
  "timbre.js": {
    "external": "https://cdn.rawgit.com/usdivad/Kino.js/master/lib/timbre.js",
    "local": "assets/External Libraries (36)/Kino.js/lib/timbre.js" // -> Superpowers/Contents/Resources/system/game/assets/External Libraries (36)/Kino.js/lib/timbre.js
  },
  "Kino.js": {
    "external": "https://cdn.rawgit.com/usdivad/Kino.js/master/src/Kino.js",
    "local": "assets/External Libraries (36)/Kino.js/src/Kino.js"
  },
  "audio.js": {
    "external": "https://cdn.rawgit.com/usdivad/Kino.js/master/src/audio.js",
    "local": "assets/External Libraries (36)/Kino.js/src/audio.js"
  }
}

addExternalScript("timbre.js", scriptLinks, linkType, window);
addExternalScript("Kino.js", scriptLinks, linkType, window);
// addExternalScript("audio.js", scriptLinks, linkType, window);
*/
