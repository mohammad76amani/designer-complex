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

*states*
x,setX,y,setY: for cordinations of selected element 

width ,setWidth ,height ,setHeight :for demensions iof each elements 

///FloatingStyleEditor\\\

this compoenet is used to edit the style of the selected element and it is used in the elementEditor.tsx file

*props:

element: the element to be edited styels and contents 
onClose: a function to close the style editor
onUpdateElement: a function to update an elements contenet and styles and pass it to the parent component

*states:

isOpen: a boolean indicating whether the style editor is open
position: the position of the style editor
activeTab: the active tab in the style editor

*key functions:

updateStyle: updates the style of the selected element and pass it to the parent component
updateContent: updates the content of the selected element and pass it to the parent component
renderTextArea: renders a textarea for editing text content
renderStyleTab: renders the style tab of the style editor

///GroupContainer.tsx///

this component is used to group elements together and it is used in the elementEditor.tsx file and renders the group container and the elements inside it

props:

group: the group to be rendered
elements: the elements to be rendered
onUpdateElement: a function to update an elements size cordinations and pass it to the parent component
onSelect: a function to select an element
onUpdateElement: a function to update an elements size cordinations and pass it to the parent component
canvasRef: a ref to the canvas
onContextMenu: a function to handle context menu interactions
onOpenStyleEditor: a function to handle opening the style editor
onSelectGroupElement: a function to select an element in the group
selectedElementIds: an array of selected element ids

*states:
isDragging: a boolean indicating whether the group is being dragged
dragOffset: the offset of the group during drag

*key functions:
handleMouseDown: handles mouse down events for dragging the group
handleMouseMove: handles mouse move events for dragging the group
handleMouseUp: handles mouse up events for dragging the group
renderResizeHandles: renders the resize handles for the group

children components:
ElementRenderer: renders the elements inside the group

///SectionRenderer.tsx///
this component is used to render the section and it is used in the elementEditor.tsx file and renders the section and the elements inside it

*props:
sectionKey: the key of the section
section: the section to be rendered

*children components:
CanvasRenderer: renders the section and the elements inside it

///ShapeSelector.tsx///
this component is used to select the shape of the element and it is used in the elementEditor.tsx file and renders the shape selector and the elements inside it

*props:

onSelectShape: a function to select a shape

onClose: a function to close the shape selector

///template.ts///

this file contains the types of the components and elements in its self

/// animationUtils.ts ///

This utility file provides animation functionality for elements in the designer complex application. It handles hover and click animations, generates CSS classes, and creates dynamic animation styles for elements.

*Key Constants:*

hoverAnimationOptions: Array of available hover animation options including:
- none: No animation
- bg-color: Background color change on hover
- text-color: Text color change on hover  
- scale-up: Scale element up on hover
- scale-down: Scale element down on hover
- shadow: Add shadow effect on hover
- border: Add border on hover

clickAnimationOptions: Array of available click animation options including:
- none: No animation
- bg-color: Background color change on click
- text-color: Text color change on click
- scale-down: Scale element down on click
- bounce: Bounce animation on click
- pulse: Pulse animation on click

*Key Functions:*

getAnimationClasses: Takes an Element and returns CSS class names for animations
- Checks if element has animation properties
- Adds hover animation classes with 'hover-' prefix
- Adds click animation classes with 'click-' prefix
- Returns combined classes as string

getDefaultAnimationConfig: Returns default animation configuration object
- Sets both hover and click animations to 'none'
- Used for initializing new elements

generateElementAnimationCSS: Generates complete CSS for element animations
- Takes an Element and returns CSS string
- Handles hover animations with custom colors and effects
- Handles click animations with keyframes for bounce and pulse
- Creates element-specific CSS using data-element-id selectors
- Includes transition effects for smooth animations
- Generates unique keyframe names using element ID

*Animation Types Handled:*

Hover Animations:
- bg-color: Changes background color with customizable hoverBgColor
- text-color: Changes text color with customizable hoverTextColor  
- scale-up: Scales element to 1.05x size
- scale-down: Scales element to 0.95x size
- shadow: Adds box shadow with rgba(0,0,0,0.2)
- border: Adds 2px solid border with customizable hoverBorderColor

Click Animations:
- bg-color: Changes background color with customizable clickBgColor
- text-color: Changes text color with customizable clickTextColor
- scale-down: Scales element to 0.9x size on active state
- bounce: Creates bounce keyframe animation moving element up 10px
- pulse: Creates pulse keyframe animation scaling from 1 to 1.05 and back

*CSS Generation Features:*

- Uses CSS transitions for smooth hover effects (0.3s ease)
- Creates unique keyframe animations per element using element.id
- Targets elements using data-element-id attribute selectors
- Supports customizable colors through element animation properties
- Handles both :hover and :active pseudo-classes
- Returns empty string if no animations are configured

*Usage:*

This utility is used by:
- AnimationEditor component for displaying animation options
- ElementRenderer component for applying animation classes
- Style generation systems for creating dynamic CSS
- Element management systems for default animation setup

/// canvasAnimationUtils.ts ///

This utility file provides canvas-level animation management for the designer complex application. It handles the generation and injection of CSS animations for all elements on the canvas, managing the dynamic styling system for element animations.

*Key Functions:*

