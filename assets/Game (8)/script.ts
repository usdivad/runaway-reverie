// links to ext libs
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

// audio tests
let inst = "drums - dub remix kit";
inst = "riff";
let path_audio = "Audio/";
let path_instrumentalEntrance = path_audio + "Instrumental Entrance/";
let msp = new Sup.Audio.MultiSoundPlayer(
  path_instrumentalEntrance+"init " + inst + ".mp3",
  path_instrumentalEntrance+"loop " + inst + ".mp3",
  {
    14: path_instrumentalEntrance+"tail " + inst + ".mp3", // todo: automagically collect transitionBeats from the tail beets
  },
  1.0
);
Sup.log(msp);

let conductor = new Sup.Audio.Conductor(180, 15, [14], {"msp": msp});
conductor.start(); // start playing!
Sup.log(conductor);

Sup.setTimeout(6000, function() { // let conductor run through an init and a loop, and then set transition
  conductor.setTransition(true);
  Sup.log("conductor now transitioning");
});

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
// Sup.loadScene("Room Scene");
let playerActor = Sup.getActor("Player");