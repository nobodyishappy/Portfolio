import { useState, type Dispatch, type ReactElement, type SetStateAction } from 'react';
import './Desktop.css'
import Scene from './Scene/Scene';

interface IconData {
  id: number;
  image: string;
  name: string;
  element: ReactElement;
  active: boolean;
  xValue: number;
  yValue: number;
  fullScreen: boolean;
  height: string;
  width: string;
  zIndex: number;
}

const emptyIcon = {
  id: 0, 
  image: 'placeholder.png', 
  name: 'empty', 
  element: <div>empty</div>, 
  active: false, 
  xValue: 0, 
  yValue: 0, 
  fullScreen: true,
  height: '100%',
  width: '100%',
  zIndex: 0,
}

const workspaceIcons: IconData[] = [
  { 
    id: 1, 
    image: '.png', 
    name: 'Test 1', 
    element: Scene(), 
    active: false, 
    xValue: 0, 
    yValue: 0, 
    fullScreen: true,
    height: '100%',
    width: '100%',
    zIndex: 0,
  },
  { 
    id: 2, 
    image: '.png', 
    name: 'Test 2', 
    element: <div>Test</div>, 
    active: false, 
    xValue: 0, 
    yValue: 0, 
    fullScreen: true,
    height: '100%',
    width: '100%',
    zIndex: 0,
  },
];

const DesktopState = {
  isDraggingWindow: false,
  prevMousePos: {x: 0, y:0},
  draggedWindow: emptyIcon,
}

function WorkspaceIcons(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>) {
  return (
    <div id="workspace-icons">
      {workspaceIcons.map((icon: IconData) => (
        <div key={icon.id} onClick={
          () => {
            let tempActive: IconData[] = [...activeWindows];
            if (!activeWindows.includes(icon)) {
              icon.zIndex = activeWindows.length + 1;
              icon.active = true;
              tempActive.push(icon);
            } else {
              tempActive.map(
                element => {
                  if (element.id == icon.id) {
                    icon.zIndex = activeWindows.length;
                    element.active = true;
                  } else if (element.zIndex >= icon.zIndex) {
                    element.zIndex--;
                  }
                }
              )
            }

            setActiveWindows(tempActive);
          }
        }>
          <div className='icon-box'>
            {icon.image}
          </div>
          <div className='icon-name'>
            {icon.name}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskbarManager(activeWindows : IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>) {
  return (
    <div id="taskbar">
      {activeWindows.map((icon: IconData) => (
        <div className='icon-box' key={icon.id} onClick={
          () => {
            setActiveWindows(
              activeWindows.map(element => {
                if (element.id == icon.id) {
                  if (element.active && element.zIndex == activeWindows.length) {
                    element.active = false;
                  } else {
                    element.active = true;
                    element.zIndex = activeWindows.length;
                  }
                } else if (element.zIndex >= icon.zIndex) {
                  element.zIndex--;
                }
                return element
              }
            ));
          }
        }>
          {icon.id}
        </div>
      ))}
    </div>
  );
}

function WindowManager(activeWindows: IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>) {
  return (
    <>
      {activeWindows.map((icon: IconData) => (
        <div className="window-box" key={icon.id}
          style={{
            display:icon.active?'block':'none',
            height:icon.height,
            width:icon.width,
            left:icon.xValue + "px",
            top:icon.yValue + "px",
            zIndex:icon.zIndex,
          }}
          onClick={
            () => {
              setActiveWindows(
                activeWindows.map(element => {
                  if (element.id == icon.id) {
                    element.zIndex = activeWindows.length;
                  } else if (element.zIndex >= icon.zIndex) {
                    element.zIndex--;
                  }
                  return element;
                })
              );
            }
          }
        >
          <div className="window-topbar" onMouseDown={
            (e) => {
              DesktopState.isDraggingWindow = true;
              DesktopState.draggedWindow = icon;
              DesktopState.prevMousePos.x = e.pageX;
              DesktopState.prevMousePos.y = e.pageY; 
            }
          }>
            <div className="topbar-button" onClick={
              (e) => {
                e.stopPropagation();
                setActiveWindows(
                  activeWindows.map(element => {
                    if (element.id == icon.id) {
                      element.active = false;
                    }
                    return element
                  }
                ));
              }
            }>
              _
            </div>
            <div className="topbar-button" onClick={
              (e) => {
                e.stopPropagation();
                setActiveWindows(
                  activeWindows.map(element => {
                    if (element.id == icon.id) {
                      if (element.fullScreen) {
                        element.height = (window.innerWidth * (9 / 32)) + "px";
                        element.width = (window.innerWidth * (1 / 2)) + "px";
                        element.xValue = 50;
                        element.yValue = 50;
                        element.fullScreen = false;
                      } else {
                        element.height = "100%";
                        element.width = "100%";
                        element.xValue = 0;
                        element.yValue = 0;
                        element.fullScreen = true;
                      }
                    }
                    return element
                  }
                ));
              }
            }>
              []
            </div>
            <div className="topbar-button" onClick={
              (e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveWindows(
                  activeWindows.filter(element => 
                    element.id !== icon.id
                  )
                );
              }
            }>
              X
            </div>
          </div>
          <div id="window-container">
            {icon.element}
          </div>
        </div>
      ))}
    </>
  );
}

function Desktop() {
  const emptyWindow : IconData[] = []
  const [activeWindows, setActiveWindows] = useState(emptyWindow);

  return (
    <div id="desktop"
      onMouseMove={(e) => {
        if(DesktopState.isDraggingWindow) {
          let movingWindow = DesktopState.draggedWindow;
          setActiveWindows(
            activeWindows.map((element) => {
              if(element.id == movingWindow.id) {
                element.xValue += e.pageX - DesktopState.prevMousePos.x;
                element.yValue += e.pageY - DesktopState.prevMousePos.y;
                DesktopState.prevMousePos.x = e.pageX;
                DesktopState.prevMousePos.y = e.pageY;
              }
              return element;
            })
          )
        }
      }}
      onMouseUp = {() => {
        if(DesktopState.isDraggingWindow) {
          DesktopState.isDraggingWindow = false;
        }
      }}
    >
      <div id="workspace">
        {WorkspaceIcons(activeWindows, setActiveWindows)}
        {WindowManager(activeWindows, setActiveWindows)}
      </div>
      {TaskbarManager(activeWindows, setActiveWindows)}
    </div>
  )
}

export default Desktop
