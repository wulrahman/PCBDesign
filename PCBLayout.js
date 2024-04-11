class PCBLayout {
    constructor(options) {
        this.container = document.getElementById(options.container);
        this.width = options.width;
        this.height = options.height;
        this.components = [];
        this.connections = [];
        this.gridVisible = true;
        this.snapToGrid = true;
        this.gridSize = 10;
        this.selectedComponent = null;
        this.initialMouseOffset = { x: 0, y: 0 };
        this.mode = 'normal';

        // Cache frequently accessed DOM elements
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.grid = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.canvasOffset = this.svg.getBoundingClientRect();

        // Initialize UI
        this.initUI();
    }

    initUI() {
        // Set SVG attributes
        this.svg.setAttribute("width", this.width);
        this.svg.setAttribute("height", this.height);
        this.container.appendChild(this.svg);

        // Set grid attributes
        this.grid.setAttribute("width", this.width);
        this.grid.setAttribute("height", this.height);
        this.grid.setAttribute("fill", "none");
        this.grid.setAttribute("stroke", "gray");
        this.grid.setAttribute("stroke-width", "0.5");
        this.grid.setAttribute("stroke-dasharray", "2");
        this.svg.appendChild(this.grid);

        // Show grid if enabled
        if (this.gridVisible) {
            this.showGrid();
        }

        // Bind event listeners
        this.container.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.container.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.container.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    showGrid() {
        // Create grid lines dynamically based on grid size
        const fragment = document.createDocumentFragment();

        for (let x = 0; x < this.width; x += this.gridSize) {
            const lineX = this.createGridLine(x, 0, x, this.height);
            fragment.appendChild(lineX);
        }

        for (let y = 0; y < this.height; y += this.gridSize) {
            const lineY = this.createGridLine(0, y, this.width, y);
            fragment.appendChild(lineY);
        }

        this.svg.appendChild(fragment);
    }

    createGridLine(x1, y1, x2, y2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "gray");
        line.setAttribute("stroke-width", "0.5");
        return line;
    }

    handleMouseDown(event) {
        const boundingRect = this.container.getBoundingClientRect();
        const offsetX = event.clientX - boundingRect.left;
        const offsetY = event.clientY - boundingRect.top;

        if (this.mode === 'normal') {
            // Handle normal mode
            const clickedComponent = this.getComponentAtPosition(offsetX, offsetY);
            if (clickedComponent) {
                this.selectedComponent = clickedComponent;
                this.initialMouseOffset = {
                    x: offsetX - parseFloat(clickedComponent.getAttribute("x")),
                    y: offsetY - parseFloat(clickedComponent.getAttribute("y"))
                };
            } else {
                this.selectedComponent = null;
            }
        } else if (this.mode === 'move') {
            // Handle move mode
            const clickedComponent = this.getComponentAtPosition(offsetX, offsetY);
            if (clickedComponent) {
                this.selectedComponent = clickedComponent;
                this.initialMouseOffset = {
                    x: offsetX - parseFloat(clickedComponent.getAttribute("x")),
                    y: offsetY - parseFloat(clickedComponent.getAttribute("y"))
                };
            }
        } else if (this.mode === 'delete') {
            // Handle delete mode
            const clickedComponent = this.getComponentAtPosition(offsetX, offsetY);
            if (clickedComponent) {
                this.deleteComponent(clickedComponent);
            }
        } else if (this.mode === 'add') {
            // Handle add mode
            // Add component logic
            // For example, you might call a method to add a component at the clicked position
            this.addComponentAtPosition(offsetX, offsetY);
        }
    }

    handleMouseMove(event) {
        if (this.selectedComponent) {
            const boundingRect = this.container.getBoundingClientRect();
            const offsetX = event.clientX - boundingRect.left;
            const offsetY = event.clientY - boundingRect.top;
            const newX = offsetX - this.initialMouseOffset.x;
            const newY = offsetY - this.initialMouseOffset.y;
            this.moveComponent(this.selectedComponent, newX, newY);
        }
    }

    clear() {
        // Remove all components
        this.components.forEach(component => {
            component.remove();
        });
        this.components = [];

        // Remove all connections
        this.connections.forEach(connection => {
            connection.remove();
        });
        this.connections = [];
    }

    handleMouseUp(event) {
        this.selectedComponent = null;
    }

    moveComponent(component, newX, newY) {
        component.setAttribute("x", newX);
        component.setAttribute("y", newY);
    }

    deleteComponent(component) {
        component.remove();
        this.components = this.components.filter(comp => comp !== component);
    }

    getComponentAtPosition(x, y) {
        for (const component of this.components) {
            const bbox = component.getBoundingClientRect();
            if (x >= bbox.left && x <= bbox.right && y >= bbox.top && y <= bbox.bottom) {
                return component;
            }
        }
        return null;
    }

    setMode(mode) {
        this.mode = mode;
    }

    addComponent(component) {
        this.components.push(component);
        this.svg.appendChild(component);
    }

    connectComponents(component1, component2) {
        // Connect component1 and component2 with a straight line (simplified)
        const connection = document.createElementNS("http://www.w3.org/2000/svg", "line");

        const bbox1 = component1.getBoundingClientRect();
        const bbox2 = component2.getBoundingClientRect();
        const x1 = bbox1.left + bbox1.width / 2;
        const y1 = bbox1.top + bbox1.height / 2;
        const x2 = bbox2.left + bbox2.width / 2;
        const y2 = bbox2.top + bbox2.height / 2;

        connection.setAttribute("x1", x1);
        connection.setAttribute("y1", y1);
        connection.setAttribute("x2", x2);
        connection.setAttribute("y2", y2);
        connection.setAttribute("stroke", "black");
        connection.setAttribute("stroke-width", "2");
        connection.setAttribute("class", "connection");

        this.svg.appendChild(connection);
        this.connections.push(connection);
    }

    autoConnect(component1, component2) {

        // Find a route between pad1 and pad2 avoiding intersections
        const route = this.findRoute(component1, component2);

        // Create a connection based on the route
        if (route) {
            this.createConnectionFromRoute(route);
        }
    }
    addComponentAtPosition(x, y) {
        // Add component at the specified position
        const component = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        component.setAttribute("x", x);
        component.setAttribute("y", y);
        component.setAttribute("width", 50);
        component.setAttribute("height", 50);
        component.setAttribute("fill", "blue");
        component.setAttribute("class", "component");

        this.addComponent(component);
    }

    createComponent(componentData) {
        // Create a component on the PCB layout canvas based on its type
        let component;
        switch (componentData.type) {
            case "pad":
                component = this.createPad(componentData);
                break;
            case "outline":
                component = this.createOutline(componentData);
                break;
            case "label":
                component = this.createLabel(componentData);
                break;
            default:
                component = this.createDefaultComponent(componentData);
                break;
        }
        return component;
    }
    
    createPad(padData) {
        const pad = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pad.setAttribute("cx", padData.x);
        pad.setAttribute("cy", padData.y);
        pad.setAttribute("r", padData.size / 2); // Size represents diameter for circle
        pad.setAttribute("fill", "silver"); // Customize fill color or other attributes as needed
        pad.setAttribute("class", "circle");

        this.svg.appendChild(pad);
        this.components.push(pad);
        return pad;
    }
    
    createOutline(outlineData) {
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        outline.setAttribute("x", outlineData.x);
        outline.setAttribute("y", outlineData.y);
        outline.setAttribute("width", outlineData.width);
        outline.setAttribute("height", outlineData.height);
        outline.setAttribute("fill", "none"); // Outlines typically have no fill
        outline.setAttribute("stroke", "black"); // Customize stroke color or other attributes as needed
        outline.setAttribute("class", "outline");
        this.svg.appendChild(outline);
        this.components.push(outline);

        return outline;
    }
    
    createLabel(labelData) {
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", labelData.x);
        label.setAttribute("y", labelData.y);
        label.setAttribute("font-family", "Arial");
        label.setAttribute("font-size", "12px");
        label.textContent = labelData.text;
        label.setAttribute("class", "label");

        // Customize font-family, font-size, text content, or other attributes as needed
        this.svg.appendChild(label);
        this.components.push(label);
        return label;
    }
    
    createDefaultComponent(componentData) {
        // Create a default rectangular component
        const component = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        component.setAttribute("x", componentData.x);
        component.setAttribute("y", componentData.y);
        component.setAttribute("width", componentData.width);
        component.setAttribute("height", componentData.height);
        component.setAttribute("fill", "blue"); // Default fill color
        component.setAttribute("class", "defaulf");

        // Customize other attributes as needed
        this.svg.appendChild(component);
        this.components.push(component);
        return component;
    }
    
    setGridVisible(visible) {
        this.gridVisible = visible;
        if (visible) {
            this.showGrid();
        } else {
            const lines = this.svg.querySelectorAll("line");
            lines.forEach(line => line.remove());
        }
    }

    setSnapToGrid(enabled) {
        this.snapToGrid = enabled;
    }

    setGridSize(size) {
        this.gridSize = size;
        if (this.gridVisible) {
            this.setGridVisible(false);
            this.setGridVisible(true);
        }
    }

    createRoundPad(padData) {
        const pad = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pad.setAttribute("cx", padData.x);
        pad.setAttribute("cy", padData.y);
        pad.setAttribute("r", padData.outerRadius); // Outer radius
        pad.setAttribute("fill", "silver"); // Customize fill color or other attributes as needed
        pad.setAttribute("class", "roundpad");

        this.svg.appendChild(pad);
        this.components.push(pad);

        // If inner radius is specified, create a smaller circle to represent the inner part of the pad
        if (padData.innerRadius) {
            const innerPad = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            innerPad.setAttribute("cx", padData.x);
            innerPad.setAttribute("cy", padData.y);
            innerPad.setAttribute("r", padData.innerRadius); // Inner radius
            innerPad.setAttribute("class", "roundpad_inner");
            innerPad.setAttribute("fill", "white"); // Customize inner pad color or other attributes as needed
            this.svg.appendChild(innerPad);
            this.components.push(innerPad);
        }

        return pad;
    }

    autoRoute() {
        // Clear existing connections
        this.clearConnections();
    
        // Filter out only pads
        const pads = this.components.filter(component => component.getAttribute("class") === 'pad' || component.getAttribute("class") === 'squarepad' || component.getAttribute("class") === 'roundpad');
    
        // For each pair of pads, find a route and create a connection
        for (let i = 0; i < pads.length; i++) {
            for (let j = i + 1; j < pads.length; j++) {
                const pad1 = pads[i];
                const pad2 = pads[j];
    
                // Find a route between pad1 and pad2 avoiding intersections
                const route = this.findRoute(pad1, pad2);
    
                console.log(route);
                // Create a connection based on the route
                if (route) {
                    this.createConnectionFromRoute(route);
                }
            }
        }
    }

    createConnectionFromRoute(route) {
        // For simplicity, let's assume route contains a series of grid points or components
        // Connect the points in the route (implement your connection logic here)
        for (let i = 0; i < route.length - 1; i++) {
            const point1 = route[i];
            const point2 = route[i + 1];
            this.connectPoints(point1, point2);
        }
    }
    
    connectPoints(point1, point2) {
        // Placeholder for connection logic
        // Implement logic to connect two points (grid points or components) without intersecting existing components
        // For simplicity, let's assume we are drawing a line between the points
        const connection = document.createElementNS("http://www.w3.org/2000/svg", "line");
        connection.setAttribute("x1", point1.x);
        connection.setAttribute("y1", point1.y);
        connection.setAttribute("x2", point2.x);
        connection.setAttribute("y2", point2.y);
        connection.setAttribute("stroke", "black");
        connection.setAttribute("stroke-width", "2");
        connection.setAttribute("class", "point");

        this.svg.appendChild(connection);
        this.connections.push(connection);
    }
    

    
    findShortestPath(component1, component2) {
        // Calculate the centers of the components
        const bbox1 = component1.getBoundingClientRect();
        const bbox2 = component2.getBoundingClientRect();
        const x1 = bbox1.left + bbox1.width / 2;
        const y1 = bbox1.top + bbox1.height / 2;
        const x2 = bbox2.left + bbox2.width / 2;
        const y2 = bbox2.top + bbox2.height / 2;

        // Calculate the Euclidean distance between the centers
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

        // Return an array containing the two components as the shortest path
        return [component1, component2];
    }

    createConnectionFromPath(path) {
        // For simplicity, let's assume path contains only two nodes (component1 and component2)
        const [component1, component2] = path;

        // Connect component1 and component2 (implement your connection logic here)
        this.connectComponents(component1, component2);
    }

    clearConnections() {
        // Remove all existing connections
        this.connections.forEach(connection => connection.remove());
        this.connections = [];
    }

    createSquarePad(padData) {
        const pad = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        pad.setAttribute("x", padData.x);
        pad.setAttribute("y", padData.y);
        pad.setAttribute("width", padData.width);
        pad.setAttribute("height", padData.height);
        pad.setAttribute("class", "squarepad");
        pad.setAttribute("fill", "silver"); // Customize fill color or other attributes as needed
        this.svg.appendChild(pad);
        this.components.push(pad);
        return pad;
    }

    createConnection(component1, component2) {
        this.connectComponents(component1, component2);
    }

    findRoute(component1, component2) {
        this.canvasOffset = this.svg.getBoundingClientRect();

        // Define a grid representing the PCB layout
        var grid = this.createGrid();
    
        // Mark existing components as obstacles on the grid
        grid = this.markObstacles(grid, component1, component2);
    
        // Get the start and end points of the route (centers of the components)
        const start = this.getComponentCenter(component1);
        const end = this.getComponentCenter(component2);
    
        const roundedstart = {x: Math.round(start.x), y: Math.round(start.y)};
        const roundedend = {x: Math.round(end.x), y: Math.round(end.y)};

        // Find the route using A* search algorithm
        const route = this.aStarSearch(grid, roundedstart, roundedend);
    
        return route;
    }

    // Adjusted method to correctly handle grid initialization
    createGrid() {
        // Define the size of the grid cells
        const cellSize = this.gridSize;
    
        // Calculate the number of rows and columns based on canvas dimensions and cell size
        const rows = Math.ceil(this.height);
        const cols = Math.ceil(this.width);
    
        // Create a 2D array to represent the grid
        const grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
        return grid;
    }
    
    // Adjusted method to correctly mark obstacles on the grid
    markObstacles(grid, component1, component2) {
        // Mark existing components as obstacles on the grid
        const pads = this.components.filter(component => component.getAttribute("class") === 'pad' || component.getAttribute("class") === 'squarepad' || component.getAttribute("class") === 'roundpad');
    
        pads.forEach(component => {
            // Exclude component1 and component2 from being marked as obstacles
            if (component !== component1 && component !== component2) {
                const bbox = component.getBoundingClientRect();
                const left = Math.floor(bbox.left - this.canvasOffset.left);
                const top = Math.floor(bbox.top - this.canvasOffset.top);
                const right = Math.ceil((bbox.left + bbox.width) - this.canvasOffset.left);
                const bottom = Math.ceil((bbox.top + bbox.height) - this.canvasOffset.top);
    
                for (let i = top; i < bottom; i++) {
                    for (let j = left; j < right; j++) {
                        if (grid[i] && grid[i][j] !== undefined) {
                            grid[i][j] = 1; // Mark as obstacle
                        }
                    }
                }
            }
        });

        // this.connections.forEach(component => {
        //     // Exclude component1 and component2 from being marked as obstacles
        //     const bbox = component.getBoundingClientRect();
        //     const left = Math.floor(bbox.left - this.canvasOffset.left);
        //     const top = Math.floor(bbox.top - this.canvasOffset.top);
        //     const right = Math.ceil((bbox.left + bbox.width) - this.canvasOffset.left);
        //     const bottom = Math.ceil((bbox.top + bbox.height) - this.canvasOffset.top);

        //     for (let i = top; i < bottom; i++) {
        //         for (let j = left; j < right; j++) {
        //             if (grid[i] && grid[i][j] !== undefined) {
        //                 grid[i][j] = 1; // Mark as obstacle
        //             }
        //         }
        //     }
        // });
    
        return grid;
    }
    

        // Define a function to display the grid as an image
    displayGridAsImage(grid, gridSize) {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size based on grid dimensions
        canvas.width = grid[0].length * gridSize;
        canvas.height = grid.length * gridSize;

        // Loop through the grid and draw rectangles for obstacles
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] === 1) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(j * gridSize, i * gridSize, gridSize, gridSize);
                }
            }
        }

        // Append canvas to the document body
        document.body.appendChild(canvas);
    }

    getComponentCenter(component) {
        // Get the center point of the component relative to the canvas
        const bbox = component.getBoundingClientRect();
        const centerX = (bbox.left - this.canvasOffset.left) + bbox.width / 2;
        const centerY = (bbox.top - this.canvasOffset.top) + bbox.height / 2;

        return { x: centerX, y: centerY };
    }
    

    aStarSearch(grid, start, end) {
        const threshold = 600;
        // Define the heuristic function (Euclidean distance)
        const heuristic = (point1, point2) => {
            const dx = point2.x - point1.x;
            const dy = point2.y - point1.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
    
        // Define possible movements (up, down, left, right, diagonal)
        const moves = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: -1 },
            { x: 1, y: 1 }
        ];
    
        // Initialize open and closed lists
        const open = new Map(); // Map of open nodes (point: {f, g, h, parent})
        const closed = new Map(); // Map of closed nodes (point: {f, g, h, parent})
    
        // Add start point to the open list
        open.set(`${start.x},${start.y}`, { f: 0, g: 0, h: heuristic(start, end), parent: null, x: start.x, y: start.y});
    
        // Main loop
        while (open.size > 0) {
            // Get the node with the lowest f score from the open list
            let current = null;
            let minF = Infinity;
            for (const [key, value] of open.entries()) {
                if (value.f < minF) {
                    minF = value.f;
                    current = key;
                }
            }
    
            // Move the current node from the open list to the closed list
            const currentNode = open.get(current);
            open.delete(current);
            closed.set(current, currentNode);
    
            // Check if we have reached the end point
            if (current === `${end.x},${end.y}`) {
                // Reconstruct the path and return it
                return this.reconstructPath(start, end, closed);
            }
    
            let bestNeighbor = null;
            let bestNeighborKey = null;
            let bestF = Infinity;
    
            // Generate neighbors
            for (const move of moves) {
                const neighbor = { x: currentNode.x + move.x, y: currentNode.y + move.y };
    
                // Check if the neighbor is valid (within the grid bounds and not an obstacle)
                if (this.isValidNeighbor(grid, neighbor)) {
    
                    // Check if the neighbor is already in the closed list
                    const neighborKey = `${neighbor.x},${neighbor.y}`;
                    if (closed.has(neighborKey)) {
                        continue; // Ignore this neighbor
                    }
    
                    // Calculate tentative g score
                    const tentativeG = currentNode.g + 1; // Assuming each step has a cost of 1
    
                    // Calculate tentative f score
                    const h = heuristic(neighbor, end);
                    const f = tentativeG + h;
    
                    // Update the best neighbor if this one has a lower f score
                    if (f < bestF) {
                        bestNeighbor = neighbor;
                        bestNeighborKey = neighborKey;
                        bestF = f;
                    }
                }
            }
    
            // Add the best neighbor to the open list
            if (bestNeighbor) {
                open.set(bestNeighborKey, { f: bestF, g: currentNode.g + 1, h: heuristic(bestNeighbor, end), parent: current, x: bestNeighbor.x, y: bestNeighbor.y });
            }
    
            // Early exit condition: If the heuristic distance from the current node to the goal is greater than a certain threshold, terminate the search
            const currentH = heuristic(currentNode, end);
            if (currentH > threshold) {
                return null;
            }
        }
            
        // If the loop completes without finding the end point, no path exists
        return null;
    }
    
    
    // Adjusted method to correctly check for valid neighbors
    isValidNeighbor(grid, point) {
        // Round the x and y coordinates separately
        const rounded = {x: Math.round(point.x), y: Math.round(point.y)};
        
        // Check if the neighbor is within the grid bounds and not an obstacle
        if (rounded.x >= 0 && rounded.x < grid[0].length && rounded.y >= 0 && rounded.y < grid.length && grid[rounded.y][rounded.x] !== 1) {
            return true;
        }
    
        return false;
    }
    
    reconstructPath(start, end, closed) {
        // Reconstruct the path from the closed list
        const path = [];
        let current = `${end.x},${end.y}`;
        while (current !== `${start.x},${start.y}`) {
            const [x, y] = current.split(',').map(Number);
            path.unshift({ x, y });
            current = closed.get(current).parent;
        }
        path.unshift({ x: start.x, y: start.y });
        return path;
    }
    
}
