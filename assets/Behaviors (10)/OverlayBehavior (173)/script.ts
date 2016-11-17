class OverlayBehavior extends Sup.Behavior {
  public quadrant:number = 0;
  
  awake() {
    
  }

  update() {
    let sprite = this.actor.spriteRenderer;
    let quadrantsActive = Sup.getActor("Music Conductor").getBehavior(MusicConductorBehavior).bridgePlayersActiveStatuses;
    let q = this.quadrant - 1;
    let validQuadrant = q >=0 && q < quadrantsActive.length;
    if (validQuadrant &&  quadrantsActive[q]) {
      sprite.setOpacity(0.36);
    }
    else {
      sprite.setOpacity(0);
    }
  }
}
Sup.registerBehavior(OverlayBehavior);
