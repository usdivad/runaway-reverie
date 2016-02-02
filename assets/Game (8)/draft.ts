// links to ext libs
declare const window;
let linkType = "external"; // "external" for dev/testing, "local" for production

let scriptLinks = {
  "timbre.js": {
    "external": "https://cdn.rawgit.com/usdivad/kino/master/web/lib/timbre.js",
    "local": "libraries/kino/lib/timbre.js" // -> Superpowers/Contents/Resources/system/game/libraries/kino/lib/timbre.js
  },
  "Kino.js": {
    "external": "https://cdn.rawgit.com/usdivad/kino/master/web/src/Kino.js",
    "local": "libraries/kino/src/Kino.js"
  },
  "audio.js": {
    "external": "https://cdn.rawgit.com/usdivad/kino/master/web/src/audio.js",
    "local": "libraries/kino/src/audio.js"
  }
}

addExternalScript("timbre.js", scriptLinks, linkType, window);
addExternalScript("Kino.js", scriptLinks, linkType, window);


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