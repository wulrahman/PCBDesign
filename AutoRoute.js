
class AutoRoute extends PCBLayout {

    constructor(options) {
        super(options);
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
    
                this.autoConnect(pad1, pad2);
            }
        }
    }

    autoConnect(component1, component2) {
        // Find a route between pad1 and pad2 avoiding intersections
        const route = this.findRoute(component1, component2);

        // Create a connection based on the route
        if (route) {
            this.createConnectionFromRoute(route);
        }
    }


    createConnectionFromRoute(route) {
        // Generate a random color for this route
        const randomColor = this.getRandomColor();
    
        // For simplicity, let's assume route contains a series of grid points or components
        // Connect the points in the route (implement your connection logic here)
        for (let i = 0; i < route.length - 1; i++) {
            const point1 = route[i];
            const point2 = route[i + 1];
            this.connectPoints(point1, point2, randomColor); // Pass the random color
        }
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
    
    markObstacles(grid, component1, component2) {
        // Mark existing components as obstacles on the grid
        const pads = this.components.filter(component => component.getAttribute("class") === 'pad' || component.getAttribute("class") === 'squarepad' || component.getAttribute("class") === 'roundpad');
    
        const padding = 5;

        pads.forEach(component => {
            // Exclude component1 and component2 from being marked as obstacles
            if (component !== component1 && component !== component2) {
                const bbox = component.getBoundingClientRect();
                const left = Math.floor(bbox.left - this.canvasOffset.left) - padding; // Adjust left by 1
                const top = Math.floor(bbox.top - this.canvasOffset.top) - padding; // Adjust top by 1
                const right = Math.ceil((bbox.left + bbox.width) - this.canvasOffset.left) + padding; // Adjust right by 1
                const bottom = Math.ceil((bbox.top + bbox.height) - this.canvasOffset.top) + padding; // Adjust bottom by 1
    
                for (let i = top; i < bottom; i++) {
                    for (let j = left; j < right; j++) {
                        if (grid[i] && grid[i][j] !== undefined) {
                            grid[i][j] = 1; // Mark as obstacle
                        }
                    }
                }
            }
        });
    
        this.connections.forEach(component => {
            // Exclude component1 and component2 from being marked as obstacles
            const bbox = component.getBoundingClientRect();
            const left = Math.floor(bbox.left - this.canvasOffset.left) - padding; // Adjust left by 1
            const top = Math.floor(bbox.top - this.canvasOffset.top) - padding; // Adjust top by 1
            const right = Math.ceil((bbox.left + bbox.width) - this.canvasOffset.left) + padding; // Adjust right by 1
            const bottom = Math.ceil((bbox.top + bbox.height) - this.canvasOffset.top) + padding; // Adjust bottom by 1
    
            for (let i = top; i < bottom; i++) {
                for (let j = left; j < right; j++) {

                    if (!this.isInsidePad(j, i)) {

                        if (grid[i] && grid[i][j] !== undefined) {
                            grid[i][j] = 1; // Mark as obstacle
                        }

                    }
                }
            }
        });
    
        return grid;
    }
    

    isInsidePad(x, y) {
        // Check if the cell is inside any pads
        const pads = this.components.filter(component => component.getAttribute("class") === 'pad' || component.getAttribute("class") === 'squarepad' || component.getAttribute("class") === 'roundpad');
        
        for (const pad of pads) {
            const bbox = pad.getBoundingClientRect();
            const padLeft = Math.floor(bbox.left - this.canvasOffset.left);
            const padTop = Math.floor(bbox.top - this.canvasOffset.top);
            const padRight = Math.ceil((bbox.left + bbox.width) - this.canvasOffset.left);
            const padBottom = Math.ceil((bbox.top + bbox.height) - this.canvasOffset.top);
    
            if (x > padLeft && x < padRight && y > padTop && y < padBottom) {
                return true;
            }
        }
    
        return false;
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
        const threshold = 10000;
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