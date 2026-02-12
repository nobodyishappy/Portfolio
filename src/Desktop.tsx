import { useEffect, useState, type Dispatch, type PointerEvent, type ReactElement, type SetStateAction } from 'react';
import './Desktop.css'
import ShowcaseScene from './ShowcaseScene/ShowcaseScene';

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
  height: number;
  width: number;
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
  height: window.innerHeight,
  width: window.innerWidth,
  zIndex: 0,
}

const workspaceIcons: IconData[] = [
  { 
    id: 1, 
    image: '.png', 
    name: 'Showcase', 
    element: ShowcaseScene(), 
    active: false, 
    xValue: 0, 
    yValue: 0, 
    fullScreen: true,
    snapped: false,
    height: window.innerHeight,
    width: window.innerWidth,
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
    height: window.innerHeight,
    width: window.innerWidth,
    zIndex: 0,
  },
];

const DesktopState = {
  isDraggingWindow: false,
  isResizingWindow: false,
  prevPointerPos: {x: 0, y: 0},
  interactedWindow: emptyIcon,
  resizeDirection: 'none',
  resizeBorderSize: 8,
}

// Function to display all the desktop application icons.
function WorkspaceIcons(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, isMobile:boolean) {
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
function TaskbarManager(activeWindows : IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, isMobile:boolean) {
  const taskbar = () => {
    if (isMobile) {
      return;
    } else {
      return activeWindows.map((icon: IconData) => (
        <div className='icon-box' key={icon.id} 
          style={{
            background:icon.zIndex == activeWindows.length && icon.active?'grey':''
          }}
          onClick={() => {
            TaskBarIconClick(activeWindows, setActiveWindows, icon);
          }}
        >
          {icon.id}
        </div>
      ))
    }
  }
  
  return (
    <div id="taskbar">
      {taskbar()}
    </div>
  );
}

// Function for the actions to be done when the taskbar icons are pressed.
function TaskBarIconClick(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, icon:IconData){
  let changeOrder = false;
  let tempZIndex = icon.zIndex;

  activeWindows.forEach(element => {
    if (element.id == icon.id && element.active && element.zIndex == activeWindows.length) {
      changeOrder = true;
    }
  });

  setActiveWindows(
    activeWindows.map(element => {
      if (element.id == icon.id) {
        if (element.active && element.zIndex == activeWindows.length) {
          element.active = false;
          element.zIndex = 1;
        } else {
          element.active = true;
          element.zIndex = activeWindows.length;
        }
      } else if (element.zIndex >= tempZIndex) {
        element.zIndex--;
      } else {
        if (changeOrder) {
          element.zIndex++;
        }
      }
      return element
    }
  ));
}

// Function to load the active windows in the workspace.
function WindowManager(activeWindows: IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, isMobile:boolean) {
  const topbar = (icon:IconData) => {
    if (!isMobile) {
      return WindowTopbar(activeWindows, setActiveWindows, icon);
    }
  };
  
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
            border:isMobile?'none':'3px solid #191919',
          }}
          onPointerDown={
            (e) => {
              WindowClick(activeWindows, setActiveWindows, icon);
              WindowResizePointerDown(icon, e);
            }
          }
        >
          {topbar(icon)}
          <div id="window-container"
            style={{
              height:isMobile?"100%":"calc(100% - 30px)"
            }}
          >
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

function WindowResizePointerDown(icon:IconData, e:PointerEvent) {
  if (e.nativeEvent.offsetY <= 30) {
    return;
  }
  if (e.nativeEvent.offsetX <= 4 || e.nativeEvent.offsetX >= (icon.width - DesktopState.resizeBorderSize) || e.nativeEvent.offsetY >= (icon.height - DesktopState.resizeBorderSize)) {
    DesktopState.interactedWindow = icon;
    DesktopState.isResizingWindow = true;
    DesktopState.prevPointerPos.x = e.pageX;
    DesktopState.prevPointerPos.y = e.pageY;
    if (e.nativeEvent.offsetX <= 4 && e.nativeEvent.offsetY >= (icon.height - DesktopState.resizeBorderSize)) {
      // console.log("Right Corner Resize");
      DesktopState.resizeDirection = 'LeftCorner';
    } else if (e.nativeEvent.offsetX >= (icon.width - DesktopState.resizeBorderSize) && e.nativeEvent.offsetY >= (icon.height - DesktopState.resizeBorderSize)){
      // console.log("Right Corner Resize");
      DesktopState.resizeDirection = 'RightCorner';
    } else if (e.nativeEvent.offsetX <= 4){
      // console.log("Left Resize");
      DesktopState.resizeDirection = 'Left';
    } else if (e.nativeEvent.offsetY >= (icon.height - DesktopState.resizeBorderSize)){
      // console.log("Bottom Resize");
      DesktopState.resizeDirection = 'Bottom';
    } else if (e.nativeEvent.offsetX >= (icon.width - DesktopState.resizeBorderSize)){
      // console.log("Right Resize");
      DesktopState.resizeDirection = 'Right';
    } 
  }
} 

