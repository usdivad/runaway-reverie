class MusicConductorBehavior extends Sup.Behavior {
  
  conductor: Sup.Audio.Conductor;
  phrase: string;
  
  params_instrumentalEntrance: any;
  params_tabTest: any;
  params_tabularasa_a: any;

  chimeagain: any;
  // verseVocals: Sup.Audio.SoundPlayer;
  // verse2Vocals: Sup.Audio.SoundPlayer;

  drumsAndBassHaveEntered: boolean;
  bridgeInstsHaveEntered: boolean;

  playerPreviouslyCouldJump: boolean;
  playerWasJumping: boolean;
  playerMovementLock: boolean;

  celloFadeVolMax: number;
  celloFadeVolMin: number;

  logOutput: boolean;
  transitioning: boolean;

  npcHasSung: boolean;
  cyclesSinceNpcHasSung: number;
  verse2NpcHasSung: boolean;

  verse2SelectedNpcIdx: number = 1;

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
    
    // sections
    this.drumsAndBassHaveEntered = false;
    this.bridgeInstsHaveEntered = false;
    
    this.transitioning = false;
    
    this.npcHasSung = false;
    this.cyclesSinceNpcHasSung = 0;
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
        this.conductor.fadePlayer("vox", 0, this.conductor.getMillisecondsLeftUntilNextTransitionBeat());
        
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
        this.cyclesSinceNpcHasSung = 0;
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
        this.conductor.fadePlayer("stretch", this.vol * 2, this.conductor.getMillisecondsLeftUntilNextTransitionBeat());
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
      
      // drums n bass
      if (this.currentSection > 0 && this.currentSection < 5) {
        // activate bass and fade-in drums if they haven't entered before
        if (!this.drumsAndBassHaveEntered) { 
          // bass
          this.conductor.activatePlayer("bass");
          Sup.log("player has moved; activating bass for the next cycle");
          this.drumsAndBassHaveEntered = true;

          // drums
          this.conductor.fadePlayer("drums", this.vol, 250);
          Sup.log("fading drums in");
        }
      }
      else {
        // deactivate n fade out
        this.conductor.deactivatePlayer("bass");
        this.conductor.fadePlayer("drums", 0, 250);
        this.drumsAndBassHaveEntered = false;
      }
      
      // verse 2
      if (this.currentSection == 4) {
        // start singing
        if (!this.verse2NpcHasSung) {
          this.conductor.fadePlayer("verse2_vox", this.vol * 0.75, 250);
          this.conductor.activatePlayer("verse2_vox");
          this.verse2NpcHasSung = true;
        }
        
        // background instrumental
        let instGroupNames = [
          ["verse2_blakiesoph"], // 1
          ["riff", "drums", "rev", "bass", "keys"], // 2
          ["verse2_orchestral"] // 3
        ];
        
        // get the selected npc
        let npcs = [Sup.getActor("Verse 2 NPC 1"), Sup.getActor("Verse 2 NPC 2"), Sup.getActor("Verse 2 NPC 3")];
        let selectedNpcIdx = this.verse2SelectedNpcIdx;
        for (let i in npcs) {
          let npc = npcs[i];
          if (npc.getBehavior(NPCBehavior).selected) {
            selectedNpcIdx = i;
            break;
          }
        }
        
        // apply transition if necessary
        if (selectedNpcIdx != this.verse2SelectedNpcIdx) {
          let fadeLength = 100;
          this.conductor.fadePlayers(instGroupNames[this.verse2SelectedNpcIdx], 0, fadeLength);
          this.conductor.fadePlayers(instGroupNames[selectedNpcIdx], this.vol, fadeLength);
          this.verse2SelectedNpcIdx = selectedNpcIdx;
        }
        
        
      }
      else {
        // fade out vocals
        this.conductor.fadePlayer("verse2_vox", 0, 250);
        Sup.log("fading verse2_vox out");
        this.verse2NpcHasSung = false;
        
        // fade out insts
        this.conductor.fadePlayers(["verse2_blakiesoph", "verse2_orchestral"], 0, 250);
      }
      
      // bridge
      if (this.currentSection == 5) {
        if (!this.bridgeInstsHaveEntered) {
          this.conductor.fadePlayers(["riff", "drums", "rev", "vox", "verse2_blakiesoph", "verse2_orchestral"], 0, 250);
          this.conductor.deactivatePlayers(["keys", "bass", "cello"]);
          this.conductor.fadePlayer("bridge_keys", this.vol, 250);
          this.bridgeInstsHaveEntered = true;
        }
        
        // switcheroo segment
        let playerQuadrant = playerActor.getBehavior(CharacterBehavior).currentQuadrant;
        switch (playerQuadrant) {
          case 1:
            //this.conductor.activatePlayer("bridge_chip");
            this.conductor.fadePlayer("bridge_chip", this.vol * 0.65, 100);
            break;
          case 2:
            this.conductor.fadePlayer("bridge_synth", this.vol * 1.25, 250);
            break;
          case 3:
            this.conductor.fadePlayer("bridge_cello", this.vol * 0.9, 250);
            break;
          case 4:
            this.conductor.fadePlayer("bridge_chopvox", this.vol * 0.9, 250);
            break;
        }
        
      }
      else {
        this.conductor.fadePlayers(["bridge_synth", "bridge_chip", "bridge_cello", "bridge_keys", "bridge_chopvox"], 0, 250);
        // this.conductor.fadePlayer("bridge_chip", 0, 250);
        this.conductor.fadePlayer("riff", this.vol, 250);
        this.conductor.activatePlayer("cello");
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
    
    
    
    // verse 1 NPC vocalist
    if (this.phrase == "instrumental entrance" && !this.conductor.isTransitioning()) {
      let npc = Sup.getActor("NPC Vocalist");
      if (npc["__behaviors"]["NPCBehavior"][0].readyToSing) {
        
        if (!this.npcHasSung) {
          this.npcHasSung = true;
          let conductor = this.conductor;
          
          Sup.log("npc is singing");
          
          // start singing
          this.conductor.fadePlayer("vox", this.vol * 0.75, 250);
          this.conductor.activatePlayer("vox");
          
          // // we only let vox play once
          // this.conductor.scheduleEvent(this.conductor.getMillisecondsLeftUntilNextDownbeat() * 1.5, function() {
          //   conductor.deactivatePlayer("vox"); 
          //   Sup.log("deactivated vox");
          // });

          // trigger manually because the phrase is longer than the section's phrase length
          //let vox = this.verseVocals;
          let ms = this.conductor.getMillisecondsLeftUntilNextDownbeat(); // 100ms offset?
          let cycleMs = Sup.Audio.Conductor.calculateNextBeatTime(0, this.conductor.getBpm()) * 15 * 1000; // this.conductor.getTimesig();
          Sup.log("cycleMs: " + cycleMs);
          
          // timeout leads to unreliable performance timing
          // Sup.setTimeout(ms, function() {
          //   vox.play();
          // });
          
          // this.conductor.scheduleEvent(ms, function() {
          //   vox.play();
          //   Sup.log("playing vox!");
          // });
          
          // lock player movement for n cycles regardless of current place
          this.playerMovementLock = true;
          Sup.log("locking player movement");
          let lockMs = cycleMs * 1.5;
          let mcb = this;
          this.conductor.scheduleEvent(lockMs, function() {
            mcb.playerMovementLock = false; // closureee
            // mcb.cyclesSinceNpcHasSung = 2;
            Sup.log("unlocking player movement");
          });
          
          // activate rev after vox are done
          let revMs = cycleMs*3 + ms;
          // let revMs = ms;
          this.conductor.scheduleEvent(revMs, function() {
            conductor.activatePlayer("rev");
            Sup.log("activating rev");
          });
          
          // deactivate/fade-out vox after 4 cycles
          let deactivateMs = cycleMs*4 + ms;
          this.conductor.scheduleEvent(deactivateMs, function() {
            // conductor.deactivatePlayer("vox");
            // if (conductor.getPlayer("vox")) {
            //   conductor.getPlayer("vox").playTail(0);
            //   conductor.getPlayer("vox").reset();
            // }
            // Sup.log("deactivatin vox");
            
            conductor.fadePlayer("vox", 0, 50);
            Sup.log("fading vox out"); // TODO: figure out whether we want verse 1 to be reactivatable, and if so, how
          });
          
          Sup.log("ms: " + ms);
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
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    // verse 2 - orchestral
    inst = "verse2_inst_orchestral";
    let msp_verse2_orchestral = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    // bridge - synth
    inst = "1 bridge synth freeze";
    let msp_bridge_synth = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    // bridge - chip
    inst = "2 bridge chip freeze";
    let msp_bridge_chip = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    // bridge - cello
    inst = "3 bridge cello freeze";
    let msp_bridge_cello = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    // bridge - keys
    inst = "4 bridge keys freeze";
    let msp_bridge_keys = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    // bridge - chop vox
    inst = "5 bridge chop vox freeze";
    let msp_bridge_chopvox = new Sup.Audio.MultiSoundPlayer(
      path_instrumentalEntrance+"init " + inst + ".mp3", 
      path_instrumentalEntrance+"loop " + inst + ".mp3",
      path_instrumentalEntrance+"tail " + inst + ".mp3",
      0,
      {active: true, logOutput: this.logOutput}
    );
    
    // verse 1 vox
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
    // this.verseVocals = new Sup.Audio.SoundPlayer(path_vox, vol);
    // this.verse2Vocals = new Sup.Audio.SoundPlayer(path_vox, vol);
    
    // verse 2 vox
    // TODO: load new sample
    let path_verse2_vox = path_audio + "Verse/" + "v2_vox.mp3";
    let msp_verse2_vox = new Sup.Audio.MultiSoundPlayer(
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
        "verse2_vox": msp_verse2_vox,
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
    
    if (playerY >= 600) {      // intro
      this.currentSection = 0;
    }
    else if (playerY >= 500) { // bass + drums
      this.currentSection = 1;
    }
    else if (playerY >= 400) { // verse 1
      this.currentSection = 2;
    }
    else if (playerY >= 300) { // ...
      this.currentSection = 3;
    }
    else if (playerY >= 200) { // verse 2
      this.currentSection = 4;
    }
    else if (playerY >= 100) { // bridge
      this.currentSection = 5;
    }
    else {                     // chorus
      this.currentSection = 6;
    }
  }
}
Sup.registerBehavior(MusicConductorBehavior);
