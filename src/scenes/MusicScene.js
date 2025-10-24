
// MusicScene.js
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js";

export default class MusicScene extends Phaser.Scene {
    constructor() {
        super({ key: "MusicScene", active: false });
    }

    preload() {
       console.log("🎧 MusicScene: preload() started");

        this.load.audio("backgroundMusic", "audio/Intro Theme.mp3");
         console.log("🎧 MusicScene: preload() started");

            this.load.on('loaderror', (file) => {
      console.error("❌ MusicScene: failed to load audio file", file);
    });
    }

    create() {
        // Play music once scene is created
            console.log("🎬 MusicScene: create() started");
    console.log("AudioContext state:", this.sound.context.state);

        //this.bgMusic = this.sound.add("backgroundMusic", { loop: true, volume: 0.5 });
        //this.bgMusic.play();
if (this.sound.context.state === "suspended") {
      console.warn("⚠️ AudioContext is suspended, waiting for user click to resume...");
      this.input.once("pointerdown", () => {
        console.log("🖱️ User clicked, resuming AudioContext");
        this.sound.context.resume();
        this.playMusic();
      });
    } else {
      this.playMusic();
    }
  }
  

  playMusic() {
    console.log("🎵 MusicScene: attempting to play music...");
    try {
      this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
      this.bgMusic.play();
      console.log("✅ bgMusic is playing!", this.bgMusic);
    } catch (err) {
      console.error("💥 MusicScene: error while playing audio", err);
    }
  }

  // Optional: functions to control music
  pauseMusic() {
    if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.pause();
  }

  resumeMusic() {
    if (this.bgMusic && this.bgMusic.isPaused) this.bgMusic.resume();
  }

  stopMusic() {
    if (this.bgMusic) this.bgMusic.stop();
  }

}

