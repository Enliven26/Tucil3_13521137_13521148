import Graph from "react-graph-vis";
import { useState, useMemo, useEffect } from "react";
import { v4 as uuid } from 'uuid';


const ConfigMap = ({adjacencyMatrix, configFile, names, solution}) => {

    const nodeCount = adjacencyMatrix.length;

    const [graph, setGraph] = useState({
        nodes: [],
        edges: []
    })

    useEffect(() => {

        const font = {
            color: "#333",
            face: "Quicksand",
        }

        const tempGraph = {
            nodes: [],
            edges: []
        }

        for (var i = 0; i < nodeCount; i++)
        {
            var firstSolutionIndex = -1;
            var isSolutionPart = false;

            if (solution)
            {
                firstSolutionIndex = solution.indexOf(i);
                isSolutionPart = (firstSolutionIndex !== -1) && (firstSolutionIndex < solution.length - 1);
            }

            tempGraph.nodes.push({
                id: i,
                label: names? names[i] : "Node " + (i+1),
                color: {
                    background: 'white',
                    border: "#f1356d",
                    highlight: "#f1356d"
                },
                font: font,
                labelHighlightBold: false,
                shape: "circle",
            })
            for (var j = i+1; j < nodeCount; j++)
            {
                if (adjacencyMatrix[i][j].toUpperCase() !== "X")
                {
                    const tempEdge = {
                        from: i,
                        to: j,
                        arrows: {
                            to: false,
                        },
                        label: adjacencyMatrix[i][j],
                        physics: false,
                        color: {
                            color: "#f1356d",
                            highlight: "#f1356d"
                        },
                        font: font,
                        labelHighlightBold: false,
                        selectionWidth: 0,
                    }

                    var secondSolutionIndex = -1;
                    
                    if (solution)
                    {
                        secondSolutionIndex = solution.indexOf(j);

                        isSolutionPart = isSolutionPart || (secondSolutionIndex !== -1 && secondSolutionIndex < solution.length);
                    }


                    if (isSolutionPart)
                    {
                        if (solution[firstSolutionIndex+1] === j)
                        {
                            tempEdge.arrows.to = true;
                            tempEdge.color.color = "#77dd76";
                        }

                        else if (solution[secondSolutionIndex+1] === i)
                        {
                            tempEdge.arrows.from = true;
                            tempEdge.color.color = "#77dd76";
                        }   
                    }
                    tempGraph.edges.push(tempEdge)
                }
            }

            setGraph(tempGraph)
        }
    }, [configFile, adjacencyMatrix, nodeCount, names, solution])

    const graphKey = useMemo(uuid, [configFile, graph, adjacencyMatrix, solution])

    const options = {
        layout: {

        },
        edges: {
            color: "#000000",

        },
        height: "400px"
    };

    const events = {
        select: function(event) {
            var { nodes, edges } = event;
        }
    };

    return ( 
        <div className="display">
            <Graph
                key={graphKey}
                graph={graph}
                options={options}
                events={events}
                getNetwork={network => {
                    //  if you want access to vis.js network api you can set the state in a parent component using this property
                }}
            />

            <span className="note">Drag and re-arrange the nodes for more accurate interpretation</span>
        </div>
     );
}
 
export default ConfigMap;