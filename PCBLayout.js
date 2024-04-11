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

    handleMouseUp(event) {
        this.selectedComponent = null;
    }

        
    addComponent(component) {
        this.components.push(component);
        this.svg.appendChild(component);
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

    connectPoints(point1, point2, color) {
        // Placeholder for connection logic
        // Implement logic to connect two points (grid points or components) without intersecting existing components
        // For simplicity, let's assume we are drawing a line between the points
        const connection = document.createElementNS("http://www.w3.org/2000/svg", "line");
        connection.setAttribute("x1", point1.x);
        connection.setAttribute("y1", point1.y);
        connection.setAttribute("x2", point2.x);
        connection.setAttribute("y2", point2.y);
        connection.setAttribute("stroke", color); // Set the stroke color to the random color
        connection.setAttribute("stroke-width", "2");
        connection.setAttribute("class", "point");
    
        this.svg.appendChild(connection);
        this.connections.push(connection);
    }



    getRandomColor() {
        // Generate a random color in hexadecimal format
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }


    setGridSize(size) {
        this.gridSize = size;
        if (this.gridVisible) {
            this.setGridVisible(false);
            this.setGridVisible(true);
        }
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

    setMode(mode) {
        this.mode = mode;
    }
    
    setSnapToGrid(enabled) {
        this.snapToGrid = enabled;
    }

    
    clear() {
        // Remove all components
        this.components.forEach(component => {
            component.remove();
        });
        this.components = [];

        this.clearConnections();
    }

    clearConnections() {
        // Remove all existing connections
        this.connections.forEach(connection => connection.remove());
        this.connections = [];
    }
}