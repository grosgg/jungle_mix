import * as THREE from "three";
import { Note, Interval, Scale, Chord } from "tonal";
import * as Tone from "tone";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / (window.innerWidth / 2),
  0.1,
  50
);

const bgColor = new THREE.Color(0x00ccff);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerWidth / 2);
renderer.setClearColor(bgColor);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(0.35);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x00aaff, 0.25);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffaaaa, 1);
directionalLight.position.set(-10, -2, 6);
directionalLight.castShadow = true;
scene.add(directionalLight);

const planeG = new THREE.PlaneGeometry(100, 100);
const planeM = new THREE.MeshStandardMaterial({
  color: 0x00aaff,
  side: THREE.FrontSide,
  metalness: 1,
});
const plane = new THREE.Mesh(planeG, planeM);
plane.receiveShadow = true;
scene.add(plane);

const boxG = new THREE.BoxGeometry(1, 1, 1);
const boxM = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  roughness: 0.1,
  metalness: 0.7,
});
const cube = new THREE.Mesh(boxG, boxM);
cube.position.z = 2;
cube.castShadow = true;
scene.add(cube);

const coneG = new THREE.ConeGeometry(0.5, 1, 32);
const coneM = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  roughness: 0.7,
});

for (let i = 0; i < 2 * Math.PI; i += Math.PI / 3) {
  const cone = new THREE.Mesh(coneG, coneM);
  cone.position.set(2 * Math.cos(i), 2 * Math.sin(i), 0.5);
  cone.rotation.x = Math.PI / 2;
  cone.castShadow = true;
  cone.receiveShadow = true;
  scene.add(cone);
}

scene.fog = new THREE.Fog(bgColor, 5, 20);

camera.position.set(0, -4, 1);
camera.lookAt(0, 0, 1);

// ======================================= TONE ==============================

// Create a new Tone.js Transport
const transport = Tone.Transport;

// Set the BPM (Beats Per Minute) for the beat
transport.bpm.value = 170;

// Beat Reverb
const beatReverb = new Tone.Reverb({
  decay: 0.2,
  wet: 0.6,
}).toDestination();

// Beat LowPass Filter
const beatLowPass = new Tone.Filter(5000, "lowpass").connect(beatReverb);

// Kick
const kickSynth = new Tone.MembraneSynth({
  volume: -5,
}).connect(beatLowPass);

// Snare
const snareSynth = new Tone.NoiseSynth({
  volume: -5,
  noise: {
    type: "white",
  },
  envelope: {
    attack: 0.001,
    decay: 0.2,
    sustain: 0,
  },
}).connect(beatLowPass);

// Hi-Hat
const hihatSynth = new Tone.MetalSynth({
  volume: -10,
  envelope: {
    attack: 0.001,
    decay: 0.05,
    release: 1,
  },
}).connect(beatLowPass);

// Drums
const drumsSynth = new Tone.MetalSynth({
  volume: -5,
  envelope: {
    attack: 0.001,
    decay: 0.01,
    release: 0.01,
  },
}).connect(beatLowPass);

// Bass LowPass Filter
const bassLowPass = new Tone.EQ3({
  mid: -10,
  high: -100,
}).toDestination();

// Bass
const bass = new Tone.Synth({
  // volume: 0,
  oscillator: {
    type: "amtriangle",
    modulationType: "sine",
  },
  envelope: {
    attack: 0.01,
    decay: 0.01,
    sustain: 0.6,
    release: 0.1,
  },
}).connect(bassLowPass);

// Ambience Reverb
const ambienceReverb = new Tone.Reverb({
  decay: 8,
  wet: 0.6,
}).toDestination();

// Ambience EQ
const ambienceEq = new Tone.EQ3({
  low: -100,
  mid: -8,
  high: -10,
}).connect(ambienceReverb);

// Ambience LowPass Filter
const ambienceLowPass = new Tone.Filter(2000, "lowpass").connect(ambienceEq);

// Ambience Feedback Delay
const feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).connect(
  ambienceLowPass
);

// Ambience Synth
const ambienceSynth = new Tone.PolySynth({ voice: Tone.Synth }).connect(
  feedbackDelay
);

// Set up the synth voice options
ambienceSynth.set({
  volume: -5,
  detune: 30,
  channelCount: 2,
  portamento: 0.05,
  oscillator: {
    type: "fatsawtooth",
    spread: 10,
    count: 3,
  },
  envelope: {
    attack: 2,
    sustain: 0.7,
    release: 4,
  },
});

// Arpeggio Reverb
const arpeggioReverb = new Tone.Reverb({
  decay: 20,
  wet: 0.7,
}).toDestination();

// Arpeggio Feedback Delay
const arpeggioDelay = new Tone.FeedbackDelay("8n", 0.5).connect(arpeggioReverb);

