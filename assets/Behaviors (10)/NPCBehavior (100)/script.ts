class NPCBehavior extends Sup.Behavior {
  
  private height:number = 0;
  position: Sup.Math.Vector3;
  originalPosition: Sup.Math.Vector3;
  distanceToPlayer: number;
  angle: number;

  ascensionVelocity : number = 10;
  lateralVelocity : number = 0;
  
  readyToSing: boolean;

  verse: number = 0; // this property should be set by scene
  
  awake() {
    //this.position = new Sup.Math.Vector3(-85, 410, -60); // coordinates
    this.position = this.actor.getPosition();
    this.originalPosition = this.position;
    this.angle = this.actor.getLocalEulerY();
    this.actor.cannonBody.body.position.set(this.position.x, this.position.y + this.height/2, this.position.z);
    // this.distanceToPlayer = this.position.distanceTo(playerActor.getPosition());
    this.readyToSing = false;
  }

  update() {
    if (this.verse == 1) {
      this.verse1Update();
    }
    else if (this.verse == 2) {
      this.verse2Update();
    }
  }

  verse1Update() {
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
    if (Math.abs(playerActor.getPosition().y - this.position.y) <= 15 && !playerActor.getBehavior(CharacterBehavior).isJumping) {
      this.actor.lookAt(playerActor.getPosition());
      this.actor.rotateEulerY(Math.PI); // offset
    }
    
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
    
    
    // movement and location
    let body = this.actor.cannonBody.body;
    this.position.set(body.position.x, body.position.y - this.height/2, body.position.z);
    let hasSung = Sup.getActor("Music Conductor").getBehavior(MusicConductorBehavior).npcHasSung;
    
    if (hasSung) {
      body.velocity.y = this.ascensionVelocity;
      if (Math.floor(body.velocity.y / 100) % 200 == 0) {
        body.velocity.x = this.lateralVelocity;
        body.velocity.z = 0 - this.lateralVelocity;
      }
      else {
        body.velocity.x = 0 - this.lateralVelocity;
        body.velocity.z = this.lateralVelocity;
      }
      // Sup.log("has sung");
    }
    else { // reset position
      body.position.set(this.originalPosition.x, this.originalPosition.y - this.height/2, this.originalPosition.z);
      this.position = this.originalPosition;

      body.velocity.y = 0;
      body.velocity.x = 0;
      body.velocity.z = 0;
    }
    
    // Sup.log("npc: " + this.position);
    
  }

  verse2Update() {
    // position
    // TODO: customize based on selection
    if (playerActor.getBehavior(CharacterBehavior).isDreaming) {
      this.position = this.originalPosition;
      this.actor.cannonBody.body.position.set(this.position.x, this.position.y + this.height/2, this.position.z);
    }
    
    // angle (easy way)
    if (Math.abs(playerActor.getPosition().y - this.position.y) <= 15 && !playerActor.getBehavior(CharacterBehavior).isJumping) {
      this.actor.lookAt(playerActor.getPosition());
      this.actor.rotateEulerY(Math.PI); // offset
    }
  }
}
Sup.registerBehavior(NPCBehavior);
