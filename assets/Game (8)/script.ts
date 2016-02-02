// link to ext libs

declare const window;
const timbreLink = window.document.createElement("script");
// timbreLink.src = "https://cdn.rawgit.com/usdivad/kino/master/web/lib/timbre.js";
timbreLink.src = "libraries/kino/lib/timbre.js"; // -> Superpowers/Contents/Resources/system/game/public/kino/lib/timbre.js
window.document.body.appendChild(timbreLink);

const kinoLink = window.document.createElement("script");
// kinoLink.src = "https://cdn.rawgit.com/usdivad/kino/master/web/src/Kino.js";
kinoLink.src = "libraries/kino/src/Kino.js";
window.document.body.appendChild(kinoLink);


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