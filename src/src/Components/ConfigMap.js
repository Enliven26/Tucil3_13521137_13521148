import Graph from "react-graph-vis";
import { useState, useMemo, useEffect } from "react";
import { v4 as uuid } from 'uuid';


const ConfigMap = ({adjacencyMatrix, configFile, solution}) => {

    const nodeCount = adjacencyMatrix.length;

    const [graph, setGraph] = useState({
        nodes: [],
        edges: []
    })

    const font = {
        color: "#333",
        face: "Quicksand",
    }

    useEffect(() => {

        const tempGraph = {
            nodes: [],
            edges: []
        }

        for (var i = 0; i < nodeCount; i++)
        {
            tempGraph.nodes.push({
                id: i,
                label: "Node " + (i+1),
                color: {
                    background: 'white',
                    border: "#f1356d",
                    highlight: "#f1356d"
                },
                font: font,
                labelHighlightBold: false,
            })

            for (var j = i+1; j < nodeCount; j++)
            {
                if (adjacencyMatrix[i][j].toUpperCase() !== "X")
                {
                    tempGraph.edges.push({
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
                    })
                }
            }

            setGraph(tempGraph)
        }
    }, [configFile, adjacencyMatrix, nodeCount])

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