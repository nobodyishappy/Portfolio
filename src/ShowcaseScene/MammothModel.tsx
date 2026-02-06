import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { MathUtils, Vector3 } from "three";

let mammothStartPos = new Vector3(18.5, 0, 44.5);
let mammothStartRot = 10;

function LoadMammothModel() {
    const { scene, animations } = useGLTF('./models/ShowcaseScene/Mammoth.glb');
    const { actions } = useAnimations(animations, scene);

    const model = scene;
    model.position.set(mammothStartPos.x, 0, mammothStartPos.z);
    model.rotation.y = MathUtils.degToRad(mammothStartRot);

    useEffect(() => {
        const action = actions['MammothIdle'];

        if(action) {
            action.play();
        }
    }, []);

    return (
        <primitive object={model} />
    )
}

export default LoadMammothModel;