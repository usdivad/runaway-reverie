class PlatformBehavior extends Sup.Behavior {
  private originalCannonBody : Sup.Cannon.Body;
  awake() {
    this.originalCannonBody = this.actor.cannonBody;
  }

  update() {
    let playerActor = Sup.getActor("Player");
    let playerPos = playerActor.getPosition();
    let playerY = playerPos.y;
    
    let playerIsDreaming = playerActor.getBehavior(CharacterBehavior).isDreaming;
    
    // opacity
    if (playerY > this.actor.getPosition().y) {
      Sup.log(playerY + " > " + this.actor.getPosition().y);
    }
    
    // cannonbody box for dreaming up
    if (playerIsDreaming) {
      Sup.log("dreaming..");
      if (this.actor.cannonBody) {
        // this.actor.cannonBody.destroy();
        this.actor.cannonBody.body.shapes.forEach(shape => {
          shape.collisionResponse = false;
        }); 
      }
    }
    else {
      // this.actor.cannonBody = this.originalCannonBody;
      this.actor.cannonBody.body.shapes.forEach(shape => {
        shape.collisionResponse = true;
      }); 
    }
  }
}
Sup.registerBehavior(PlatformBehavior);