generateCanvasAnimationCSS: Generates CSS for all animations in the canvas
- Takes an array of Element objects as input
- Filters elements to only process those with animation properties
- Maps each animated element through generateElementAnimationCSS function
- Joins all generated CSS strings with newlines
- Returns complete CSS string for all canvas animations
- Returns empty string if no elements have animations

injectAnimationStyles: Injects animation CSS into the document
- Takes an array of Element objects as input
- Removes any existing animation styles from the document
- Generates new animation CSS using generateCanvasAnimationCSS
- Skips injection if no CSS content is generated
- Creates and injects new style element into document head
- Manages style element with ID 'canvas-animations' for easy cleanup

*CSS Management Features:*

Style Element Management:
- Uses unique ID 'canvas-animations' for the style element
- Automatically removes existing styles before injecting new ones
- Prevents duplicate style elements in the document
- Appends style element to document head for global scope

Dynamic CSS Generation:
- Processes only elements that have animation configurations
- Generates element-specific CSS using data-element-id selectors
- Combines hover and click animations for all elements
- Creates keyframe animations for complex effects like bounce and pulse
- Handles transition effects for smooth animations

Performance Optimizations:
- Filters out non-animated elements early in the process
- Skips DOM manipulation if no CSS is generated
- Replaces existing styles instead of accumulating them
- Uses efficient string concatenation for CSS generation

*Integration Points:*

Canvas Rendering:
- Called when canvas elements are updated or modified
- Triggered during element animation property changes
- Used in real-time preview of animation effects
- Integrated with element selection and editing workflows

Element Management:
- Works with Element type from template definitions
- Processes animation properties from element configurations
- Handles multiple animation types per element
- Supports dynamic animation updates

*Dependencies:*

- Imports Element type from '../types/template'
- Imports generateElementAnimationCSS from './animationUtils'
- Relies on DOM manipulation (document.getElementById, document.createElement)
- Works with browser document.head for style injection

*Usage Scenarios:*

Real-time Animation Updates:
- When user modifies element animation properties
- During element creation with animation configurations
- When importing templates with pre-configured animations
- During canvas refresh and re-rendering operations

Style Management:
- Centralizes all canvas animation CSS in single style element
- Provides clean separation between static and dynamic styles
- Enables easy removal and replacement of animation styles
- Supports hot-reloading of animation configurations

/// elementUtils.ts ///

This utility file provides essential helper functions for handling element dimensions and formatting in the designer complex application. It manages the conversion and formatting of width and height values for elements on the canvas.

*Key Functions:*

dimensionToNumber: Converts a width or height value to a number
- Takes value parameter of type string or number
- Returns numeric value as number type
- Handles both string and number inputs efficiently
- Removes unit suffixes (px, em, rem, %, etc.) from string values
- Uses parseFloat for accurate decimal number conversion
- Strips all non-numeric characters except digits, dots, and minus signs
- Preserves negative values and decimal places
- Returns original value if already a number

formatDimension: Formats a dimension value for display
- Takes value parameter of type string or number  
- Returns formatted string representation
- Converts input to number using dimensionToNumber function
- Rounds result to nearest integer using Math.round
- Converts final result back to string for display
- Provides consistent formatting across the application
- Eliminates decimal places for cleaner UI display

*Value Processing Features:*

String Processing:
- Removes CSS unit suffixes (px, em, rem, %, vh, vw, etc.)
- Handles complex unit combinations and spacing
- Uses regex pattern /[^\d.-]/g to strip non-numeric characters
- Preserves decimal points and negative signs
- Converts processed string to float for accuracy

Number Handling:
- Direct passthrough for numeric inputs
- Maintains precision for calculations
- Supports both integer and floating-point values
- Handles edge cases like zero and negative numbers

*Formatting Standards:*

Display Formatting:
- Rounds all dimensions to whole numbers for UI consistency
- Eliminates floating-point display issues
- Provides clean, readable dimension values
- Standardizes dimension representation across components

Input Normalization:
- Accepts flexible input formats from various sources
- Handles user input with or without units
- Processes API data with different unit specifications
- Normalizes imported template dimension values

*Usage Scenarios:*

Element Property Management:
- Converting CSS dimension strings to numeric values for calculations
- Processing user input from dimension input fields
- Handling imported template data with mixed dimension formats
- Normalizing dimension values for element positioning and sizing

UI Display:
- Formatting dimensions for property panels and editors
- Displaying element sizes in toolbars and status bars
- Showing dimension values in element selection indicators
- Presenting clean dimension values in export/import operations

Mathematical Operations:
- Preparing dimension values for resize calculations
- Converting dimensions for grid snapping operations
- Processing dimensions for element alignment functions
- Handling dimension values in animation and transition calculations

*Integration Points:*

Element Management:
- Used by ElementRenderer for processing element dimensions
- Integrated with ElementEditor for dimension input handling
- Supports FloatingStyleEditor dimension controls
- Works with element resize and positioning operations

Canvas Operations:
- Processes dimensions during element creation and modification
- Handles dimension calculations for group operations
- Supports canvas zoom and scaling dimension adjustments
- Manages dimension values during copy/paste operations

*Performance Considerations:*

- Lightweight functions with minimal processing overhead
- Efficient regex pattern for unit removal
- Direct numeric passthrough for performance
- Minimal memory allocation for string processing

*Dependencies:*

- Uses native JavaScript parseFloat function
- Relies on Math.round for integer conversion
- Utilizes regex for string pattern matching
- No external dependencies for maximum compatibility


