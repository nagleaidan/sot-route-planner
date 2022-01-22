// variables

let islands,
  outposts,
  islandMap,
  bestRoute,
  bestDistance,
  oldBestRoute,
  closestIsland,
  compassRose;
const selectedIslands = new Set();
let startAtOutpost = false,
  endAtOutpost = false;

// html elements

const main = document.getElementsByTagName('main')[0],
  islandName = document.getElementById('island-name'),
  goldenSpan = document.getElementById('golden');
(startSelect = document.getElementById('start')),
  (startOutpostButton = document.getElementById('start-outpost')),
  (islandSelect = document.getElementById('island')),
  (islandButton = document.getElementById('add-island')),
  (islandList = document.getElementById('island-list')),
  (endSelect = document.getElementById('end')),
  (endOutpostButton = document.getElementById('end-outpost')),
  (submitButton = document.getElementById('submit'));

// colors

const BLUE = '#0096FF';
const GREEN = '#26532B';
const BROWN = '#964B00';

// gold rush start times, in utc hours
const GOLD_RUSH_START = [1, 17];

// WebWorker for background route calculation

const worker = new Worker('calculations.js');
worker.onmessage = message => (bestRoute = message.data.route);

// p5.js functions

function preload() {
  setGoldenTimes();
  loadJSON('data/islands.json', res => {
    islands = sortAlphabetically(res.islands, 'name');
    outposts = islands.filter(island => island.type === 'Outpost');
    worker.postMessage({ outposts: outposts });
    islandMap = new Map(islands.map(island => [island.id, island]));
    setSelectOptions();
    return res;
  });
  compassRose = loadImage('assets/compassRose.svg');
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
      case 'Reaper':
        heart(x, y, size * 1.5);
        break;
      default:
        console.error('island data is fucked', island);
        break;
    }
  });
  image(compassRose, 0, (height * 7) / 10, height / 5, height / 5);
}

function windowResized() {
  const size = getCanvasSize();
  resizeCanvas(size, size);
}

function mouseMoved() {
  if (mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) {
    const distancesFromMouse = new Map(
      islands?.map(island => [
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

// dom functions

function setGoldenTimes() {
  const timeString = `${utcHourToLocalTime(
    GOLD_RUSH_START[0]
  )} - ${utcHourToLocalTime(GOLD_RUSH_START[0] + 1)} and ${utcHourToLocalTime(
    GOLD_RUSH_START[1]
  )} - ${utcHourToLocalTime(GOLD_RUSH_START[1] + 1)} `;
  goldenSpan.textContent = timeString;
}

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

function startAnyOutpost() {
  if (startAtOutpost) {
    startAtOutpost = false;
    startOutpostButton.classList.remove('active');
    startSelect.disabled = false;
  } else {
    startAtOutpost = true;
    startOutpostButton.classList.add('active');
    startSelect.value = -1;
    startSelect.disabled = true;
  }
}
function endAnyOutpost() {
  if (endAtOutpost) {
    endAtOutpost = false;
    endOutpostButton.classList.remove('active');
    endSelect.disabled = false;
  } else {
    endAtOutpost = true;
    endOutpostButton.classList.add('active');
    endSelect.value = -1;
    endSelect.disabled = true;
  }
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
  worker.postMessage({
    start: start,
    islands: islands,
    end: end,
    startAtOutpost: startAtOutpost,
    endAtOutpost: endAtOutpost,
  });
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

function heart(x, y, size) {
  noStroke();
  fill('red');
  beginShape();
  vertex(x, y);
  bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  endShape(CLOSE);
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

// helper functions
function sortAlphabetically(array, property) {
  return array.sort((a, b) => a[property].localeCompare(b[property]));
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

function utcHourToLocalTime(hour) {
  return new Date(Date.UTC(0, 0, 0, hour)).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
