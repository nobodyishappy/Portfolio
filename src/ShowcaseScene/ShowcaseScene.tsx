import "./ShowcaseScene.css";
import { Pathfinding } from "three-pathfinding";
import { Canvas, useFrame, useLoader, useThree, type Camera, type ThreeEvent } from "@react-three/fiber";
import { useState, type Dispatch, type MouseEvent, type SetStateAction } from "react";
import { Clock, MathUtils, Vector3} from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import LoadStartingArea from "./StartingArea";
import LoadCavemanModel from "./CavemanModel";
import LoadMammothModel from "./MammothModel";

let modelsList = [
    "./models/ShowcaseScene/Land.glb",
    "./models/ShowcaseScene/OogaBoogaShowcase.glb",
    "./models/ShowcaseScene/HumanCastleShowcase.glb",
    "./models/ShowcaseScene/ElfForestShowcase.glb",
    "./models/ShowcaseScene/DwarfMountainShowcase.glb",
    "./models/ShowcaseScene/OrcDesertShowcase.glb",
    "./models/ShowcaseScene/DemonDesolateShowcase.glb"
]

// Character Movement
let playerCamera: Camera;
const clock = new Clock();
const startPos = new Vector3(0, 0, 10);
let currentPos = startPos.clone();
let targetPos = startPos.clone();
let isMoving = false;
let currentIndex = 0;
let movSpeed = 10;

// Camera Panning
const cameraForward = 0.2;
let cameraOffset = new Vector3(0,1.5,-cameraForward);
let currentPlayerLook = cameraOffset.clone();
let cameraTargetPos = currentPos.clone();
let currentCameraOffset = currentPos.clone().add(cameraOffset);
const startRot = 270;
let currentYaw = startRot;
const startPitch = 0;
let currentPitch = startPitch;
let pitchRange = [-45, 45];
const degToRad = Math.PI / 180;

// Screen Interact
let interactTimer: number | undefined;
let prevInteractX = 0;
let prevInteractY = 0;
let isInteractDown = false;
let isInteractMoving = false;
let isInteractRotating = false;
let characterCanMove = true;

function LoadModels() {
    return (
        modelsList.map((model, index) => {
            const glb = useLoader(GLTFLoader, model);
            return (
                <primitive key={index} object={glb.scene} />
            );
        })
    )
}

function CameraMovement() {
    const { camera } = useThree();
    playerCamera = camera;
    RotateCamera(0, 0);

    return null;
}

function RotateCamera(yawMove:number, pitchMove:number) {
    currentYaw = normalizeAngle(currentYaw + (yawMove * 0.1));
    currentPitch = MathUtils.clamp(currentPitch + (pitchMove * 0.1), pitchRange[0], pitchRange[1]);
    
    // Offset to front of robot
    cameraOffset.set(cameraForward * -Math.cos(currentYaw * degToRad), cameraOffset.y, cameraForward * Math.sin(currentYaw * degToRad));
    currentCameraOffset.copy(currentPos).add(cameraOffset);
    playerCamera.position.copy(currentCameraOffset);

    currentPlayerLook.set(Math.cos(currentPitch * degToRad)*-Math.cos(currentYaw * degToRad), 
                        Math.sin(currentPitch * degToRad), 
                        Math.cos(currentPitch * degToRad)*Math.sin(currentYaw * degToRad))
                        .add(cameraOffset);
    cameraTargetPos = currentPos.clone().add(currentPlayerLook);
    playerCamera.lookAt(cameraTargetPos);
}

function normalizeAngle(angle:number) {
    return (angle % 360 + 360) % 360;
}

