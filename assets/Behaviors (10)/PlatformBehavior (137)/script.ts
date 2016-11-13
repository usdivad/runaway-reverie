class PlatformBehavior extends Sup.Behavior {
  // private originalCannonBody : Sup.Cannon.Body;
  awake() {
    // this.originalCannonBody = this.actor.cannonBody;
  }

  update() {
    let playerActor = Sup.getActor("Player");
    let playerPos = playerActor.getPosition();
    let playerY = playerPos.y;
    
    let playerIsDreaming = playerActor.getBehavior(CharacterBehavior).isDreaming;
    let playerIsInChorus = playerActor.getBehavior(CharacterBehavior).isInChorus;
    
    let pos = this.actor.getPosition();
    
    let isCeiling = this.actor.getName() == "Ceiling"; // hacky but it'll do for now
    
    // opacity
    if (!isCeiling) {
      if (playerY > pos.y) { // above platform
        // Sup.log(playerY + " > " + this.actor.getPosition().y);
        this.actor.spriteRenderer.setOpacity(0.9);
      }
      else { // below platform
        this.actor.spriteRenderer.setOpacity(0.5);
      }
    }
    
    // cannonbody box for dreaming up
    if ( (playerIsDreaming && !isCeiling) || playerIsInChorus) {
      // Sup.log("dreaming..");
      if (this.actor.cannonBody) {
        this.actor.cannonBody.body.shapes.forEach(shape => {
          shape.collisionResponse = false;
        }); 
      }
    }
    else {
      if (this.actor.cannonBody) {
        this.actor.cannonBody.body.shapes.forEach(shape => {
          shape.collisionResponse = true;
        }); 
      }
    }
  }
}
Sup.registerBehavior(PlatformBehavior);
