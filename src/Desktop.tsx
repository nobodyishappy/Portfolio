import { useState, type Dispatch, type MouseEvent, type ReactElement, type SetStateAction } from 'react';
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
  snapped: boolean;
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
  snapped: false,
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
    snapped: false,
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
    snapped: false,
    height: '100%',
    width: '100%',
    zIndex: 0,
  },
];

const DesktopState = {
  isDraggingWindow: false,
  prevMousePos: {x: 0, y: 0},
  draggedWindow: emptyIcon,
}

// Function to display all the desktop application icons.
function WorkspaceIcons(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>) {
  return (
    <div id="workspace-icons">
      {workspaceIcons.map((icon: IconData) => (
        <div key={icon.id} 
          onClick={
            () => WorkspaceIconClick(activeWindows, setActiveWindows, icon)
          }
        >
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

// Function for the actions to be done when the desktop icon is clicked.
function WorkspaceIconClick(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, icon:IconData) {
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

// Function to load the active windows on the taskbar.
function TaskbarManager(activeWindows : IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>) {
  return (
    <div id="taskbar">
      {activeWindows.map((icon: IconData) => (
        <div className='icon-box' key={icon.id} 
          onClick={() => {
            TaskBarIconClick(activeWindows, setActiveWindows, icon);
          }}
        >
          {icon.id}
        </div>
      ))}
    </div>
  );
}

// Function for the actions to be done when the taskbar icons are pressed.
function TaskBarIconClick(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, icon:IconData){
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

// Function to load the active windows in the workspace.
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
            () => WindowClick(activeWindows, setActiveWindows, icon)
          }
        >
          {WindowTopbar(activeWindows, setActiveWindows, icon)}
          <div id="window-container">
            {icon.element}
          </div>
        </div>
      ))}
    </>
  );
}

// Function to bring forward the clicked window to the front.
function WindowClick(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, icon:IconData) {
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

// Function to load the window top bar in the window box;
function WindowTopbar(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, icon:IconData) {
  return (
    <div className="window-topbar" onMouseDown={
      (e) => {
        let target = e.target as HTMLElement;
        if (target.className == 'window-topbar') {
          WindowTopbarMouseDown(icon, e);
        }
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
          WindowSizeButton(activeWindows, setActiveWindows, icon);
        }
      }>
        []
      </div>
      <div className="topbar-button" onClick={
        (e) => {
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
  )
}

// Function to resize the windows when they are snapped or fullscreen and start dragging when window topbar is clicked.
function WindowTopbarMouseDown(icon:IconData, e:MouseEvent) {
  DesktopState.isDraggingWindow = true;
  DesktopState.draggedWindow = icon;
  DesktopState.prevMousePos.x = e.pageX;
  DesktopState.prevMousePos.y = e.pageY;
}

// Function to resize the window when clicked on the size button.
function WindowSizeButton(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, icon:IconData) {
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
          element.snapped = false;
        }
      }
      return element
    }
  ));
}

// Function to load the entire desktop with the different components.
function Desktop() {
  const emptyWindow : IconData[] = []
  const [activeWindows, setActiveWindows] = useState(emptyWindow);

  return (
    <div id="desktop"
      onMouseMove={(e) => {
        DragMouseMove(activeWindows, setActiveWindows, e);
      }}
    >
      <div id="workspace"
        onMouseUp = {() => {
          if(DesktopState.isDraggingWindow) {
            DesktopState.isDraggingWindow = false;
          }
        }}
        onMouseLeave={(e) => {
          DragMouseLeave(activeWindows, setActiveWindows, e);
        }}
      >
        {WorkspaceIcons(activeWindows, setActiveWindows)}
        {WindowManager(activeWindows, setActiveWindows)}
      </div>
      {TaskbarManager(activeWindows, setActiveWindows)}
    </div>
  )
}

// Function for actions when window is being dragged or moved around.
function DragMouseMove(activeWindows: IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, e:MouseEvent) {
  if(DesktopState.isDraggingWindow) {
    let movingWindow = DesktopState.draggedWindow;
    if (movingWindow.snapped || movingWindow.fullScreen) {
      setActiveWindows(
        activeWindows.map(element => {
          if (element.id == movingWindow.id) {
            element.height = (window.innerWidth * (9 / 32)) + "px";
            element.width = (window.innerWidth * (1 / 2)) + "px";
            element.xValue = e.pageX - (window.innerWidth * (1 / 4));
            element.fullScreen = false;
            element.snapped = false;
          }
          return element
        }
      ));
    }
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
}

// Function for action when mouse leaves the workspace area.
// Leaving through the top will fullscreen, the sides will half and snap.
function DragMouseLeave(activeWindows: IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, e:MouseEvent) {
  if(DesktopState.isDraggingWindow) {
    let movingWindow = DesktopState.draggedWindow;
    setActiveWindows(
      activeWindows.map((element) => {
        if(element.id == movingWindow.id) {
          if (e.pageY <= 0) {
            element.xValue = 0;
            element.yValue = 0;
            element.width = '100%';
            element.height = '100%';
            element.fullScreen = true;
          } else if (e.pageX <= 0) {
            element.xValue = 0;
            element.yValue = 0;
            element.width = '50%';
            element.height = '100%';
            element.snapped = true;
          } else if (e.pageX >= window.innerWidth) {
            element.xValue = window.innerWidth / 2;
            element.yValue = 0;
            element.width = '50%';
            element.height = '100%';
            element.snapped = true;
          }
        }
        return element;
      })
    )
    DesktopState.isDraggingWindow = false;
  }
}

export default Desktop
