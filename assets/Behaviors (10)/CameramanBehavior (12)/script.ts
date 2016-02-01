class CameramanBehavior extends Sup.Behavior {
  
  private playerActor = Sup.getActor("Player");
  private xOffset = 0;
  private yOffset = 50;
  private zOffset = 50;
  
  awake() {
    this.actor.setOrientation(new Sup.Math.Quaternion(-90, 0, 0));
  }

  update() {
    let playerPosition = playerActor.cannonBody.body.position;
    
    this.actor.cannonBody.body.position.set(
      playerPosition.x + this.xOffset,
      this.yOffset,
      playerPosition.z + this.zOffset
    )
    
    // this.actor.cannonBody.body.position.set(
    //                                         playerPosition.x + this.xOffset,
    //                                         playerPosition.y + this.yOffset,
    //                                         playerPosition.z + this.zOffset
    // );
    
    // this.actor.setEulerAngles(playerActor.getLocalEulerAngles());
  }
}
Sup.registerBehavior(CameramanBehavior);