function MoveCharacter() {
    const glb = useLoader(GLTFLoader, "./models/ShowcaseScene/NavMesh.glb");

    const model = glb.scene.children[0];
    model.visible = false;

    const direction = new Vector3();
    const temp = new Vector3();

    const pathfinding = new Pathfinding();
    const ZONE = 'level1';
    const delta = clock.getDelta();
    let emptyPath:Vector3[] = [];
    const [path, setPath] = useState(emptyPath);

    //@ts-ignore
    pathfinding.setZoneData(ZONE, Pathfinding.createZone(model.geometry));

    useFrame(() => {
        if (isMoving) {
            const distanceThisFrame = movSpeed * delta;
            direction.subVectors(targetPos, currentPos);
            const distanceToNext = direction.length();

            if (distanceToNext <= distanceThisFrame) {
                currentPos.copy(targetPos);
                currentIndex++;

                if (currentIndex <= path.length - 1) {
                    targetPos.copy(path[currentIndex]);

                    direction.subVectors(targetPos, currentPos);
                } else {
                    isMoving = false;
                    currentIndex = 0;
                }
            } else {
                direction.normalize();
                temp.copy(direction).multiplyScalar(distanceThisFrame);
                currentPos.add(temp);
            }

            cameraTargetPos.copy(currentPos).add(currentPlayerLook);
            playerCamera.position.copy(currentPos).add(cameraOffset);
            playerCamera.lookAt(cameraTargetPos);

            currentCameraOffset = playerCamera.position.clone();
        }
    })

    return (
        <primitive 
            object={glb.scene} 
            onClick={(e:ThreeEvent<MouseEvent>) => {
                InteractNavMesh(e, pathfinding, setPath, ZONE);
            }}
        />
    );
}

function InteractNavMesh(e:ThreeEvent<MouseEvent>, pathfinding:Pathfinding, setPath:Dispatch<SetStateAction<Vector3[]>>, ZONE:string) {
    if (characterCanMove){
        let point = e.intersections[0].point;
        
        const groupID = pathfinding.getGroup(ZONE, currentPos);
        const closest = pathfinding.getClosestNode(currentPos, ZONE, groupID);
        let path = pathfinding.findPath(closest.centroid, point, ZONE, groupID);

        if (path) {
            setPath(path);
            isMoving = true;
            targetPos = path[0];
            currentIndex = 0;
        } else {
            isMoving = false;
        }
        
    }
}


function ShowcaseScene() {
    return (
        <div id="canvas-container"
            // onClick={(e) => {
            //     console.log(e.nativeEvent.offsetX);
            //     console.log(e.nativeEvent.offsetY);
            // }}
            onMouseDown={(e) => {
                StartMouseInteract(e);
            }}
            onMouseMove={(e) => {
                MoveMouseInteract(e);
            }}
            onMouseLeave={() => {
                EndMouseInteract();
            }}
            onMouseUp={() => {
                EndMouseInteract();
            }}
        >
            <Canvas>
                <CameraMovement />
                <LoadModels />
                <LoadStartingArea />
                <LoadCavemanModel />
                <LoadMammothModel />
                <MoveCharacter />
                <ambientLight intensity={1.5}/>
                <directionalLight intensity={1} castShadow = {true} />
            </Canvas>
        </div>
    )
}

function StartMouseInteract(e:MouseEvent) {
    if(!isInteractDown) {
        isInteractDown = true;
        characterCanMove = true;
        interactTimer = setTimeout(() => {
            prevInteractX = e.nativeEvent.offsetX;
            prevInteractY = e.nativeEvent.offsetY;
            isInteractMoving = true;
        }, 100)
    }
}

function MoveMouseInteract(e:MouseEvent) {
    if(isInteractMoving) {
        characterCanMove = false;
        if (!isInteractRotating) {
            isInteractRotating = true;
            RotateCamera(e.nativeEvent.offsetX - prevInteractX, e.nativeEvent.offsetY - prevInteractY);
            prevInteractX = e.nativeEvent.offsetX;
            prevInteractY = e.nativeEvent.offsetY;
            setTimeout(() => {
                isInteractRotating = false;
            }, 5)
        }
    }
}

function EndMouseInteract() {
    if (isInteractDown) {
        clearTimeout(interactTimer);
        if (isInteractMoving) {
            isInteractMoving = false;
        } 
        isInteractDown = false;
    }
}

export default ShowcaseScene;