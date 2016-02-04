class MusicConductorBehavior extends Sup.Behavior {
  
  // Note possibilities, probabilities, and samples. Markov chain implementation
  private notes = {
    "DLow": {
      "next": {
        "notes": ["A", "DHigh"],
        "probs": [0.5, 0.5]
      },
      "numSamples": 3
    },
    "A": {
      "next": {
        "notes": ["AToB", "DHigh"],
        "probs": [0.5, 0.5]
      },
      "numSamples": 3
    },
    "AToB": {
      "next": {
        "notes": ["A", "BToA", "DHigh"],
        "probs": [0.5, 0.25, 0.25]
      },
      "numSamples": 2
    },
    "BToA": {
      "next": {
        "notes": ["DLow", "DHigh"],
        "probs": [0.5, 0.5]
      },
      "numSamples": 2
    },
    "DHigh": {
      "next": {
        "notes": ["DLow", "A", "BToA"],
        "probs": [0.6, 0.2, 0.2]
      },
      "numSamples": 3
    }
  };

  // Keeping track of previous values and thresholds for consecutives
  private prevNote: string;
  private consecutiveNotes = 0;
  private maxConsecutiveNotes = 2;
  private consecutiveRests = 0;
  private maxConsecutiveRests = 3;
  private time = 0;
  
  awake() {
    let startingNote = "DLow";
    let startingSample = MusicConductorBehavior.constructFullSampleName(startingNote, this.notes[startingNote]["numSamples"]);
    this.prevNote = startingNote;
    
    Sup.Audio.playSound("Audio/Guitar Intro/" + startingSample + ".mp3");
    Sup.log(startingSample);
  }

  update() {
    this.time += 1;
    let playNote = wchoose([true, false], [0.4, 0.6]);
    let moving = Sup.getActor("Player")["__behaviors"]["CharacterBehavior"][0].isMoving;
    let period = 80;
    
    // Sup.log(moving);
    
    // deal with thresholds for consecutive notes/rests
    // the notes threshold takes precedence as it appears first
    if (this.consecutiveNotes >= this.maxConsecutiveNotes) {
      playNote = false;
      this.consecutiveNotes = 0;
    }
    else if (this.consecutiveRests >= this.maxConsecutiveRests) {
      playNote = true;
      this.consecutiveRests = 0;
    }
    
    // play the note if conditions are met
    // todo: add player movement detection <--> the time limit
    if (this.time % period == 0) {
      if (playNote) {
        let next = this.notes[this.prevNote]["next"];
        let noteChoices = next["notes"];
        let noteProbs = next["probs"];
        let note = wchoose(noteChoices, noteProbs);
        let sample = MusicConductorBehavior.constructFullSampleName(note, this.notes[note]["numSamples"]);

        // update prev values
        this.prevNote = note;
        this.consecutiveNotes++;
        this.consecutiveRests = 0;

        // play the note
        let samplePath = "Audio/Guitar Intro/" + sample + ".mp3";
        Sup.Audio.playSound(samplePath);
        Sup.log(this.time + ", " + sample + ", " + this.consecutiveNotes);
      }
      else {
        this.consecutiveNotes = 0;
        this.consecutiveRests++;
      }
    }
  }

  // Pick a sample number and concatenate it to the base sample name
  public static constructFullSampleName(sampleName, numSamples):string {
    let sampleNumber = Math.floor(Math.random()*numSamples);
    return sampleName + numSamples.toString();
  }
}
Sup.registerBehavior(MusicConductorBehavior);
