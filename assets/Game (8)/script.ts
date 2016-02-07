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
let path_audio = "Audio/";
let path_instrumentalEntrance = path_audio + "Instrumental Entrance/";
let msp = new Sup.Audio.MultiSoundPlayer(
  path_instrumentalEntrance+"init riff.mp3",
  path_instrumentalEntrance+"loop riff.mp3",
  [
    {
      "audio": path_instrumentalEntrance+"tail riff.mp3",
      "beat": 8
    }
  ],
  1.0
);
Sup.log(msp);

let conductor = new Sup.Audio.Conductor(60, 7, [6], {msp: msp});
conductor.start();
Sup.log(conductor);

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