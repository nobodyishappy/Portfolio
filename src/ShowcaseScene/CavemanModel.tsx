import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { MathUtils, Vector3 } from "three";

const cavemanStartPos = new Vector3(8.5, 0, 37);
const cavemanStartRot = 290;

function LoadCavemanModel() {
    const { scene, animations } = useGLTF('./models/ShowcaseScene/Caveman.glb');
    const { actions } = useAnimations(animations, scene);

    const model = scene;
    model.position.set(cavemanStartPos.x, 0, cavemanStartPos.z);
    model.rotation.y = MathUtils.degToRad(cavemanStartRot);

    model.traverse((child) => {
        if(child.isObject3D) {
            if(child.name.includes('Boulder') || child.name.includes('Axe') || child.name.includes('Spear')) {
                child.visible = false;
            }
        }
    })

    useEffect(() => {
        const action = actions['Caveman_Attack_Club'];
        if (action) {
            action.play();
            action.timeScale = 0.5;
        }
    }, []);

    return (
        <primitive object={model} />
    )
}

export default LoadCavemanModel;