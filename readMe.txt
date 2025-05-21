///page.tsx///

this component gets the jason data from the api or from the local json file
 
 have three conditions:
 1. set loading to true when the data is loading
 2. set error to true when there is an error
 3. set data to the data from the api or from the local json file

 and then render the data and pass them to the child component (DesignerRenderer)

///DesignerRenderer.tsx///

this component gets the data from the parent component (page.tsx) and renders the data
finds the that section type is "designer" and renders the data

*states:

selectedElementIds: for the selected elements and setSelectedElementIds is used  to set the selected element ids for multi selection

selectedElement: for the selected element and setSelectedElement is used to set the selected element if the user clicks on the element

showStyleEditor: for the style editor and setShowStyleEditor is used to set the style editor to true 
 if the user clicks on the element and show the style editor that is in the styleEditor.tsx component

elemnets : for the elements and setElements is used to set the elements and fill this state with the right data that section type is "designer"

clipboard : for the clipboard and setClipboard is used to set the clipboard and use this state for copy and paste and cut

contextMenu : for the context menu and setContextMenu is used to set the context menu and use this state for the context menu have the show data and position data

history : for the history and setHistory is used to set the history and use this state for undo and redo

historyIndex : for the history index and setHistoryIndex is used to set the history index and use this state for undo and 

*key functions:

handelUndo : for the undo and updete the elements to perv  history and upadte  historyIndex

handelRedo : for the redo and updete the elements to next  history and upadte  historyIndex

createGroup : for the create group and create a group of selected elements and add it to the elements

ungroup : for the ungroup and ungroup the selected elements and add it to the elements

handleSelectElement: for the select element and set the selected element and set the selected element ids and selected element ids it work fro multi selection and  single selection

handleUpdateElement: for the update selectedElement position and size and style and set the selected element and set the selected element ids and selected element ids it work fro multi selection and  single selection

deleteElement: for the delete element and delete the selected element by id

copyElement: for the copy element and copy the selected element and add it to the clipboard

cutElement: for the cut element and cut the selected element and add it to the clipboard

pasteElement: for the paste element and paste that element from the clipboard and add it to the elements

handleAddElement: for the add element and add the element to the elements and it work by switch case between the defined elements

*children components:

ElementToolbar: 
props:handleAddElement

CanvasRenderer: 
props:blocks:the elements and prev blocks 
onSelectElement:handleSelectElement for selectedElement and setSelectedElementIds
selectedElementIds:selectedElementIds for the selected elements and setSelectedElementIds is used  to set the selected element ids for multi selection
selectedElementId:selectedElement for the selected element and setSelectedElement is used to set the selected element if the user clicks on the element
onUpdateElement:handleUpdateElement for the update selectedElement position and size and style and setSelectedElement is used to set the selected element if the user clicks on the element
onElementContextMenu:handleElementContextMenu Function to handle right-click on the canvas
onCanvasContextMenu:handleCanvasContextMenu Function to handle position of the context menu
onCloseContextMenu:handleCloseContextMenu Function to close the context menu
onOpenStyleEditor:handleOpenStyleEditor Function to open the style editor

ContextMenu:
props: x: the x position of the context menu
y: the y position of the context menu
onClose:handleCloseContextMenu Function to close the context menu
onDelete:handleDeleteElement Function to delete the selected element
onCopy:handleCopyElement Function to copy the selected element
onCut:handleCutElement Function to cut the selected element
onPaste:handlePasteElement Function to paste the selected element
canPaste:canPaste Function to check if the clipboard is not empty

FloatingStyleEditor:
props:
element: the element that the style editor is for
onClose:handleCloseStyleEditor Function to close the style editor
onUpdate:handleUpdateElement Function to update the selected element

/// ElementToolbar.tsx///

this component is used to render the toolbar of the elements and it is used in the CanvasRenderer component
adds the elements to the elements state and renders the elements by function that passed from the parent component

states:
hoveredElement : for the hovered element and setHoveredElement is used to set the hovered element if the user hovers on the element

elementTypes: an object that contains the elements types and their names and icons and the function that adds the elements to the elements state
and have a style for the elements and the function that adds the elements to the elements state

