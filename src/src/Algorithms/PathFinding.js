import {PriorityQueue} from './PriorityQueue'

const UniformCostSearch = (adjMatrix, source, dest) => {
    source = parseInt(source);
    dest = parseInt(dest);

    var pq = new PriorityQueue();
    var vis = new Array(adjMatrix.length).fill(false);
    var prev = new Array(adjMatrix.length).fill(-1);

    // Insert source node
    // Tuple definition: [f(n), n, previous_node]
    pq.push([0, source, -2]);

    while (!pq.isEmpty()) {
        var top = pq.top();
        pq.pop();
        if (vis[top[1]]) continue;
        vis[top[1]] = true;
        prev[top[1]] = top[2];
        
        if (top[1] === dest) {
            break;
        }
        
        for (var i = 0; i < adjMatrix[top[1]].length; i++) {
            if (vis[i] || adjMatrix[top[1]][i].toUpperCase() === 'X') continue;
            pq.push([top[0] + parseInt(adjMatrix[top[1]][i]), i, top[1]]);
        }
    }

    if (prev[dest] === -1) return [];

    // Backtrack
    var path = [];
    var pos = dest;
    while(pos >= 0) {
        path.push(pos);
        pos = prev[pos];
    }
    path.reverse();

    return (path);
}


/**
 * 
 * @param {*} adjMatrix string[n][n]; adjMatrix[i][j] === 'x' means no path from node i to j.
 * @param {*} source int 0~n-1
 * @param {*} dest int 0~n-1
 * @param {*} distOption dict; options are 'coordinates'(same measurement unit as adjMatrix) or 'distanceToDest'
 */
const AyStar = (adjMatrix, source, dest, distOption) => {
    if (distOption.length > 1) {
        throw Error("Cannot use more than one option!");
    }
    source = parseInt(source);
    dest = parseInt(dest);

    var distanceToDest;
    if (distOption['coordinates']) {
        // create distanceToDest
        distanceToDest = [];
        for (var i = 0; i < distOption['coordinates']; i++) {
            distanceToDest = EuclideanDist(distOption['coordinates'][i], distOption['coordinates'][dest]);
        }
    }
    else if (distOption['distanceToDest']) {
        // copy distanceToDest
        distanceToDest = [...distOption['distanceToDest']];
    }
    else {
        throw Error("Fill distOption with either 'coordinates' or 'distanceToDest'");
    }

    // calculate distance with A*
    var pq = new PriorityQueue();
    var vis = new Array(adjMatrix.length).fill(false);
    var prev = new Array(adjMatrix.length).fill(-1);

    // Insert source node
    // Tuple definition: [f(n), n, previous_node, g(n)]
    pq.push([distanceToDest[source], source, -2, 0]);

    while (!pq.isEmpty()) {
        var top = pq.top();
        pq.pop();
        if (vis[top[1]]) continue;
        vis[top[1]] = true;
        prev[top[1]] = top[2];
        
        if (top[1] === dest) {
            break;
        }
        
        for (var i = 0; i < adjMatrix[top[1]].length; i++) {
            if (vis[i] || adjMatrix[top[1]][i].toUpperCase() === 'X') continue;
            pq.push([top[3] + parseInt(adjMatrix[top[1]][i]) + distanceToDest[i], 
                    i, 
                    top[1], 
                    top[3] + parseInt(adjMatrix[top[1]][i])]);
        }
    }

    if (prev[dest] === -1) return [];

    // Backtrack
    var path = [];
    var pos = dest;
    while(pos >= 0) {
        path.push(pos);
        pos = prev[pos];
    }
    path.reverse();

    return (path);

}

const EuclideanDist = (point1, point2) => {
    if (point1.length !== point2.length) {
        throw Error("the arguments' dimension is different");
    }
    var val = 0;
    for (var i = 0; i < point1.length; i++) {
        val += (point1[i] - point2[i]) ** 2;
    }
    return val ** 0.5;
}

export {UniformCostSearch, AyStar};