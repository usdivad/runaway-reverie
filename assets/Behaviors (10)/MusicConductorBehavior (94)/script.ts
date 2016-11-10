class MusicConductorBehavior extends Sup.Behavior {
  
  conductor: Sup.Audio.Conductor;
  phrase: string;
  
  params_instrumentalEntrance: any;
  params_tabTest: any;
  params_tabularasa_a: any;

  chimeagain: any;
  verseVocals: Sup.Audio.SoundPlayer;

  drumsAndBassHaveEntered: boolean;

  playerPreviouslyCouldJump: boolean;
  playerWasJumping: boolean;

  celloFadeVolMax: number;
  celloFadeVolMin: number;

  logOutput: boolean;
  transitioning: boolean;

  npcHasSung: boolean;

  vol: number;

  currentSection: number;
  
  awake() {
    this.logOutput = false;
    
    this.currentSection = 0;

    let vol = 0.5;
    let path_audio = "Audio/";
    
    this.vol = vol;
    
    this.setupInstrumentalEntrance(vol, path_audio);
    this.setupTabTest(vol, path_audio);
    
    // create Conductor and start it
    this.conductor = new Sup.Audio.Conductor(
      this.params_instrumentalEntrance.bpm,
      this.params_instrumentalEntrance.timesig,
      this.params_instrumentalEntrance.players);
    this.conductor.setLogOutput(this.logOutput);
    this.conductor.start(); // start playing!
    this.phrase = "instrumental entrance";
    Sup.log(this.conductor);
    
  
    // activate keys for second cycle regardless of action
    let conductor = this.conductor;
    this.conductor.scheduleEvent(this.conductor.getMillisecondsLeftUntilNextDownbeat()-100, function() {
      conductor.activatePlayer("keys");
      Sup.log("keys activated for next cycle");
    });
    
    // testing getMillisecondsLeftUntilNextDownbeat()
    let ms = this.conductor.getMillisecondsLeftUntilNextDownbeat();
    this.conductor.scheduleEvent(ms, function() {
      Sup.log("next downbeat should be HERE!");
    });

    // cello fade constants
    this.celloFadeVolMax = 1.0;
    this.celloFadeVolMin = 0.0;
    
    // player stuff
    this.playerPreviouslyCouldJump = true;
    this.playerWasJumping = false;
    
    this.drumsAndBassHaveEntered = false;
    
    this.transitioning = false;
    
    this.npcHasSung = false;
  }

  update() {
    let playerActor = Sup.getActor("Player");
    let playerPosition = playerActor.cannonBody.body.position;
    let playerIsMoving = playerActor["__behaviors"]["CharacterBehavior"][0].isMoving;
    this.playerPreviouslyCouldJump = playerActor["__behaviors"]["CharacterBehavior"][0].canJump;
    let playerIsJumping = playerActor["__behaviors"]["CharacterBehavior"][0].isJumping;

    // current section
    this.updateCurrentSection();
    
    // location-based adjustments
    if (playerActor.getBehavior(CharacterBehavior).isDreaming) {
      
      // switch to tab section
      if (this.phrase != "tab test") {
        this.conductor.setNextParams(this.params_tabTest);
        this.conductor.setToNext(true);
        this.conductor.setTransition(true);
        this.conductor.setLogOutput(this.logOutput);
        
        // phrase naming
        this.phrase = "tab test";
        Sup.log("transitioned to " + this.phrase);
        
        // deactivate/mute players
        this.params_tabTest.players["stretch"].setVolume(0);
        this.conductor.getPlayer("vox").fade(0, this.conductor.getMillisecondsLeftUntilNextTransitionBeat());
        
        // let musicConductorBehavior = this;
        // this.transitioning = true;
        // Sup.setTimeout(this.conductor.getMillisecondsLeftUntilNextTransitionBeat(), function() {
        //   musicConductorBehavior.phrase = "tab test";
        //   musicConductorBehavior.transitioning = false;
        //   Sup.log("transitioned to " + musicConductorBehavior.phrase);
        // });
        
        
        // // activate rev for cycle after next one
        // let conductor = this.conductor;
        // let timeoutMs = conductor.getMillisecondsLeftUntilNextDownbeat(this.params_instrumentalEntrance.bpm)-100; // make sure you use the right bpm!!
        // Sup.log("timeoutMs: " + timeoutMs);
        // Sup.setTimeout(timeoutMs, function() { 
        //   conductor.activatePlayer("rev");
        //   Sup.log("rev activated for next cycle");
        // });
      }
    }
    else {
      // switch to instrumental entrance
      if (this.phrase != "instrumental entrance") {
        this.conductor.setNextParams(this.params_instrumentalEntrance);
        this.conductor.setToNext(true);
        this.conductor.setTransition(true);
        this.conductor.setLogOutput(this.logOutput);
        
        // phrase naming
        this.phrase = "instrumental entrance";
        Sup.log("transitioned to " + this.phrase);

        // reset so npc can sing again
        this.npcHasSung = false;
        Sup.log("npcHasSung reset");
        
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
        // this.params_instrumentalEntrance.players["rev"].deactivate();
        this.params_instrumentalEntrance.players["vox"].deactivate();
        this.params_instrumentalEntrance.players["vox"].fade(this.vol * 0.75, 250);
        this.params_instrumentalEntrance.players["vox"].reset();
        
        // reactivate keys for cycle after next one
        let timeoutMs = this.conductor.getMillisecondsLeftUntilNextDownbeat(this.params_instrumentalEntrance.bpm) + 250; // make sure you use the right bpm!!
        let conductor = this.conductor;
        Sup.log("timeoutMs: " + timeoutMs);
        this.conductor.scheduleEvent(timeoutMs, function() { 
          conductor.activatePlayer("keys");
          Sup.log("keys activated for next cycle");
        });
        
        Sup.log("activating stretch");
        this.conductor.activatePlayer("stretch");
        this.conductor.getPlayer("stretch").fade(this.vol * 2, this.conductor.getMillisecondsLeftUntilNextTransitionBeat());
        Sup.log(this.conductor.getMillisecondsLeftUntilNextTransitionBeat() + "ms");
      }
    }
    
    // movement-based adjustments
    if (this.phrase == "instrumental entrance") {
      if (playerIsMoving) {
        // cello fade in (manual)
        let cello = this.conductor.getPlayer("cello");
        if (cello && (cello.getVolume() < this.celloFadeVolMax)) {
          cello.setVolume(cello.getVolume() + 0.01);
        }
      }
      else {
        // cello fade out (manual)
        let cello = this.conductor.getPlayer("cello");
        if (cello && (cello.getVolume() > this.celloFadeVolMin)) {
          cello.setVolume(cello.getVolume() - 0.01);
        }
      }
      
      
      // jump -> chimeagain
      // use wchoose to pick consonant notes according to harmony      
      if ((!this.playerWasJumping && playerIsJumping) || Sup.Input.wasKeyJustPressed("SPACE")) {
        let beatNum = this.conductor.getBeatNum();
        let note = "d";
        
        beatNum = beatNum + 1; // offset for anticipations
        
        if (beatNum < 4) { // D chord
          note = wchoose(["f#", "d"], [0.75, 0.25]);
        }
        else if (beatNum < 7) { // G chord
          note = wchoose(["g", "d"], [1.0, 0.0]);
        }
        else if (beatNum < 11) { // D chord
          note = wchoose(["d", "f#"], [0.75, 0.25]);
        }
        else if (beatNum < 14) { // A chord
          note = "e";
        }
        
        this.chimeagain[note].stop();
        this.chimeagain[note].play();
      }
      
      
      // section-based instrumental adjustments
      if (this.currentSection > 0 && this.currentSection < 5) {
        // activate bass and fade-in drums if they haven't entered before
        if (!this.drumsAndBassHaveEntered) { 
          // bass
          if (this.conductor.getPlayer("bass")) {
            this.conductor.activatePlayer("bass");
            Sup.log("player has moved; activating bass for the next cycle");
          }
          this.drumsAndBassHaveEntered = true;

          // drums
          if (this.conductor.getPlayer("drums")) {
            this.conductor.getPlayer("drums").fade(this.vol, 250);
            Sup.log("fading drums in");
          }
        }
      }
      else {
        // deactivate n fade out
        if (this.conductor.getPlayer("bass")) {
          this.conductor.deactivatePlayer("bass");
        }
        if (this.conductor.getPlayer("drums")) {
          this.conductor.getPlayer("drums").fade(0, 250);
        }
        this.drumsAndBassHaveEntered = false;
      }
      
      if (this.currentSection == 5) {
        // switcheroo segment
      }
      
    }
    else if (this.phrase == "tab test") {
      if (playerIsMoving) {
        // rev fade in (manual)
        let rev = this.conductor.getPlayer("rev");
        if (rev && (rev.getVolume() < this.celloFadeVolMax)) {
          rev.setVolume(rev.getVolume() + 0.01);
          // Sup.log(rev.getVolume());
        }
      }
      else {
        // rev fade out (manual)
        let rev = this.conductor.getPlayer("rev");
        if (rev && (rev.getVolume() > this.celloFadeVolMin)) {
          rev.setVolume(rev.getVolume() - 0.01);
        }
      }
    }
    
    this.playerWasJumping = playerIsJumping;
    
    
    
    // NPC vocalist
    if (this.phrase == "instrumental entrance" && !this.conductor.isTransitioning()) {
      let npc = Sup.getActor("NPC Vocalist");
      if (npc["__behaviors"]["NPCBehavior"][0].readyToSing) {
        
        if (!this.npcHasSung) {
          this.npcHasSung = true;
          let conductor = this.conductor;
          
          Sup.log("npc is singing");
          
          // start singing
          this.conductor.getPlayer("vox").fade(this.vol * 0.75, 250);
          this.conductor.activatePlayer("vox");
          
          // // we only let vox play once
          // this.conductor.scheduleEvent(this.conductor.getMillisecondsLeftUntilNextDownbeat() * 1.5, function() {
          //   conductor.deactivatePlayer("vox"); 
          //   Sup.log("deactivated vox");
          // });

          // trigger manually because the phrase is longer than the section's phrase length
          let vox = this.verseVocals;
          let ms = this.conductor.getMillisecondsLeftUntilNextDownbeat(); // 100ms offset?
          let cycleMs = Sup.Audio.Conductor.calculateNextBeatTime(0, this.conductor.getBpm()) * this.conductor.getBpm();
          
          // timeout leads to unreliable performance timing
          // Sup.setTimeout(ms, function() {
          //   vox.play();
          // });
          
          // this.conductor.scheduleEvent(ms, function() {
          //   vox.play();
          //   Sup.log("playing vox!");
          // });
          
          // activate rev after vox are done
          let revMs = cycleMs*3 + ms;
          // let revMs = ms;
          this.conductor.scheduleEvent(revMs, function() {
            conductor.activatePlayer("rev");
            Sup.log("activating rev");
          })
          
          Sup.log(ms);
        }
        else {
          // Sup.log("sorry, npc already sang)");
        }
      }
    }
    
  }

  // create MultiSoundPlayers for instrumental entrance
  setupInstrumentalEntrance(vol, path_audio) {    
    // riff
    let inst = "riff";
    let path_instrumentalEntrance = path_audio + "Instrumental Entrance/";
    let tail_riff = path_instrumentalEntrance+"tail " + inst + ".mp3";
    let msp_riff = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3",
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      {
        0: tail_riff, // <- passing in tail(s) as object; here we're being lazy by using the same tail sample for each beat
        4: tail_riff,
        7: tail_riff,
        11: tail_riff,
        14: tail_riff
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
      path_instrumentalEntrance+"tail " + inst + ".mp3", // <- passing in single tail as string; available for all beats
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
      {0: tail_cello}, // <- we only want this tail to happen on beat 0, not all beats
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
    
    // verse 2 - blakiesoph
    inst = "verse2_inst_blakiesoph";
    let msp_verse2_blakiesoph = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );
    
    // verse 2 - orchestral
    inst = "verse2_inst_orchestral";
    let msp_verse2_orchestral = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );
    
    // bridge - synth
    inst = "1 bridge synth freeze";
    let msp_bridge_synth = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );
    
    // bridge - chip
    inst = "2 bridge chip freeze";
    let msp_bridge_chip = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );
    
    // bridge - cello
    inst = "3 bridge cello freeze";
    let msp_bridge_cello = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );
    
    // bridge - keys
    inst = "4 bridge keys freeze";
    let msp_bridge_keys = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );
    
    // bridge - chop vox
    inst = "5 bridge chop vox freeze";
    let msp_bridge_chopvox = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      vol,
      {active: false, logOutput: this.logOutput}
    );
    
    // vox
    let path_vox = path_audio + "Verse/" + "v2_vox.mp3";
    let msp_vox = new Sup.Audio.MultiSoundPlayer(
      path_vox,
      path_vox,
      path_audio + "Tabs/" + "tail stretch.mp3",
      vol * 0.75,
      {
        loop: true, // to prevent retriggering each cycle, since the vocal phrase is longer than a cycle
        active: false,
        logOutput: this.logOutput
      }
    );
    this.verseVocals = new Sup.Audio.SoundPlayer(path_vox, vol);
    
    
    // Single note samples (using SoundPlayers)
    let chimeagainvol = vol * 0.5;
    this.chimeagain = {
      "f#": new Sup.Audio.SoundPlayer(path_audio+"Instrumental Entrance/"+"chimeagain_fsharp.mp3", chimeagainvol),
      "g": new Sup.Audio.SoundPlayer(path_audio+"Instrumental Entrance/"+"chimeagain_g.mp3", chimeagainvol),
      "d": new Sup.Audio.SoundPlayer(path_audio+"Instrumental Entrance/"+"chimeagain_d.mp3", chimeagainvol),
      "e": new Sup.Audio.SoundPlayer(path_audio+"Instrumental Entrance/"+"chimeagain_e.mp3", chimeagainvol)
    };
    
    // Create the params object
    this.params_instrumentalEntrance = {
      bpm: 180,
      timesig: 15,
      players: {
        "riff": msp_riff,
        "drums": msp_drums,
        "rev": msp_rev,
        "bass": msp_bass,
        "cello": msp_cello,
        "keys": msp_keys,
        "vox": msp_vox,
        "verse2_blakiesoph": msp_verse2_blakiesoph,
        "verse2_orchestral": msp_verse2_orchestral,
        "bridge_synth": msp_bridge_synth,
        "bridge_chip": msp_bridge_chip,
        "bridge_cello": msp_bridge_cello,
        "bridge_keys": msp_bridge_keys,
        "bridge_chopvox": msp_bridge_chopvox,
      }
    };
  }

  // create MultiSoundPlayers for tabs (dream) section
  setupTabTest(vol, path_audio) {
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
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    let msp_stretch = new Sup.Audio.MultiSoundPlayer(
      path_audio + "Tabs/" + "initAndLoop stretch.mp3",
      path_audio + "Tabs/" + "initAndLoop stretch.mp3",
      {
        0: path_audio + "Tabs/" + "tail stretch.mp3"
      },
      0,
      {active: true, logOutput: this.logOutput}
    );

    // params to set as conductor's nextParams
    this.params_tabTest = {
      bpm: 112,
      timesig: 34,
      players: {
        "guitar": msp_tabguitar,
        "rev": msp_tabrev,
        "stretch": msp_stretch
      }
    };
    Sup.log(this.params_tabTest);
  }
  
  /*
  // setup MSPs for next part of dreamsong
  setupTabularasaDreamsong(vol, path_audio, section) {
    let path_tabularasa = path_audio + "Tabularasa Dreamsong " + section + "/";
    let inst = "guitar";
    let tail_guitar = path_tabularasa + "tail " + inst + ".mp3";
    let msp_guitar = new Sup.Audio.MultiSoundPlayer(
      path_tabularasa + "init " + inst + ".mp3",
      path_tabularasa + "loop " + inst + ".mp3",
      {
        0: tail_guitar,
        8: tail_guitar,
        16: tail_guitar,
        25: tail_guitar
      },
      vol,
      {logOutput: this.logOutput}
    );
    
    this.params_tabularasa_a = {
      bpm: 100,
      timesig: 15*4,
      players: {
        "guitar": msp_guitar
      }
    };
    
  }
  */

  // this is slightly different from "phrase", since this determines section withIN the main phrase
  updateCurrentSection() {
    let playerActor = Sup.getActor("Player");
    let playerPosition = playerActor.cannonBody.body.position;
    let playerY = playerPosition.y;
    
    if (playerY >= 600) {
      this.currentSection = 0;
    }
    else if (playerY >= 500) {
      this.currentSection = 1;
    }
    else if (playerY >= 400) {
      this.currentSection = 2;
    }
    else if (playerY >= 300) {
      this.currentSection = 3;
    }
    else if (playerY >= 200) {
      this.currentSection = 4;
    }
    else if (playerY >= 100) {
      this.currentSection = 5;
    }
    else {
      this.currentSection = 6;
    }
  }
}
Sup.registerBehavior(MusicConductorBehavior);
