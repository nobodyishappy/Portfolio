import "./Scene.css";
// import { Pathfinding, PathfindingHelper } from "three-pathfinding";
import { Canvas } from "@react-three/fiber";

function Scene() {
    return (
        <div id="canvas-container">
            <Canvas>
                <mesh>
                    <boxGeometry/>
                    <meshStandardMaterial/>
                </mesh>
                <ambientLight intensity={0.1}/>
            </Canvas>
        </div>
    )
}

export default Scene