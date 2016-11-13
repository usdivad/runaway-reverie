class SubtitlesBehavior extends Sup.Behavior {
  // private offset: Sup.Math.Vector3 = new Sup.Math.Vector3(0, -15, -8); // for cameraman
  private offset: Sup.Math.Vector3 = new Sup.Math.Vector3(0, 18, 0); // for player
  private evtMul: number = 1000;
  private conductor: Sup.Audio.Conductor;

  playerHasMoved: boolean = false;

  awake() {
    // init params
    this.conductor = new Sup.Audio.Conductor(120, 4, []);
    
    // schedule text events
    // let t = 0;
    // t = this.scheduleText("Were I to wake from this \n runaway reverie...", t + 0);
    
    this.update();
  }

  update() {
    // let p = Sup.getActor("Cameraman").cannonBody.body.position;
    let p = Sup.getActor("Player").cannonBody.body.position;
    this.actor.setPosition(p.x + this.offset.x, p.y + this.offset.y, p.z + this.offset.z);
    
    // schedule text events
    if (!this.playerHasMoved) {
      if (Sup.getActor("Player").getBehavior(CharacterBehavior).isMoving) {
        this.playerHasMoved = true;
        let t = 0;
        t = this.scheduleText("Were I to wake from this \n runaway reverie...", t + 0);
        t = this.scheduleText("... no unfractured radiance \n would shine from the stars.", t + 4);
        t = this.scheduleText("", t + 4);
      }
    }
  }

  // schedule a setText() for this actor's text renderer
  scheduleText(text, time) {
    let subs = this;
    this.conductor.scheduleEvent(time * this.evtMul, function() {
      subs.actor.textRenderer.setText(text.replace(" \n ", "\n"));
    });
    return time;
  }
}
Sup.registerBehavior(SubtitlesBehavior);
