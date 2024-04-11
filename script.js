const predefinedComponents = [
  { width: 50, height: 50, color: "blue" },
  { width: 30, height: 70, color: "green" },
  // Add more predefined components as needed
];

// Initialize PCBLayout instance
const pcbLayout = new PCBLayout({
  container: "pcb-container",
  width: 800,
  height: 600,
  predefinedComponents: predefinedComponents
});

// Example: Start adding the first predefined component when the user clicks on the canvas
document.getElementById("pcb-container").addEventListener("click", () => {
  pcbLayout.startAddingComponent(0); // Index of the predefined component to add
});

// Example: Add a component to the PCB
const component = pcbDesign.createComponent({
  x: 100,
  y: 100,
  width: 50,
  height: 50
});

// Example: Add a connection between two components
const connection = pcbDesign.createConnection({
  start: { x: 150, y: 150 },
  end: { x: 200, y: 200 }
});

// Example: Customize PCB layout appearance
pcbDesign.setGridVisible(true); // Show grid
pcbDesign.setSnapToGrid(true); // Enable snap to grid
pcbDesign.setGridSize(20); // Set grid size
