class MusicConductorBehavior extends Sup.Behavior {
  
  conductor: Sup.Audio.Conductor;
  
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
    // Sup.log(msp_drums);

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
    let tabParams = {
      bpm: 112,
      timesig: 34,
      players: {
        "guitar": msp_tabguitar,
        "rev": msp_tabrev
      }
    };
    
    
    // create Conductor
    this.conductor = new Sup.Audio.Conductor(180, 15, {"riff": msp_riff, "drums": msp_drums});
    this.conductor.start(); // start playing!
    Sup.log(this.conductor);

    // activate drums for second cycle, after just guitar init
    Sup.setTimeout(4000, function() {
      this.conductor.activatePlayer("drums");
      Sup.log("drums activated for next cycle");
    });

    // let conductor run through another cycle (guitar: loop, drums: init),
    // and then set transition to "tab" section
    Sup.setTimeout(6000, function() {
      this.conductor.setNextParams(tabParams);
      this.conductor.setToNext(true);
      this.conductor.setTransition(true);
      Sup.log("conductor will transition next cycle");
    });

    Sup.setTimeout(18000, function() {
      this.conductor.activatePlayer("rev");
      Sup.log("activating reversed guitar for next cycle");
    });
  }

  update() {
    
  }
}
Sup.registerBehavior(MusicConductorBehavior);
