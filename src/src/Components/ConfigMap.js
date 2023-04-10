import Graph from "react-graph-vis";
import { useState, useMemo, useEffect } from "react";
import { v4 as uuid } from 'uuid';


const ConfigMap = ({adjacencyMatrix, names, solution, isDirected}) => {

    const [windowWidth, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const updateWidth = () => {
          setWidth(window.innerWidth)
        }

        window.addEventListener('resize', updateWidth);
        
        return(() => {
            window.removeEventListener('resize', updateWidth);
        })

      }, [windowWidth])

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
                isSolutionPart = (firstSolutionIndex !== -1) && (firstSolutionIndex < solution.length);
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
            for (var j = 0; j < nodeCount; j++)
            {
                if (i === j) continue;
                if (!isDirected && j < i) continue;


                if (adjacencyMatrix[i][j].toUpperCase() !== "X")
                {
                    const tempEdge = {
                        from: i,
                        to: j,
                        arrows: {
                            to: isDirected,
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
                        smooth: {enabled: isDirected? true : false,  type: 'curvedCW', roundness: 0.2}
                    }

                    var secondSolutionIndex = -1;
                    var isSolutionPartFull = false;
                    
                    if (solution)
                    {
                        secondSolutionIndex = solution.indexOf(j);

                        isSolutionPartFull = isSolutionPart && (secondSolutionIndex !== -1 && secondSolutionIndex < solution.length);
                    }


                    if (isSolutionPartFull)
                    {
                        if (solution[firstSolutionIndex+1] === j)
                        {
                            tempEdge.arrows.to = true;
                            tempEdge.color.color = "#77dd76";
                        }

                        else if (!isDirected && solution[secondSolutionIndex+1] === i)
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
    }, [adjacencyMatrix, nodeCount, names, solution, windowWidth, isDirected])

    const graphKey = useMemo(uuid, [graph, adjacencyMatrix, solution])

    const options = {
        layout: {
            randomSeed: 1,
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
                style={{
                    backgroundColor: '#fafafa',
                    overflow: 'hidden',
                    margin: 'auto',
                    width: '100%',
                    borderRadius: '10px',
                }}
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