class MusicConductorBehavior extends Sup.Behavior {
  
  conductor: Sup.Audio.Conductor;
  phrase: string;
  params_instrumentalEntrance: any;
  params_tabTest: any;
  
  awake() {
    // create MultiSoundPlayers for instrumental entrance
    // riff
    let vol = 0.5;
    let inst = "riff";
    let path_audio = "Audio/";
    let path_instrumentalEntrance = path_audio + "Instrumental Entrance/";
    let msp_riff = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3",
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      {
        0: path_instrumentalEntrance+"tail " + inst + ".mp3" // <- passing in tail(s) as object
      },
      vol
    );
    // Sup.log(msp_riff);

    // drums
    inst = "drums - dub remix kit";
    let msp_drums = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3", // <- note that init and loop are two diff audio phrases!
      path_instrumentalEntrance+"tail " + inst + ".mp3", // <- passing in single tail as string
      vol,
      {active: false}
    );
    
    // bass
    inst = "bass - cypress";
    let msp_bass = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + "bass_freeze" + ".mp3",
      vol,
      {active: false}
    );
    
    // cello
    inst = "cello freeze";
    let msp_cello = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false}
    );
    
    // keys
    inst = "5-EZkeys";
    let msp_keys = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol * 2,
      {active: false}
    );

    // msps for tab section
    let msp_tabguitar = new Sup.Audio.MultiSoundPlayer(
      path_audio + "Tabs/" + "init guitar.mp3",
      path_audio + "Tabs/" + "loop guitar.mp3",
      {
        0: path_audio + "Tabs/" + "tail guitar.mp3"
      },
      vol
    );

    let msp_tabrev = new Sup.Audio.MultiSoundPlayer(
      path_audio + "Tabs/" + "init guitar rev.mp3",
      path_audio + "Tabs/" + "loop guitar rev.mp3",
      {
        0: path_audio + "Tabs/" + "tail guitar rev.mp3"
      },
      vol,
      {active: false}
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
      "bass": msp_bass,
      "keys": msp_keys
      }
    };
    
    
    // create Conductor
    this.conductor = new Sup.Audio.Conductor(180, 15, {
      "riff": msp_riff,
      "drums": msp_drums,
      "bass": msp_bass,
      "keys": msp_keys
    });
    this.conductor.start(); // start playing!
    this.phrase = "instrumental entrance";
    Sup.log(this.conductor);

    // activate drums for second cycle 4 seconds later
    let conductor = this.conductor;
    Sup.setTimeout(4000, function() {
      conductor.activatePlayer("drums");
      Sup.log("drums activated for next cycle");
    });

    /*
    // let conductor run through another cycle (guitar: loop, drums: init),
    // and then set transition to "tab" section
    Sup.setTimeout(6000, function() {
      this.conductor.setNextParams(tabParams);
      this.conductor.setToNext(true);
      this.conductor.setTransition(true);
      this.phrase = "tab test";
      Sup.log("conductor will transition next cycle");
    });

    Sup.setTimeout(18000, function() {
      this.conductor.activatePlayer("rev");
      Sup.log("activating reversed guitar for next cycle");
    });
    */
  }

  update() {
    // let playerActor = Sup.getActor("Player");
    let playerPosition = playerActor.cannonBody.body.position;
    let playerIsMoving = playerActor["__behaviors"]["CharacterBehavior"][0].isMoving;
    
    Sup.log(playerPosition.x);
    
    if (playerPosition.x < -100) {
      if (this.phrase != "tab test") {
        this.conductor.setNextParams(this.params_tabTest);
        this.conductor.setToNext(true);
        this.conductor.setTransition(true);
        this.phrase = "tab test";
        Sup.log("conductor will transition to tab test section for next cycle");
      }
    }
    else {
      if (this.phrase != "instrumental entrance") {
        this.conductor.setNextParams(this.params_instrumentalEntrance);
        this.conductor.setToNext(true);
        this.conductor.setTransition(true);
        this.phrase = "instrumental entrance";
        Sup.log("conductor will transition to instrumental entrance section for next cycle");
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