// Function to load the window top bar in the window box;
function WindowTopbar(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, icon:IconData) {
  return (
    <div className="window-topbar" onPointerDown={
      (e) => {
        e.stopPropagation();
        let target = e.target as HTMLElement;
        WindowClick(activeWindows, setActiveWindows, icon)
        if (target.className == 'window-topbar') {
          WindowTopbarPointerDown(icon, e);
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
                element.zIndex = 1;
              } else if (element.zIndex <= icon.zIndex) {
                element.zIndex++;
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
          ResetElementData(icon);
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
function WindowTopbarPointerDown(icon:IconData, e:PointerEvent) {
  DesktopState.isDraggingWindow = true;
  DesktopState.interactedWindow = icon;
  DesktopState.prevPointerPos.x = e.pageX;
  DesktopState.prevPointerPos.y = e.pageY;
}

// Function to resize the window when clicked on the size button.
function WindowSizeButton(activeWindows:IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, icon:IconData) {
  setActiveWindows(
    activeWindows.map(element => {
      if (element.id == icon.id) {
        if (element.fullScreen) {
          element.height = (window.innerWidth * (9 / 32));
          element.width = (window.innerWidth * (1 / 2));
          element.xValue = 50;
          element.yValue = 50;
          element.fullScreen = false;
        } else {
          element.height = window.innerHeight;
          element.width = window.innerWidth;
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

// Function to reset data for element on next load.
function ResetElementData(icon:IconData) {
  icon.fullScreen = true;
  icon.snapped = false;
  icon.width = window.innerWidth;
  icon.height = window.innerHeight;
  icon.xValue = 0;
  icon.yValue = 0;
}

// Function to load the entire desktop with the different components.
function Desktop() {
  const emptyWindow : IconData[] = []
  const [activeWindows, setActiveWindows] = useState(emptyWindow);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 450) {
      setIsMobile(true);
    }
  })

  return (
    <div id="desktop"
      onPointerMove={(e) => {
        DragPointerMove(activeWindows, setActiveWindows, e);
      }}
    >
      <div id="workspace"
        onPointerUp = {() => {
          if(DesktopState.isDraggingWindow) {
            DesktopState.isDraggingWindow = false;
          } else if (DesktopState.isResizingWindow) {
            DesktopState.isResizingWindow = false;
          }
        }}
        onPointerLeave={(e) => {
          DragPointerLeave(activeWindows, setActiveWindows, e);
        }}
      >
        <img id='workspace-bg' src='./images/DarkOut.png' alt='Background'/>
        {WorkspaceIcons(activeWindows, setActiveWindows, isMobile)}
        {WindowManager(activeWindows, setActiveWindows, isMobile)}
      </div>
      {TaskbarManager(activeWindows, setActiveWindows, isMobile)}
    </div>
  )
}

// Function for actions when window is being dragged or moved around.
function DragPointerMove(activeWindows: IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, e:PointerEvent) {
  if(DesktopState.isDraggingWindow) {
    let movingWindow = DesktopState.interactedWindow;
    if (e.pageX <= 5 || e.pageX >= (window.innerWidth - 5) || e.pageY <= 5) {
      setActiveWindows(
        activeWindows.map((element) => {
          if(element.id == movingWindow.id) {
            if (e.pageY <= 5) {
              element.xValue = 0;
              element.yValue = 0;
              element.width = window.innerWidth;
              element.height = window.innerHeight;
              element.fullScreen = true;
            } else if (e.pageX <= 5) {
              element.xValue = 0;
              element.yValue = 0;
              element.width = window.innerWidth / 2;
              element.height = window.innerHeight;
              element.snapped = true;
            } else if (e.pageX >= (window.innerWidth - 5)) {
              element.xValue = window.innerWidth / 2;
              element.yValue = 0;
              element.width = window.innerWidth / 2;
              element.height = window.innerHeight;
              element.snapped = true;
            }
          }
          return element;
        })
      )

      DesktopState.isDraggingWindow = false;
      return;
    }

    if (movingWindow.snapped || movingWindow.fullScreen) {
      setActiveWindows(
        activeWindows.map(element => {
          if (element.id == movingWindow.id) {
            element.height = (window.innerWidth * (9 / 32));
            element.width = (window.innerWidth * (1 / 2));
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
          element.xValue += e.pageX - DesktopState.prevPointerPos.x;
          element.yValue += e.pageY - DesktopState.prevPointerPos.y;
          DesktopState.prevPointerPos.x = e.pageX;
          DesktopState.prevPointerPos.y = e.pageY;
        }
        return element;
      })
    )
  } else if (DesktopState.isResizingWindow) {
    let xMove = e.pageX - DesktopState.prevPointerPos.x;
    let yMove = e.pageY - DesktopState.prevPointerPos.y;
    
    DesktopState.interactedWindow.fullScreen = false;

    if (DesktopState.resizeDirection == 'LeftCorner') {
      SetResizeSize(activeWindows, setActiveWindows, e, -xMove, -xMove, yMove);
    } else if (DesktopState.resizeDirection == 'RightCorner') {
      SetResizeSize(activeWindows, setActiveWindows, e, 0, xMove, yMove);
    } else if (DesktopState.resizeDirection == 'Left') {
      SetResizeSize(activeWindows, setActiveWindows, e, -xMove, -xMove, 0);
    } else if (DesktopState.resizeDirection == 'Bottom') {
      SetResizeSize(activeWindows, setActiveWindows, e, 0, 0, yMove);
    } else if (DesktopState.resizeDirection == 'Right') {
      SetResizeSize(activeWindows, setActiveWindows, e, 0, xMove, 0);
    }

    DesktopState.prevPointerPos.x = e.pageX;
    DesktopState.prevPointerPos.y = e.pageY;
  } else {
    let target = e.target as HTMLElement;
    if (target.className == 'window-box') {
      let icon = target.getBoundingClientRect();
      if (e.nativeEvent.offsetX <= 4 && e.nativeEvent.offsetY >= (icon.height - DesktopState.resizeBorderSize)) {
        // console.log("Right Corner Resize");
        target.style.cursor = "nesw-resize";
      } else if (e.nativeEvent.offsetX >= (icon.width - DesktopState.resizeBorderSize) && e.nativeEvent.offsetY >= (icon.height - DesktopState.resizeBorderSize)){
        // console.log("Right Corner Resize");
        target.style.cursor = "nwse-resize";
      } else if (e.nativeEvent.offsetX <= 4 || e.nativeEvent.offsetX >= (icon.width - DesktopState.resizeBorderSize)){
        // console.log("Left Right Resize");
        target.style.cursor = "ew-resize";
      } else if (e.nativeEvent.offsetY >= (icon.height - DesktopState.resizeBorderSize)){
        // console.log("Bottom Resize");
        target.style.cursor = "ns-resize";
      } else {
        target.style.cursor = "default";
      }
    } else {
      target.style.cursor = "default";
    }
  }
}

function SetResizeSize(activeWindows: IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, e:PointerEvent, xMove:number, widthMove:number, heightMove:number){
  let resizingWindow = DesktopState.interactedWindow;

  setActiveWindows(
    activeWindows.map((element) => {
      if(element.id == resizingWindow.id) {
        element.xValue -= xMove;
        element.width += widthMove;
        element.height += heightMove;
        DesktopState.prevPointerPos.x = e.pageX;
      }
      return element;
    })
  )
}

// Function for action when pointer leaves the workspace area.
// Leaving through the top will fullscreen, the sides will half and snap.
function DragPointerLeave(activeWindows: IconData[], setActiveWindows:Dispatch<SetStateAction<IconData[]>>, e:PointerEvent) {
  if(DesktopState.isDraggingWindow) {
    let movingWindow = DesktopState.interactedWindow;
    setActiveWindows(
      activeWindows.map((element) => {
        if(element.id == movingWindow.id) {
          if (e.pageY <= 0) {
            element.xValue = 0;
            element.yValue = 0;
            element.width = window.innerWidth;
            element.height = window.innerHeight;
            element.fullScreen = true;
          } else if (e.pageX <= 0) {
            element.xValue = 0;
            element.yValue = 0;
            element.width = window.innerWidth / 2;
            element.height = window.innerHeight;
            element.snapped = true;
          } else if (e.pageX >= (window.innerWidth)) {
            element.xValue = window.innerWidth / 2;
            element.yValue = 0;
            element.width = window.innerWidth / 2;
            element.height = window.innerHeight;
            element.snapped = true;
          }
        }
        return element;
      })
    )
    DesktopState.isDraggingWindow = false;
  } else if (DesktopState.isResizingWindow) {
    DesktopState.isResizingWindow = false;
  }
}

export default Desktop
