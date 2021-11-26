const distances = new Map();
fetch('./data/distances.json')
  .then(res => res.json())
  .then(data => {
    data.distances.forEach(islandA => {
      const temp = new Map();
      islandA.islands.forEach(islandB => {
        temp.set(islandB.b, islandB.distance);
      });
      distances.set(islandA.a, temp);
    });
  })
  .catch(error => console.log(error));

let outposts;
onmessage = message => {
  if (message.data.outposts) {
    outposts = message.data.outposts;
  } else {
    startCalculation(
      message.data.start,
      message.data.islands,
      message.data.end,
      message.data.startAtOutpost,
      message.data.endAtOutpost
    );
  }
};

function startCalculation(start, islands, end, startAtOutpost, endAtOutpost) {
  const routes = generateRoutes(
    start,
    islands,
    end,
    startAtOutpost,
    endAtOutpost
  );
  [bestRoute, bestDistance] = crunch(routes);
  postMessage({
    route: bestRoute,
    distance: bestDistance,
    reversible: start != end && (start != -1 || end != -1),
  });
}

function generateRoutes(start, islands, end, startAtOutpost, endAtOutpost) {
  if (start != -1) {
    islands.delete(start);
  }
  if (end != -1) {
    islands.delete(end);
  }
  let routes = permutations(Array.from(islands).map(Number));
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
  if (startAtOutpost) {
    routes = routes
      .map(route => outposts.map(outpost => [outpost.id, ...route]))
      .flat();
  }
  if (endAtOutpost) {
    routes = routes
      .map(route => outposts.map(outpost => [...route, outpost.id]))
      .flat();
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

function getDistance(a, b) {
  return distances.get(a).get(b);
}

function permutations(arr) {
  if (!arr.length) {
    return [];
  }

  if (arr.length === 1) {
    return [arr];
  }

  const output = [];
  const partialPermutations = permutations(arr.slice(1));
  const first = arr[0];

  for (let i = 0, len = partialPermutations.length; i < len; i++) {
    const partial = partialPermutations[i];

    for (let j = 0, len2 = partial.length; j <= len2; j++) {
      const start = partial.slice(0, j);
      const end = partial.slice(j);
      const merged = start.concat(first, end);

      output.push(merged);
    }
  }

  return output;
}
