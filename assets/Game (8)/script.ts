class CharacterBehavior extends Sup.Behavior {
  // static velocity = 0.5;
  private velocity:number = 0.5;

  // private name:string;
  // constructor(theName:string) {
  //   this.name = theName;
  // }
  
  awake() {
    
  }

  update() {
    
    
    if (Sup.Input.isKeyDown("A")) {
      this.actor.move(-1 * this.velocity, 0, 0);
    }
    if (Sup.Input.isKeyDown("D")) {
      this.actor.move(this.velocity, 0, 0);
    }
    if (Sup.Input.isKeyDown("W")) {
      this.actor.move(0, 0, -1 * this.velocity);
    }
    if (Sup.Input.isKeyDown("S")) {
      this.actor.move(0, 0, this.velocity);
    }
    
    if (Sup.Input.wasKeyJustPressed("SPACE")) {
      this.actor.move(0, this.velocity, 0);
    }
    
  }
}


Sup.registerBehavior(CharacterBehavior);

Sup.loadScene("Room Scene");