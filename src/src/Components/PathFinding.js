import {PriorityQueue} from './PriorityQueue'

const UniformCostSearch = (adjMatrix, source, dest) => {
    source = parseInt(source);
    dest = parseInt(dest);

    var pq = new PriorityQueue();
    var vis = new Array(adjMatrix.length).fill(false);
    var prev = new Array(adjMatrix.length).fill(-1);

    // Insert source node
    pq.push([0, source, -1]);

    while (!pq.isEmpty()) {
        var top = pq.top();
        pq.pop();
        if (vis[top[1]]) continue;
        vis[top[1]] = true;
        prev[top[1]] = top[2];
        
        if (top[1] == dest) {
            break;
        }
        
        for (var i = 0; i < adjMatrix[top[1]].length; i++) {
            if (vis[i] || adjMatrix[top[1]][i] == 'x') continue;
            pq.push([top[0] + parseInt(adjMatrix[top[1]][i]), i, top[1]]);
        }
    }

    if (prev[dest] == -1) return (null);

    // Backtrack
    var path = new Array();
    var pos = dest;
    while(pos != -1) {
        path.push(pos);
        pos = prev[pos];
    }
    path.reverse();

    console.log(path);
    return (path);
}
export {UniformCostSearch};