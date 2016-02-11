class MusicConductorBehavior extends Sup.Behavior {
  
  conductor: Sup.Audio.Conductor;
  phrase: string;
  params_instrumentalEntrance: any;
  params_tabTest: any;

  playerHasMoved: boolean;

  celloFadeVolMax: number;
  celloFadeVolMin: number;

  logOutput: boolean;
  transitioning: boolean;
  
  awake() {
    this.logOutput = true;
    
    // create MultiSoundPlayers for instrumental entrance
    
    // riff
    let vol = 0.5;
    let inst = "riff";
    let path_audio = "Audio/";
    let path_instrumentalEntrance = path_audio + "Instrumental Entrance/";
    let tail_riff = path_instrumentalEntrance+"tail " + inst + ".mp3";
    let msp_riff = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3",
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      {
        0: tail_riff, // <- passing in tail(s) as object; here we're being lazy by using the same tail sample for each beat
        4: tail_riff,
        7: tail_riff,
        11: tail_riff
      },
      vol,
      {logOutput: this.logOutput}
    );
    // Sup.log(msp_riff);
    
    // rev(ersed guitar)
    inst = "reversed";
    let msp_rev = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );

    // drums
    inst = "drums - dub remix kit";
    let msp_drums = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3", // <- note that init and loop are two diff audio phrases!
      path_instrumentalEntrance+"tail " + inst + ".mp3", // <- passing in single tail as string
      0,
      {active: true, logOutput: this.logOutput} // note we initialize it to be active but with a volume of 0, so muted
    );
    
    // bass
    inst = "bass - cypress";
    let msp_bass = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + "bass_freeze" + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );
    
    // cello
    inst = "cello freeze";
    let tail_cello = path_instrumentalEntrance+"tail " + inst + ".mp3";
    let msp_cello = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      {
        
      },
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    // keys
    inst = "5-EZkeys";
    let msp_keys = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol * 1.5,
      {active: false, logOutput: this.logOutput}
    );

    // MultiSoundPlayers for tabs section
    let tail_tabguitar = path_audio + "Tabs/" + "tail guitar.mp3";
    let msp_tabguitar = new Sup.Audio.MultiSoundPlayer(
      path_audio + "Tabs/" + "init guitar.mp3",
      path_audio + "Tabs/" + "loop guitar.mp3",
      {
        0: tail_tabguitar,
        8: tail_tabguitar,
        16: tail_tabguitar,
        25: tail_tabguitar
      },
      vol,
      {logOutput: this.logOutput}
    );

    let msp_tabrev = new Sup.Audio.MultiSoundPlayer(
      path_audio + "Tabs/" + "init guitar rev.mp3",
      path_audio + "Tabs/" + "loop guitar rev.mp3",
      {
        0: path_audio + "Tabs/" + "tail guitar rev.mp3"
      },
      vol,
      {active: false, logOutput: this.logOutput}
    );

    // params to set as conductor's nextParams
    this.params_tabTest = {
      bpm: 112,
      timesig: 34,
      players: {
        "guitar": msp_tabguitar,
        "rev": msp_tabrev
      }
    };
    
    this.params_instrumentalEntrance = {
      bpm: 180,
      timesig: 15,
      players: {
      "riff": msp_riff,
      "drums": msp_drums,
      "rev": msp_rev,
      "bass": msp_bass,
      "cello": msp_cello,
      "keys": msp_keys
      }
    };
    
    
    // create Conductor and start it
    this.conductor = new Sup.Audio.Conductor(
      this.params_instrumentalEntrance.bpm,
      this.params_instrumentalEntrance.timesig,
      this.params_instrumentalEntrance.players);
    this.conductor.setLogOutput(this.logOutput);
    this.conductor.start(); // start playing!
    this.phrase = "instrumental entrance";
    Sup.log(this.conductor);
    
    

    // activate keys for second cycle
    let conductor = this.conductor;
    Sup.setTimeout(this.conductor.getMillisecondsLeftUntilNextDownbeat()-100, function() {
      conductor.activatePlayer("keys");
      Sup.log("keys activated for next cycle");
    });
    
    // testing getMillisecondsLeftUntilNextDownbeat()
    let ms = this.conductor.getMillisecondsLeftUntilNextDownbeat();
    Sup.setTimeout(ms, function() {
      Sup.log("next downbeat should be HERE!");
    });

    // cello fade constants
    this.celloFadeVolMax = 1.0;
    this.celloFadeVolMin = 0.0;
    
    // player stuff
    this.playerHasMoved = false;
    
    this.transitioning = false;
  }

  update() {
    // let playerActor = Sup.getActor("Player");
    let playerPosition = playerActor.cannonBody.body.position;
    let playerIsMoving = playerActor["__behaviors"]["CharacterBehavior"][0].isMoving;
    
    // Sup.log(playerPosition.x);
    
    // location-based adjustments
    if (playerPosition.x < -100 /* && !this.transitioning */) {
      if (this.phrase != "tab test") {
        this.conductor.setNextParams(this.params_tabTest);
        this.conductor.setToNext(true);
        this.conductor.setTransition(true);
        this.conductor.setLogOutput(this.logOutput);
        
        // phrase naming
        this.phrase = "tab test";
        Sup.log("transitioned to " + this.phrase);
        
        // let musicConductorBehavior = this;
        // this.transitioning = true;
        // Sup.setTimeout(this.conductor.getMillisecondsLeftUntilNextTransitionBeat(), function() {
        //   musicConductorBehavior.phrase = "tab test";
        //   musicConductorBehavior.transitioning = false;
        //   Sup.log("transitioned to " + musicConductorBehavior.phrase);
        // });
        
      }
    }
    else {
      // switch to tab section
      if (this.phrase != "instrumental entrance") {
        this.conductor.setNextParams(this.params_instrumentalEntrance);
        this.conductor.setToNext(true);
        this.conductor.setTransition(true);
        this.conductor.setLogOutput(this.logOutput);
        
        // phrase naming
        this.phrase = "instrumental entrance";
        Sup.log("transitioned to " + this.phrase);
        
        // let musicConductorBehavior = this;
        // this.transitioning = true;
        // Sup.setTimeout(this.conductor.getMillisecondsLeftUntilNextTransitionBeat(), function() {
        //   musicConductorBehavior.phrase = "instrumental entrance";
        //   musicConductorBehavior.transitioning = false;
        //   Sup.log("transitioned to " + musicConductorBehavior.phrase);
        // });
        
        // deactivate players
        Sup.log(this.params_instrumentalEntrance);
        this.params_instrumentalEntrance.players["keys"].deactivate();
        // this.params_instrumentalEntrance["drums"].deactivate(); // leave drums in
        
        // reactivate keys for cycle after next one
        let conductor = this.conductor;
        let timeoutMs = conductor.getMillisecondsLeftUntilNextDownbeat(this.params_instrumentalEntrance.bpm)-100; // make sure you use the right bpm!!
        Sup.log("timeoutMs: " + timeoutMs);
        Sup.setTimeout(timeoutMs, function() { 
          conductor.activatePlayer("keys");
          Sup.log("keys activated for next cycle");
        });
      }
    }
    
    // movement-based adjustments
    if (this.phrase == "instrumental entrance") {
      if (playerIsMoving) {
        
        // activate bass and fade-in drums if it's the first time the player has moved
        if (!this.playerHasMoved) {
          // bass
          this.conductor.activatePlayer("bass");
          this.playerHasMoved = true;
          Sup.log("player has moved; activating bass for the next cycle");
          
          // drums
          this.conductor.getPlayer("drums").fade(0.5, 250);
          Sup.log("fading drums in");
        }
        
        // cello fade in (manual)
        let cello = this.conductor.getPlayer("cello");
        if (cello.getVolume() < this.celloFadeVolMax) {
          cello.setVolume(cello.getVolume() + 0.01);
        }
      }
      else {
        // cello fade out (manual)
        let cello = this.conductor.getPlayer("cello");
        if (cello.getVolume() > this.celloFadeVolMin) {
          cello.setVolume(cello.getVolume() - 0.01);
        }
      }
    }
    
    // if (this.phrase == "instrumental entrance") {
    //   if (playerIsMoving) {
    //     this.conductor.activatePlayer("keys");
    //     this.conductor.activatePlayer("bass");
    //     // Sup.log("player moving; activate keys and bass for next cycle");
    //   }
    //   else {
    //     this.conductor.deactivatePlayer("keys"); // TODO: come up with a fadeout solution for deactivation
    //     // Sup.log("player not moving; deactivate keys for next cycle");
    //   }
    // }
    // else if (this.phrase == "tab test") {
    //   if (playerIsMoving) {
    //     this.conductor.activatePlayer("rev");
    //     // Sup.log("player moving; activating reversed guitar for next cycle");
    //   }
    //   else {
    //     // this.conductor.deactivatePlayer("rev");
    //     // Sup.log("player not moving; deactivating reversed guitar for next cycle");
    //   }
    // }
  }
}
Sup.registerBehavior(MusicConductorBehavior);
