import { useState, useRef, useEffect } from "react";
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

    // handlers
    const handleConfigFileInput = async (event) => {

        event.preventDefault();

        if (event.target.files[0] !== undefined)
        {
            setLoading(true);

            var res = await readFile(event.target.files[0], isConfigFileValid)

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
            var res = await readFile(event.target.files[0], isNameFileValid)

            if (res.success) {
                setNames(res.data)
            }

            else {
                showPopUp({title:"File Configuration Error", message:res.msg})
            }
            setLoading(false);
        }
    }

    const handleSolve = async (event) => {
        event.preventDefault();
        setSolution(UniformCostSearch(adjMatrix, sourceNode, targetNode));
        
    }

    const isConfigFileValid = (lines) => {
        if (!lines || lines.length === 0 || lines[0].length === 0) return {"success": false, "msg": "Configuration file is empty!"}

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
                if (matrix[j][k] !== matrix[k][j])
                    return {"success": false, 
                        "msg": "Adjancency matrix should be symetric!"}

                if (j === k && parseInt(matrix[j][k]) !== 0)
                    return {"success": false, 
                        "msg": "Value in diagonal should be zero!"}
            }
        }

        return {"success": true, "msg": "Configuration File is valid", "data": matrix};
    }

    const isNameFileValid = (lines) => {
        
        if (!lines || lines.length === 0 || lines[0].length === 0) return {"success": false, "msg": "Name file is empty!"}


        const row = lines.length
        const nodeCount = adjMatrix.length

        if (row !== nodeCount) return {"success": false, "msg": `Name file doesn't contain ${nodeCount} names for all nodes!`}
        for (var i = 0; i < row; i++) {
            if (lines[i].length > 20) return {"success": false, "msg": `Name should be 20 characters maximum!`}
        }

        return {"success": true, "msg": "Name File is valid", "data": lines};
    }
    
    const readFile = async (file, validationFunction) => {
        
        var lines = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = async (e) => { 
                var res = (e.target.result).split(/\r?\n/);
                resolve(res);
            };

            reader.readAsText(file)
        })

        return validationFunction(lines)

    }

    return ( 
        <div className='program'>
            <h2>File App</h2>

            {configFile && adjMatrix && <ConfigMap adjacencyMatrix={adjMatrix} names={names} solution={solution}/>}

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
                {adjMatrix && <div>
                    <label>Source Node :</label>
                    <select value={sourceNode} onChange={(e) => {e.preventDefault(); setSourceNode(e.target.value)}}>
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
                    <select value={targetNode} onChange={(e) => {e.preventDefault(); setTargetNode(e.target.value)}}>
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
                    <select value={algorithm} onChange={(e) => {e.preventDefault(); setAlgorithm(e.target.value)}}>
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