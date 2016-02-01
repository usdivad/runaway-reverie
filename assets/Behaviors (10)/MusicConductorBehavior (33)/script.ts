class MusicConductorBehavior extends Sup.Behavior {
  
  private time = 0;
  private notes = ["A1", "A2", "A3",
                   "AToB1", "AToB2",
                   "BToA1", "BToA2",
                   "DHigh1", "DHigh2", "DHigh3", 
                   "DLow1", "DLow2", "DLow3", "DLow1", "DLow2", "DLow3"];
  private prevNote: string;
  
  awake() {
    let startingNoteIndex = Math.floor(Math.random()*3)+1;
    let startingNote = "DLow" + startingNoteIndex;
    Sup.Audio.playSound("Audio/Guitar Intro/" + startingNote + ".mp3");
    this.prevNote = startingNote;
    Sup.log(startingNote);
  }

  update() {
    this.time += 1;
    let coinToss = [true, false][Math.floor(Math.random()*2)];
    
    // play the note if conditions are met
    // todo: add player movement detection <--> the time limit
    if (this.time % 80 == 0 && coinToss) {
      let note = this.notes[Math.floor(Math.random()*this.notes.length)];
      
      // prevent the same note from triggering twice in a row
      while (note == this.prevNote) {
        note = this.notes[Math.floor(Math.random()*this.notes.length)];
        Sup.log(note + "==" + this.prevNote);
      }
      
      this.prevNote = note;
      
      // play the note
      let notePath = "Audio/Guitar Intro/" + note + ".mp3";
      Sup.Audio.playSound(notePath);
      Sup.log(this.time + ", " + note);
    }
  }
}
Sup.registerBehavior(MusicConductorBehavior);
