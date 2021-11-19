// variables
let islands, distances, outposts;
// html elements
const startSelect = document.getElementById('start');
const islandSelect = document.getElementById('island');
const islandButton = document.getElementById('add-island');
const endSelect = document.getElementById('end');
const submitButton = document.getElementById('submit');

// p5.js functions

function preload() {
  loadJSON('data/islands.json', res => {
    islands = res.islands.sort((a, b) => a.name.localeCompare(b.name));
    outposts = islands.filter(island => island.type === 'Outpost');
    setSelectOptions();
    return res;
  });
  loadJSON('data/distances.json', res => (distances = res.distances));
}

function setup() {
  background('#0096FF');
}

function draw() {}

function windowResized() {}

// helper functions

function setSelectOptions() {
  islands.forEach(island => {
    let element = document.createElement('option');
    element.innerText = island.name;
    element.value = island.id;
    startSelect.append(element.cloneNode(true));
    islandSelect.append(element.cloneNode(true));
    endSelect.append(element);
  });
}

// drawing functions

// calculation functions