// Arpeggio HiPass Filter
const arpeggioHiPass = new Tone.Filter(1000, "highpass").connect(arpeggioDelay);

// Arpeggio Synth
const arpeggioSynth = new Tone.PolySynth().connect(arpeggioHiPass);

arpeggioSynth.set({
  volume: -10,
  oscillator: {
    type: "sawtooth",
  },
  envelope: {
    attack: 0.01,
    sustain: 0.3,
    release: 10,
  },
});

const kicks = [
  { time: "0:0:0" },
  { time: "0:3:2" },
  { time: "1:2:2" },
  { time: "2:0:0" },
  { time: "2:2:2" },
];

const kickPart = new Tone.Part((time) => {
  // console.log("Kick", time);
  kickSynth.triggerAttackRelease("C1", "4n", time);
}, kicks);
kickPart.loop = true;
kickPart.loopEnd = "4:0";

const snares = [
  { time: "0:1:0" },
  { time: "1:0:2" },
  { time: "1:2:0" },
  { time: "1:2:2" },
  { time: "2:0:0" },
  { time: "2:2:0" },
  { time: "3:0:2" },
  { time: "3:2:0" },
  { time: "3:3:2" },
];
const snarePart = new Tone.Part((time) => {
  // console.log("Snare", time);
  snareSynth.triggerAttackRelease("8n", time);
}, snares);
snarePart.loop = true;
snarePart.loopEnd = "4:0";

const hihatPattern = new Tone.Pattern(
  (time, note) => {
    // console.log("Hi-hat", time);
    hihatSynth.triggerAttackRelease(note, "16n", time);
  },
  ["C0", "C1"],
  "up"
);
hihatPattern.interval = "8n";

const drumsLine = [
  { time: "0:0:0", note: "C0" },
  { time: "0:0:1", note: "C1" },
  { time: "0:0:2", note: "C2" },
  { time: "0:2:2", note: "C2" },
  { time: "0:2:1", note: "C1" },
  { time: "0:2:0", note: "C0" },
];
const drumsPart = new Tone.Part((time, note) => {
  drumsSynth.triggerAttackRelease(note.note, "16n", time);
}, drumsLine);
drumsPart.loop = true;

const bassLine = [
  { time: "0:0:0", note: "E2", duration: "1:1" },
  { time: "1:1:2", note: "B2", duration: "16n" },
  { time: "1:2:0", note: "C2", duration: "16n" },
  { time: "1:2:2", note: "C2", duration: "16n" },
  { time: "1:3:0", note: "A2", duration: "8n" },
  { time: "2:0:0", note: "E2", duration: "1n" },
  { time: "3:0:0", note: "C2", duration: "3n" },
  { time: "3:1:2", note: "D2", duration: "3n" },
  { time: "3:3:0", note: "A2", duration: "4n" },
  { time: "4:0:0", note: "E2", duration: "1:1" },
  { time: "5:1:2", note: "B2", duration: "16n" },
  { time: "5:2:0", note: "C2", duration: "16n" },
  { time: "5:2:2", note: "C2", duration: "16n" },
  { time: "5:3:0", note: "A2", duration: "8n" },
  { time: "6:0:0", note: "E2", duration: "1n" },
  { time: "7:0:0", note: "C2", duration: "3n" },
  { time: "7:1:2", note: "D2", duration: "3n" },
  { time: "7:3:0", note: "A1", duration: "4n" },
];

const bassPart = new Tone.Part((time, note) => {
  bass.triggerAttackRelease(note.note, note.duration, time);
}, bassLine);
bassPart.loop = true;
bassPart.loopEnd = "8:0";

const ambienceLine = [
  {
    time: "0:0:0",
    notes: Chord.get("C4maj7").notes,
    duration: "7m",
  },
  {
    time: "8:0:0",
    notes: Chord.get("A3maj7").notes,
    duration: "7m",
  },
];

const ambiencePart = new Tone.Part((time, note) => {
  ambienceSynth.triggerAttackRelease(note.notes, note.duration, time);
}, ambienceLine);
ambiencePart.loop = true;
ambiencePart.loopEnd = "16:0";

kickPart.start(0);
snarePart.start(0);
hihatPattern.start(0);
drumsPart.start(0);
bassPart.start(0);
ambiencePart.start(0);

document.querySelector("body")?.addEventListener("click", async () => {
  await Tone.start();

  if (transport.state !== "started") {
    transport.start("+1");
    // console.log("transport started");
  } else {
    transport.stop();
    // console.log("transport stopped");
  }
});

const animate = () => {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.005;
  cube.rotation.z += 0.005;

  // cube.position.z = Math.cos(Date.now() * 0.0005) * 3;
  renderer.render(scene, camera);
};

const memLog = () => {
  setTimeout(() => {
    console.log(
      Math.floor(window.performance.memory.totalJSHeapSize / 1024 / 1024)
    );
    memLog();
  }, 1000);
};

animate();
memLog();
