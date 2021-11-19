// variables
let islands, distances, outposts;
const selectedIslands = new Set();
// html elements
const startSelect = document.getElementById('start');
const islandSelect = document.getElementById('island');
const islandButton = document.getElementById('add-island');
const islandList = document.getElementById('island-list');
const endSelect = document.getElementById('end');
const submitButton = document.getElementById('submit');

// p5.js functions

function preload() {
  loadJSON('data/islands.json', res => {
    islands = sortAlphabetically(res.islands, 'name');
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

// dom functions

function setSelectOptions() {
  islands.forEach(island => {
    const element = document.createElement('option');
    element.innerText = island.name;
    element.value = island.id;
    startSelect.append(element.cloneNode(true));
    islandSelect.append(element.cloneNode(true));
    endSelect.append(element);
  });
}

function addIsland() {
  if (selectedIslands.has(islandSelect.value)) {
    console.error(`Island #${islandSelect.value} already added`);
  } else {
    selectedIslands.add(islandSelect.value);
    islandList.innerHTML = '';
    sortAlphabetically(
      islands.filter(island => selectedIslands.has(island.id.toString())),
      'name'
    ).forEach(island => {
      const element = document.createElement('button');
      element.innerText = island.name;
      element.value = island.id;
      element.className = 'list-group-item list-group-item-action';
      element.type = 'button';
      element.onclick = e => deleteIsland(e.target);
      islandList.append(element);
    });
    islandList.hidden = false;
  }
}

function deleteIsland(element) {
  selectedIslands.delete(element.value);
  element.remove();
  islandList.hidden = !selectedIslands.size;
}

// helper functions

function sortAlphabetically(array, property) {
  return array.sort((a, b) => a[property].localeCompare(b[property]));
}

// drawing functions

// calculation functions
