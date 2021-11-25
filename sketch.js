// variables
let islands,
  distances,
  outposts,
  islandMap,
  bestRoute,
  bestDistance,
  oldBestRoute,
  closestIsland;
const selectedIslands = new Set();
// html elements
const main = document.getElementsByTagName('main')[0],
  islandName = document.getElementById('island-name'),
  startSelect = document.getElementById('start'),
  islandSelect = document.getElementById('island'),
  islandButton = document.getElementById('add-island'),
  islandList = document.getElementById('island-list'),
  endSelect = document.getElementById('end'),
  submitButton = document.getElementById('submit');
// colors
const BLUE = '#0096FF';
const GREEN = '#26532B';
const BROWN = '#964B00';

// p5.js functions

function preload() {
  loadJSON('data/islands.json', res => {
    islands = sortAlphabetically(res.islands, 'name');
    outposts = islands.filter(island => island.type === 'Outpost');
    islandMap = new Map(islands.map(island => [island.id, island]));
    setSelectOptions();
    return res;
  });
  loadJSON(
    'data/distances.json',
    res => (distances = processDistances(res.distances))
  );
}

function setup() {
  background(BLUE);
  const size = getCanvasSize();
  createCanvas(size, size);
}

function draw() {
  if (bestRoute) {
    if (!arraysEqual(bestRoute, oldBestRoute)) {
      clear();
      oldBestRoute = [...bestRoute];
      stroke('black');
      strokeWeight(2);
      for (let i = 0; i < bestRoute.length - 1; i++) {
        const islandA = islandMap.get(bestRoute[i]);
        const islandB = islandMap.get(bestRoute[i + 1]);
        line(
          ...normalizeCoords(islandA.x, islandA.y),
          ...normalizeCoords(islandB.x, islandB.y)
        );
      }
    }
  }
  islands.forEach(island => {
    const [x, y] = normalizeCoords(island.x, island.y);
    const size = (height / 70) | 0;
    switch (island.type) {
      case 'Small':
        fill(GREEN);
        noStroke();
        circle(x, y, size);
        break;
      case 'Large':
        fill(GREEN);
        noStroke();
        circle(x, y, size * 2);
        break;
      case 'Massive':
        fill(GREEN);
        noStroke();
        circle(x, y, size * 4);
        break;
      case 'Outpost':
        barrel(x, y, size);
        break;
      case 'Seapost':
        fish(x, y, size * 1, 5);
        break;
      case 'Fortress':
        skull(x, y, size * 1.5);
        break;
      default:
        console.error('island data is fucked', island);
        break;
    }
  });
}

function windowResized() {
  const size = getCanvasSize();
  resizeCanvas(size, size);
}

function mouseMoved() {
  if (mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) {
    const distancesFromMouse = new Map(
      islands.map(island => [
        dist(mouseX, mouseY, ...normalizeCoords(island.x, island.y)),
        island.id,
      ])
    );
    const distance = Math.min(...distancesFromMouse.keys());
    if (distance < 15) {
      const currentClosestIsland = distancesFromMouse.get(distance);
      if (currentClosestIsland !== closestIsland) {
        closestIsland = currentClosestIsland;
        islandName.textContent = islandMap.get(closestIsland).name;
      }
    } else {
      closestIsland = null;
      islandName.textContent = '';
    }
  }
}

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

function barrel(x, y, size) {
  ySize = size;
  xSize = (size * 2) / 3;
  rectMode(RADIUS);
  fill(BROWN);
  stroke(BROWN);
  rect(x, y, xSize, ySize);
  curve(
    x + xSize,
    y - ySize,
    x - xSize,
    y - ySize,
    x - xSize,
    y + ySize,
    x + xSize,
    y + ySize
  );
  curve(
    x - xSize,
    y - ySize,
    x + xSize,
    y - ySize,
    x + xSize,
    y + ySize,
    x - xSize,
    y + ySize
  );
  fill(0);
  noStroke();
  rect(x, y - (ySize * 5) / 7, xSize * 1.2, ySize / 10, 10, 10, 0, 0);
  rect(x, y + (ySize * 5) / 7, xSize * 1.2, ySize / 10, 0, 0, 10, 10);
}

function fish(x, y, size) {
  fill('darkgoldenrod');
  x += size / 4;
  noStroke();
  ellipse(x, y, size * 2, size);
  triangle(
    x - (size * 3) / 5,
    y,
    x - (size * 8) / 5,
    y - (size * 3) / 5,
    x - (size * 8) / 5,
    y + (size * 3) / 5
  );
  fill(0);
  ellipse(x + (size * 2) / 5, y, size / 5, size / 5);
}

function skull(x, y, size) {
  const skullWidth = (size * 6) / 5;
  const skullHeight = size;
  fill(255);
  noStroke();
  rectMode(CORNER);
  ellipse(x, y, skullWidth, skullHeight);
  rect(
    x - skullWidth / 4,
    y + skullHeight / 4,
    skullWidth / 2,
    skullHeight / 2
  );
  fill(0);
  const eyeSpacing = skullWidth / 4;
  const eyeWidth = skullWidth / 6;
  const eyeHeight = skullHeight / 4;
  ellipse(x - eyeSpacing, y, eyeWidth, eyeHeight);
  ellipse(x + eyeSpacing, y, eyeWidth, eyeHeight);

  const teethWidth = skullWidth / 30;
  const teethHeight = skullHeight / 4;
  const teethTop = y + skullHeight / 2;
  const teethSpacing = skullWidth / 6;
  rect(x - teethSpacing, teethTop, teethWidth, teethHeight);
  rect(x, teethTop, teethWidth, teethHeight);
  rect(x + teethSpacing, teethTop, teethWidth, teethHeight);
}

// calculation functions

function startCalculation(start, islands, end) {
  const routes = generateRoutes(start, islands, end);
  [bestRoute, bestDistance] = crunch(routes);
  console.log(bestRoute, bestDistance);
  console.log(
    start != end && (start != -1 || end != -1) ? 'order needed' : 'can reverse'
  );
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
  return [minRoute, minDistance];
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

function getCanvasSize() {
  return Math.min(main.clientWidth, main.clientHeight) - 10;
}

function normalizeCoords(x, y) {
  // 26 grid squares in the map, each is 10 units across
  return [x, y].map(coord => (coord * height) / 260);
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (i in a) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
