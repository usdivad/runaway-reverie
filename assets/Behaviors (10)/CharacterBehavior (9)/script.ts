class CharacterBehavior extends Sup.Behavior {
  // static attrs
  private height:number = 15; // from PlayerModel
  
  // movement and location
  private velocity = 50;
  private jumpVelocity = 50;
  private position: Sup.Math.Vector3;
  private angles = new Sup.Math.Vector3(0, 0, 0)
  private direction = new Sup.Math.Vector3(0, 0, 1);
  private canJump = true;
  private canMove = true;
  public isMoving = false;
  public isJumping = false;
  public isDreaming = false;

  // model
  private modelRenderer: Sup.ModelRenderer;
  // private modelPosition = new Sup.Math.Vector3(0, 0, 0);

  // private name:string;
  // constructor(theName:string) {
  //   this.name = theName;
  // }

  awake() {
    // angle
    let angle = this.actor.getLocalEulerAngles().y;
    this.angles.y = angle;

    // position
    // this.position = this.actor.getLocalPosition();
    let posOffsetX = -60;
    let posOffsetY = 625;
    let posOffsetZ = 90;
    this.position = new Sup.Math.Vector3(posOffsetX, posOffsetY, posOffsetZ);
    
    // orientation
    this.actor.setOrientation(new Sup.Math.Quaternion(0, 180, 0));
    
    // cannon body
    this.actor.cannonBody.body.position.set(this.position.x, posOffsetY + this.height/2, this.position.z); // should just about match actor position
    this.actor.cannonBody.body.velocity.x = Math.sin(angle) * this.velocity;
    this.actor.cannonBody.body.velocity.z = Math.cos(angle) * this.velocity;
    this.actor.cannonBody.body.material = playerMaterial;
    
    // allow jump on collide
    this.actor.cannonBody.body.addEventListener("collide", (event) => {
      // if (event.contact.ni.y > 0.9) {
        this.canJump = true;
        this.isJumping = false;
      // }
    });
    
    // model renderer
    this.modelRenderer = this.actor.modelRenderer;
    this.modelRenderer.setAnimation("Walk"); // or idle?
    
    // Sup.log(this.actor.cannonBody.body.position);
    
  }

  update() {
    let body = this.actor.cannonBody.body;
    // let cameraman = Sup.getActor("Cameraman");
    let inDream = this.calculateWhetherInDream();
    
    
    // set position and angles
    this.position.set(body.position.x, body.position.y - this.height/2, body.position.z);
    this.actor.setLocalEulerAngles(this.angles);
  
    
    // set velocities, world based on positions
    if (inDream) {
      world.gravity.set(0, Math.max(10, this.velocity*2), 0);
      this.velocity = 25;
      this.jumpVelocity = 0;
      this.isDreaming = true;
    }
    else {
      this.velocity = 50; 
      this.jumpVelocity = 50;
      world.gravity.set(0, -100, 0);
      this.isDreaming = false;
    }
    // this.jumpVelocity = this.velocity;
    
    // don't let player go under
    if (body.position.y < 0 && !inDream) {
      // Sup.log("correcting y pos " + this.position.y);
      // body.position.y += 0.1;
      // body.position.y = this.height/2;
      world.gravity.set(0, 200, 0);
      this.canJump = true;
    }
    
    // direction
    this.direction = new Sup.Math.Vector3(0, 0, 0); // temporary
    if (Sup.Input.isKeyDown("A") || Sup.Input.isKeyDown("LEFT")) { // left
      // this.actor.move(-1 * this.velocity, 0, 0); // old "move" code
      this.direction.x = -1;
    }
    if (Sup.Input.isKeyDown("D") || Sup.Input.isKeyDown("RIGHT")) { // right
      this.direction.x = 1;
    }
    if (Sup.Input.isKeyDown("W") || Sup.Input.isKeyDown("UP")) { // up
      this.direction.z = -1;
    }
    if (Sup.Input.isKeyDown("S") || Sup.Input.isKeyDown("DOWN")) { // down
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
      if (inDream) {
        animation = "Walk";
      }
      else {
        animation = "Run";
      }
      
      let angle = Math.atan2(-body.velocity.z, body.velocity.x) + Math.PI/2;
      this.angles.set(0, angle, 0);
    }
    
    // jump!
    if (!this.canJump) {
      if (inDream) {
        animation = "Idle";
      }
      else {
        animation = "Jump";
      }
      this.isMoving = true;
    }
    else if (this.canJump && Sup.Input.wasKeyJustPressed("SPACE")) {
      // this.actor.move(0, this.velocity, 0);
      this.canJump = false;
      body.velocity.y = this.jumpVelocity;
      animation = "Jump";
      this.isJumping = true;
    }
    
    this.modelRenderer.setAnimation(animation);
    
    // Sup.log("vel: " + body.velocity);
    // Sup.log("pos: " + body.position);
  }

  calculateWhetherInDream(): boolean {
    let threshX = 100;
    let threshZ = 100;
    return (this.position.x < 0 - threshX ||
            this.position.x > threshX ||
            this.position.z < 0 - threshZ ||
            this.position.z > threshZ
           );
  }
}


Sup.registerBehavior(CharacterBehavior);