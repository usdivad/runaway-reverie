class SubtitlesBehavior extends Sup.Behavior {
  // private offset: Sup.Math.Vector3 = new Sup.Math.Vector3(0, -15, -8); // for cameraman
  private offset: Sup.Math.Vector3 = new Sup.Math.Vector3(0, 18, 0); // for player

  awake() {
    this.update();
  }

  update() {
    // let p = Sup.getActor("Cameraman").cannonBody.body.position;
    let p = Sup.getActor("Player").cannonBody.body.position;
    this.actor.setPosition(p.x + this.offset.x, p.y + this.offset.y, p.z + this.offset.z);
  }
}
Sup.registerBehavior(SubtitlesBehavior);
