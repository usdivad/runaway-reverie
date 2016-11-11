class NPCBehavior extends Sup.Behavior {
  
  position: Sup.Math.Vector3;
  distanceToPlayer: number;
  angle: number;
  
  readyToSing: boolean;
  
  awake() {
    //this.position = new Sup.Math.Vector3(-85, 410, -60); // coordinates
    this.position = this.actor.getPosition();
    this.angle = this.actor.getLocalEulerY();
    // this.distanceToPlayer = this.position.distanceTo(playerActor.getPosition());
    this.readyToSing = false;
  }

  update() {
    // distance to player
    let toPlayer = playerActor.getPosition().clone().subtract(this.position);
    this.distanceToPlayer = toPlayer.length();
    // this.distanceToPlayer = this.position.distanceTo(playerActor.getPosition());
    // Sup.log("distance to player: " + this.distanceToPlayer);
    // Sup.log(toPlayer);
    
    // angle
    // let targetAngle = Sup.Math.wrapAngle(Math.atan2(toPlayer.y, toPlayer.x) + Math.PI/2);
    // this.angle = Sup.Math.lerpAngle(this.angle, targetAngle, 0.1);
    // this.actor.setLocalEulerY(this.angle);
    
    // angle (easy way)
    this.actor.lookAt(playerActor.getPosition());
    this.actor.rotateEulerY(Math.PI); // offset
    
    // animation, singing
    let animation = "Idle";
    if (this.distanceToPlayer < 30) {
      this.readyToSing = true;
      Sup.log("npc ready to sing");
    }
    else if (playerActor.getPosition().x >= -100) {
      this.readyToSing = false;
    }
    
    if (this.readyToSing) {
      animation = "Fight";
    }
    
    this.actor.modelRenderer.setAnimation(animation);
  }
}
Sup.registerBehavior(NPCBehavior);
