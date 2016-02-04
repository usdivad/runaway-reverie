class CharacterBehavior extends Sup.Behavior {
  // static attrs
  private height:number = 15; // from PlayerModel
  
  // movement and location
  private velocity = 20;
  private jumpVelocity = 40;
  private position: Sup.Math.Vector3;
  private angles = new Sup.Math.Vector3(0, 0, 0)
  private direction = new Sup.Math.Vector3(0, 0, 1);
  private canJump = true;
  private canMove = true;
  public isMoving = false;

  // model
  private modelRenderer: Sup.ModelRenderer;
  private modelPosition = new Sup.Math.Vector3(0, 0, 0);

  // private name:string;
  // constructor(theName:string) {
  //   this.name = theName;
  // }

  awake() {
    // angle and position
    let angle = this.actor.getLocalEulerAngles().y;
    // this.position = this.actor.getLocalPosition();
    this.position = new Sup.Math.Vector3(0, 0, 0);
    this.angles.y = angle;
    
    // orientation
    this.actor.setOrientation(new Sup.Math.Quaternion(0, 180, 0));
    
    // cannon body
    this.actor.cannonBody.body.position.set(this.position.x, this.height/2, this.position.z);
    this.actor.cannonBody.body.velocity.x = Math.sin(angle) * this.velocity;
    this.actor.cannonBody.body.velocity.z = Math.cos(angle) * this.velocity;
    this.actor.cannonBody.body.material = playerMaterial;
    
    // allow jump on collide
    this.actor.cannonBody.body.addEventListener("collide", (event) => {
      // if (event.contact.ni.y > 0.9) {
        this.canJump = true;
      // }
    });
    
    // model renderer
    this.modelRenderer = this.actor.modelRenderer;
    this.modelRenderer.setAnimation("Walk"); // or idle?
    
    Sup.log(this.actor.cannonBody.body.position);
    
  }

  update() {
    let body = this.actor.cannonBody.body;
    // let cameraman = Sup.getActor("Cameraman");
    
    // set position and angles
    this.position.set(body.position.x, body.position.y - this.height/2, body.position.z);
    this.actor.setLocalEulerAngles(this.angles);
    
    // direction
    this.direction = new Sup.Math.Vector3(0, 0, 0); // temporary
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
      this.isMoving = true;
    }
    else {
      body.velocity.x = 0;
      body.velocity.z = 0;
      this.isMoving = false;
    }
    
    // animation & angles
    let animation = "Idle";
    if ( (body.velocity.x !== 0) || (body.velocity.z !== 0)) {
      animation = "Run"; // adjust for walk later
      let angle = Math.atan2(-body.velocity.z, body.velocity.x) + Math.PI/2;
      this.angles.set(0, angle, 0);
    }
    
    // jump!
    if (!this.canJump) {
      animation = "Jump";
      this.isMoving = true;
    }
    else if (this.canJump && Sup.Input.wasKeyJustPressed("SPACE")) {
      // this.actor.move(0, this.velocity, 0);
      this.canJump = false;
      body.velocity.y = this.jumpVelocity;
      animation = "Jump";
    }
    
    this.modelRenderer.setAnimation(animation);
    
    // Sup.log("vel: " + body.velocity);
    // Sup.log("pos: " + body.position);
  }
}


Sup.registerBehavior(CharacterBehavior);