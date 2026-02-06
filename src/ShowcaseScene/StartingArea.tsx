import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";


function LoadObelisk() {
    const glb = useLoader(GLTFLoader, './models/ShowcaseScene/Obelisk.glb');

    return (
        <primitive object={glb.scene} />
    )
}

function LoadCentralMonument() {
    const glb = useLoader(GLTFLoader, './models/ShowcaseScene/Monument.glb');

    return (
        <primitive object={glb.scene} />
    )
}

function LoadStartingArea() {
    return (
        <>
            <LoadObelisk />
            <LoadCentralMonument />
        </>
    )
}

export default LoadStartingArea;