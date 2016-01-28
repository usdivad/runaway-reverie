class CharacterBehavior extends Sup.Behavior {
  // static attrs
  private height:number = 15; // from PlayerModel
  
  // movement and location
  private velocity = 5;
  private jumpVelocity = 30;
  private position: Sup.Math.Vector3;
  private angles = new Sup.Math.Vector3(Math.PI/2, 0, 0)
  private direction = new Sup.Math.Vector3(0, 0, 1);

  // model
  private modelRenderer: Sup.ModelRenderer;
  private modelPosition = new Sup.Math.Vector3(0, 0, 0);

  // private name:string;
  // constructor(theName:string) {
  //   this.name = theName;
  // }
  
  awake() {
    // Sup.log("ho");
  }

  start() {
    // angle and position
    let angle = this.actor.getLocalEulerAngles().y;
    // this.position = this.actor.getLocalPosition();
    this.position = new Sup.Math.Vector3(0, 100, 0);
    this.angles.y = angle;
    
    // cannon body
    this.actor.cannonBody.body.position.set(this.position.x, this.height/2, this.position.z);
    this.actor.cannonBody.body.velocity.x = Math.sin(angle) * this.velocity;
    this.actor.cannonBody.body.velocity.z = Math.cos(angle) * this.velocity;
    this.actor.cannonBody.body.material = playerMaterial;
    
    // model renderer
    this.modelRenderer = this.actor.modelRenderer;
    this.modelRenderer.setAnimation("Walk"); // or idle?
    
  }

  update() {
    let body = this.actor.cannonBody.body;
    
    // set position and angles
    this.position.set(body.position.x, body.position.y - this.height/2, body.position.z);
    this.actor.setLocalEulerAngles(this.angles);
    
    // direction
    if (Sup.Input.isKeyDown("A")) { // left
      // this.actor.move(-1 * this.velocity, 0, 0); // old "move" code
      this.direction.x = -1;
    }
    if (Sup.Input.isKeyDown("D")) { // right
      this.direction.x = 1;
    }
    if (Sup.Input.isKeyDown("W")) { // up
      this.direction.z = -1;
    }
    if (Sup.Input.isKeyDown("S")) { // down
      this.direction.z = 1;
    }
    
    // cannon body movement
    if (this.direction.length() !== 0) {
      this.direction.normalize();
      body.velocity.x = this.direction.x * this.velocity;
      body.velocity.z = this.direction.z * this.velocity;
    }
    else {
      body.velocity.x = 0;
      body.velocity.z = 0;
    }
    
    // animation & angles
    let animation = "Idle";
    if ( (body.velocity.x !== 0) || (body.velocity.z !== 0)) {
      animation = "Run"; // adjust for walk later
      let angle = Math.atan2(-body.velocity.z, body.velocity.x) + Math.PI/2;
      this.angles.set(Math.PI/2, angle, 0);
    }
    
    // jump!
    if (Sup.Input.wasKeyJustPressed("SPACE")) {
      // this.actor.move(0, this.velocity, 0);
      body.velocity.y = this.jumpVelocity;
      animation = "Jump";
    }
    
    this.modelRenderer.setAnimation(animation);
    
    Sup.log("vel: " + body.velocity);
    Sup.log("pos: " + this.position);
  }
}


Sup.registerBehavior(CharacterBehavior);