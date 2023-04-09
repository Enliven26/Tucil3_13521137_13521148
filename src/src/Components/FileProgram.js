import { useState } from "react";
import ConfigMap from "./ConfigMap";
import { UniformCostSearch } from "../Algorithms/PathFinding";

const FileProgram = ({setLoading, showPopUp}) => {
    
    // program states
    const [sourceNode, setSourceNode] = useState(0);
    const [targetNode, setTargetNode] = useState(0);
    const [configFile, setConfigFile] = useState(null);
    const [adjMatrix, setMatrix] = useState(null);
    const [names, setNames] = useState(null);
    const [solution, setSolution] = useState(null);
    const [algorithm, setAlgorithm] = useState(0);
    const [isDirected, setDirected] = useState(false);

    // handlers
    const handleConfigFileInput = async (event) => {

        event.preventDefault();

        if (event.target.files[0] !== undefined)
        {
            setLoading(true);

            var res = await readFile({file: event.target.files[0], validationFunction: isConfigFileValid})

            if (res.success) {
                setSolution(null);
                setNames(null);
                setConfigFile(event.target.files[0]);
                setMatrix(res.data);
                setSourceNode(0);
                setTargetNode(0);
            }

            else {
                showPopUp({title:"File Configuration Error", message:res.msg})
            }

            setLoading(false);
        }
    }

    const handleNameFileInput = async (event) => {
        event.preventDefault();
        if (event.target.files[0] !== undefined)
        {
            setLoading(true);
            var res = await readFile({file: event.target.files[0], validationFunction: isNameFileValid})

            if (res.success) {
                setNames(res.data);
            }

            else {
                showPopUp({title:"File Configuration Error", message:res.msg});
            }
            setLoading(false);
        }
    }

    const handleSolve = async (event) => {
        event.preventDefault();
        if (algorithm === 0) {
            setSolution(UniformCostSearch(adjMatrix, sourceNode, targetNode));
        }
        else if (algorithm === 1) {
            setSolution([]);
        }
        
    }

    const handleGraphTypeChange = async (event) => {
        const value = parseInt(event.target.value);

        event.preventDefault(); 
        if (configFile)
        {
         
            const res = await readFile({file: configFile, validationFunction: isConfigFileValid, graphType: value});

            setLoading(false);

            if (!res.success)
            {
                showPopUp({title:"Graph Type Change Error", message:res.msg});
                return;
            }
        }

        setDirected(value? true : false);
    }

    const isConfigFileValid = ({lines, graphType}) => {
        if (!lines || lines.length === 0 || lines[0].length === 0) return {"success": false, "msg": "Configuration file is empty!"}

        if (graphType === undefined) {
            graphType = isDirected;
        }
        const matrix = lines.map((line) => line.split(/\s+/))
        const row = matrix.length
        const column = matrix[0].length

        for (var i = 0; i < row; i++) {

            const line = matrix[i]

            if (line.length !== column) 
                    return {"success": false, 
                        "msg": "Configuration file contains rows with different length!"}

            for (var j = 0; j < column; j++) {

                var stringValue = line[j]

                if (!(stringValue.toUpperCase() === "X") && !(/^\d+$/.test(stringValue))) 
                    return {"success": false, 
                        "msg": "Configuration file contains invalid character(s)!\nNumbers and X's (case-insensitive) are the only valid characters"}
            }
        }

        if (row !== column) 
            return {"success": false, 
                "msg": "Adjancency matrix must have the same rows and columns count!"}

        for (j = 0; j < row; j++)
        {
            for (var k = 0; k < column; k++)
            {
                if (!graphType && matrix[j][k] !== matrix[k][j])
                    return {"success": false, 
                        "msg": "Adjancency matrix for undirected graph should be symetric! (Change graph-type choice if it is intended)"}

                if (j === k && parseInt(matrix[j][k]) !== 0)
                    return {"success": false, 
                        "msg": "Value in diagonal should be zero!"}
            }
        }

        return {"success": true, "msg": "Configuration File is valid", "data": matrix};
    }

    const isNameFileValid = ({lines}) => {
        
        if (!lines || lines.length === 0 || lines[0].length === 0) return {"success": false, "msg": "Name file is empty!"}


        const row = lines.length
        const nodeCount = adjMatrix.length

        if (row !== nodeCount) return {"success": false, "msg": `Name file doesn't contain ${nodeCount} names for all nodes!`}
        for (var i = 0; i < row; i++) {
            if (lines[i].length > 20) return {"success": false, "msg": `Name should be 20 characters maximum!`}
        }

        return {"success": true, "msg": "Name File is valid", "data": lines};
    }

    const isCoordinateFileValid = (lines) => {

        return {"success": true, "msg": "Name File is valid", "data": lines};
    }
    
    const readFile = async ({file, validationFunction, graphType}) => {

        if (graphType === undefined) {
            graphType = isDirected;
        }

        var lines = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = async (e) => { 
                var res = (e.target.result).split(/\r?\n/);
                resolve(res);
            };

            reader.readAsText(file)
        })

        return validationFunction({lines: lines, graphType: graphType})

    }

    return ( 
        <div className='program'>
            <h2>File App</h2>

            {configFile && adjMatrix && <ConfigMap adjacencyMatrix={adjMatrix} names={names} solution={solution} isDirected={isDirected}/>}

            <form>
                <label className="inputFileLabel">
                    <span>Insert Adjacency Matrix</span>
                    <input
                        className="inputFile"
                        type="file"
                        accept=".txt"
                        onChange={(e) => handleConfigFileInput(e)}
                        onClick={(e) => e.target.value = null}
                    ></input>
                </label>

                {adjMatrix &&
                    <label className="inputFileLabel">
                        <span>Insert Node Name Configuration</span>
                        <input
                            className="inputFile"
                            type="file"
                            accept=".txt"
                            onChange={(e) => handleNameFileInput(e)}
                            onClick={(e) => e.target.value = null}
                        ></input>
                    </label>
                }

                <label>Graph Type :</label>
                    <select value={isDirected? 1 : 0} onChange={handleGraphTypeChange}>

                        <option value={0}>
                            Undirected Graph
                        </option>

                        <option value={1}>
                            Directed Graph
                        </option>
                        
                    </select>

                {adjMatrix && <div>
                    <label>Source Node :</label>
                    <select value={sourceNode} onChange={(e) => {e.preventDefault(); setSourceNode(parseInt(e.target.value))}}>
                        {
                            adjMatrix.map((_, index) => {
                                return(
                                    <option key={"source" + index} value={index}>
                                        {names? names[index] : "Node " + (index+1)}
                                    </option>
                                )
                            })
                        }
                    </select>

                    <label>Target Node :</label>
                    <select value={targetNode} onChange={(e) => {e.preventDefault(); setTargetNode(parseInt(e.target.value))}}>
                        {
                            adjMatrix.map((_, index) => {
                                return(
                                    <option key={"target" + index} value={index}>
                                        {names? names[index] : "Node " + (index+1)}
                                    </option>
                                )
                            })
                        }
                    </select>

                    <label>Algorithm :</label>
                    <select value={algorithm} onChange={(e) => {e.preventDefault(); setAlgorithm(parseInt(e.target.value))}}>
                            <option value={0}>
                                Uniform Cost Search
                            </option>
                            <option value={1}>
                                A Star
                            </option>
                    </select>

                    <button type="button" className="solve-button" onClick={handleSolve}>Solve</button>
                </div>}

            </form>
        </div>
     );
}
 
export default FileProgram;