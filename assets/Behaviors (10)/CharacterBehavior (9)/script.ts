class CharacterBehavior extends Sup.Behavior {
  // static attrs
  private height:number = 15; // from PlayerModel
  
  // movement and location
  private velocity = 50;
  private jumpVelocity = 50;
  private rayMagnitude = 1000;
  private position: Sup.Math.Vector3;
  private angles = new Sup.Math.Vector3(0, 0, 0)
  private direction = new Sup.Math.Vector3(0, 0, 1);
  private canJump = true;
  private canMove = true;
  private chorusHasBegun = false;

  public isMoving = false;
  public isJumping = false;
  public isDreaming = false;
  public isInChorus = false;
  public currentQuadrant = 1; // cartesian; 1-4

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
    let posOffsetY = 605; // 605
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
    let inVerse2 = this.position.y >= 200;
    
    
    // set position and angles
    this.position.set(body.position.x, body.position.y - this.height/2, body.position.z);
    this.actor.setLocalEulerAngles(this.angles);
    
    
    // chorus
    this.isInChorus = Sup.getActor("Music Conductor").getBehavior(MusicConductorBehavior).chorusActive;
    if (this.isInChorus) {
      if (!this.chorusHasBegun) {
        world.gravity.set(0, 30, 0);
        this.modelRenderer.setAnimation("Jump");
        this.chorusHasBegun = true;
      }
      return;
    }
    else {
      if (this.chorusHasBegun) {
        this.position = new Sup.Math.Vector3(-60, 605, 90);
        body.position.set(this.position.x, this.position.y + this.height/2, this.position.z);
        body.velocity.set(0, 0, 0);
        this.chorusHasBegun = false;
      }
    }
  
    
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
    this.direction = new Sup.Math.Vector3(0, 0, 0); // reset direction to re-calculate from input
    if (Sup.getActor("Music Conductor").getBehavior(MusicConductorBehavior).playerMovementLock) {
      this.canMove = false;
    }
    else {
      this.canMove = true;
    }
    
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
    if (this.canMove && this.direction.length() !== 0) {
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
    
    // current quadrant
    this.currentQuadrant = this.calculateCurrentQuadrant();
    
    
    // verse 2!
    if (inVerse2) {
      // trying to get the right NPC for selection
      let verse2Npcs = [Sup.getActor("Verse 2 NPC 1"), Sup.getActor("Verse 2 NPC 2"), Sup.getActor("Verse 2 NPC 3")];
      
      // ray-casting...
      /*
      let ray = new Sup.Math.Ray();
      ray.setOrigin(body.position.x, 202, body.position.z);

      // ... based on orientation
      let orientation = playerActor.getOrientation();
      let orientationY = orientation.y;
      // ray.setDirection(Math.sin(orientationY), 0, Math.cos(orientationY)); // double-check this..
      // ray.setDirection(this.direction.x, 0, this.direction.y);
      // ray.setDirection(orientation.x, orientation.y * 180, orientation.z);

      // ... based on fixed direction
      let rayX = this.rayMagnitude;
      let rayY = this.rayMagnitude;
      let rayZ = this.rayMagnitude;

      if (this.position.x > -50) {
        rayX *= -1;
      }
      if (this.position.z > -25) {
        rayZ *= -1;
      }

      //ray.setDirection(0, rayY, 0);
      // Sup.log("ray direction: " + ray.getDirection());

      // ... based on camera
      ray.setFromCamera(Sup.getActor("Cameraman").camera, {x: 0, y: 0});

      // cast the ray!
      let hits = ray.intersectActors(verse2Npcs);
      for (let hit of hits) {
          Sup.log("raycast: " + hit.actor.getName() + ": " + hit.distance);
      }
      */

      // using distance
      let closestNpc = this.calculateClosestActor(verse2Npcs, true);
      //Sup.log("closest verse 2 NPC: " + closestNpc.getName());
      
      // handling npc selection
      // if (Sup.Input.isKeyDown("E") && this.position.z < 0) { // via key press
      if (this.position.z < 25) { // via position
        for (let npc of verse2Npcs) {
          npc.getBehavior(NPCBehavior).selected = false;
        }
        closestNpc.getBehavior(NPCBehavior).selected = true;
      }
    }

    // Sup.log("orientation: " + orientation);
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

  calculateCurrentQuadrant(): number {
    let q = 1;
    if (this.position.z < 0) {
      if (this.position.x >= 0) {
        q = 1;
      }
      else {
        q = 2;
      }
    }
    else {
      if (this.position.x >= 0) {
        q = 4;
      }
      else {
        q = 3;
      }
    }
    return q;
  }

  calculateClosestActor(npcs: Sup.Actor[], useOriginalPosition=false): Sup.Actor {
    let myPos = playerActor.getPosition();
    let distances = npcs.map(function(npc) {
      let pos = npc.getPosition();
      if (useOriginalPosition) {
        pos = npc.getBehavior(NPCBehavior).originalPosition;
      } 
      return calculateDistanceBetweenActorPositions(pos, myPos);
    });
    let lowestDistanceIndex = distances.indexOf(Math.min.apply(Math, distances));
    let closestNpc = npcs[lowestDistanceIndex];
    return closestNpc;
  }
}


Sup.registerBehavior(CharacterBehavior);