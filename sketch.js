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
  loadJSON(
    'data/distances.json',
    res => (distances = processDistances(res.distances))
  );
}

function setup() {
  background('#0096FF');
}

function draw() {}

function windowResized() {}

// form functions

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

function submitForm(event) {
  event.preventDefault();
  const start = startSelect.value;
  const islands = selectedIslands;
  const end = endSelect.value;
  startCalculation(start, islands, end);
}

// drawing functions

// calculation functions

function startCalculation(start, islands, end) {
  const routes = generateRoutes(start, islands, end);
  crunch(routes);
}

function generateRoutes(start, islands, end) {
  if (start != -1) {
    islands.delete(start);
  }
  if (end != -1) {
    islands.delete(end);
  }
  let routes = new Combinatorics.Permutation(
    Array.from(islands).map(Number)
  ).toArray();
  if (start != -1) {
    routes = routes.map(route => {
      route.unshift(parseInt(start));
      return route;
    });
  }
  if (end != -1) {
    routes = routes.map(route => {
      route.push(parseInt(end));
      return route;
    });
  }
  return routes;
}

function crunch(routes) {
  let minDistance = Infinity;
  let minRoute = [];
  routes.forEach(route => {
    const d = calculateRouteDistance(route);
    if (d < minDistance) {
      minRoute = route;
      minDistance = d;
    }
  });
  console.log(minRoute, minDistance);
}

function calculateRouteDistance(route) {
  let distance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    distance += getDistance(
      Math.min(route[i], route[i + 1]),
      Math.max(route[i], route[i + 1])
    );
  }
  return distance;
}

// helper functions

function processDistances(array) {
  const distances = new Map();
  array.forEach(islandA => {
    const temp = new Map();
    islandA.islands.forEach(islandB => {
      temp.set(islandB.b, islandB.distance);
    });
    distances.set(islandA.a, temp);
  });
  return distances;
}

function sortAlphabetically(array, property) {
  return array.sort((a, b) => a[property].localeCompare(b[property]));
}

function getDistance(a, b) {
  return distances.get(a).get(b);
}