\\\ CanvasRenderer.tsx ///


states
this component is used to render the canvas and it is used in the DesignerRenderer component and main container for all elements and handles group operations, element selection, and canvas-level interactions.



states:

activeGroupId,setActiveGroupId: for the active group id and setActiveGroupId is used to set the active group id and use this state for the active group id

isDraggingGroup,setIsDraggingGroup: for the is dragging group and setIsDraggingGroup is used to set the is dragging group and use this state for the is dragging group

isResizingGroup, setIsResizingGroup: for the is resizing group and setIsResizingGroup is used to set the is resizing group and use this state for the is resizing group

resizeHandle, setResizeHandle: for the resize handle and setResizeHandle is used to set the resize handle and use this state for the resize handle

dragOffset, setDragOffset: for the drag offset and setDragOffset is used to set the drag offset and use this state for the drag offset 

initialSize, setInitialSize: for the initial size and setInitialSize is used to set the initial size and use this state for the initial size

initialPosition, setInitialPosition: for the initial position and setInitialPosition is used to set the initial position and use this state for the initial position

initialMousePosition, setInitialMousePosition: for the initial mouse position and setInitialMousePosition is used to set the initial mouse position and use this state for the initial mouse position

key functions:

handleCanvasContextMenu: Handles right-clicks on the canvas (not on elements)

handleCanvasClick: Handles clicks on the canvas itself

handleGroupMouseDown: Initiates group dragging

handleGroupResizeStart: Initiates group resizing

renderGroupResizeHandles: Renders resize handles for a selected group

renderGroup: Renders a group element with its children

\\\ ElementRenderer.tsx ///

 is a fundamental building block of the design system that renders individual elements on the canvas. It handles element-specific rendering, interactions (dragging, resizing), and styling. This component is responsible for the visual representation and interactive behavior of each element.
Renders different types of elements (button, image, paragraph, heading, video, shape)
Handles element dragging and repositioning
Manages element resizing with multiple resize handles
Manages element resizing with multiple resize handles
Manages element selection and context menu interactions

props:
element: the element to be rendered
isSelected: a boolean indicating whether the element is selected
onSelect: a function to handle element selection
onContextMenu: a function to handle context menu interactions
onUpdateElement: a function to handle element updates
onContextMenu: a function to handle context menu interactions
onOpenStyleEditor: a function to handle opening the style editor
isInGroup: a boolean indicating whether the element is in a group

key functions:

generateBoxShadow: Creates box shadow CSS based on element properties

generateTransform: Creates CSS transform based on rotation and scale

generateFilter: Creates CSS filters for visual effects

generateBorder: Creates CSS border based on border properties

handleMouseDown: Initiates element dragging

handleMouseMove: Handles element movement during drag or resize

handleMouseUp: Finalizes element position and size after drag or resize

handleResizeStart: Initiates element resizing

handleClick: Handles element clicks for opening the style editor

handleContextMenu: Handles right-click for context menu

renderContent: Renders the appropriate content based on element type


///animationsEditor.tsx ///

adds the animations to the animations state and renders the animations by function that passed from the parent component and updates element properties based on animation state changes.

adds animations based that event calls that animations and add them by that condition in selct box

uses hoverAnimationOptions , clickAnimationOptions from utils that imported

///animationUtils///

this file contains the animations that are used in the animations editor and the animations that are used in the animations editor and sprate the animations to different categories hover and click and add them to the animations state and render them by function that passed from the parent component and updates element properties based on animation state changes.

*key functions*

getAnimationClasses: Returns CSS classes for a given animation type

getDefaultAnimationConfig: Returns default animation configuration for a given animation type

generateElementAnimationCSS: Generates CSS for an element animation

/// contextMenu.tsx ///

this file contains the context menu that is used for copy , paste , cut and delete  

*props:

x, y: the position of the context menu
onClose: a function to close the context menu
onDelete: a function to delete an element
onCopy: a function to copy an element
onPaste: a function to paste an element
onCut: a function to cut an element
canPaste: a function to check if an element can be pasted

///elementEditor.tsx ///

get element and onUpdateElement: a function to update an elements size cordinations and pass it to the parent component



