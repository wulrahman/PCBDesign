// Define auto-route function
function autoRoute() {
      // Perform auto-routing
    pcbLayout.autoRoute();
}

// Auto-route button click event listener
document.getElementById("auto-route-btn").addEventListener("click", autoRoute);

const pcbLayout = new AutoRoute({
    container: "pcb-container",
    width: 600,
    height: 600
});

// // Assuming you have an XML file input with id "xml-file-input"
// const fileInput = document.getElementById('xml-file-input');

// fileInput.addEventListener('change', (event) => {
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (event) => {
//         const xmlContent = event.target.result;
//         parseCommands(xmlContent);
//     };

//     reader.readAsText(file);
// });


// function parseCommands(commands) {
//     // Split commands by newline
//     const lines = commands.split('\n');

//     // Process each command
//     lines.forEach(line => {
//         // Ignore lines that start with '//'
//         if (line.trim().startsWith('//')) return;

//         const command = line.split('//')[0].trim(); // Remove everything after '//' (if any) and trim whitespace

//         const match = command.match(/^(\w+)\((.*)\)$/);
//         if (match) {
//             const commandName = match[1];
//             const attributeStr = match[2];

//             // Extract attribute key-value pairs
//             const attributes = {};
//             const attributePairs = attributeStr.split(/,(?![^()]*\))/); // Split by comma, but ignore commas inside parentheses
//             attributePairs.forEach(pair => {
//                 const [key, value] = pair.split('=');
//                 attributes[key.trim()] = value.replace(/^["'](.*)["']$/, '$1').trim(); // Remove surrounding quotes
//             });

//             // Process commands
//             switch (commandName) {
//                 case 'add':
//                     // Handle add command
//                     if (attributes.type && attributes.x && attributes.y && attributes.size) {
//                         addComponent(attributes.type, parseInt(attributes.x), parseInt(attributes.y), { size: parseInt(attributes.size) });
//                     } else if (attributes.type && attributes.x && attributes.y && attributes.text) {
//                         addComponent(attributes.type, parseInt(attributes.x), parseInt(attributes.y), { text: attributes.text });
//                     } else if (attributes.type && attributes.x && attributes.y && attributes.width && attributes.height) {
//                         addComponent(attributes.type, parseInt(attributes.x), parseInt(attributes.y), { width: parseInt(attributes.width), height: parseInt(attributes.height) });
//                     } else if (attributes.type && attributes.x && attributes.y && attributes.outerRadius) {
//                         // Add round pad
//                         addComponent(attributes.type, parseInt(attributes.x), parseInt(attributes.y), { outerRadius: parseInt(attributes.outerRadius), innerRadius: parseInt(attributes.innerRadius) });
//                     } else if (attributes.type && attributes.x && attributes.y && attributes.width && attributes.height) {
//                         // Add square pad
//                         addComponent(attributes.type, parseInt(attributes.x), parseInt(attributes.y), { width: parseInt(attributes.width), height: parseInt(attributes.height) });
//                     } else {
//                         console.error('Invalid number of arguments for "add" command.');
//                     }
//                     break;
//                 case 'connect':
//                     // Handle connect command
//                     if (attributes.component1 && attributes.component2) {
//                         connectComponents(parseInt(attributes.component1), parseInt(attributes.component2));
//                     } else {
//                         console.error('Invalid arguments for "connect" command.');
//                     }
//                     break;
//                 // Add more commands as needed
//                 default:
//                     console.error(`Unknown command: ${commandName}`);
//                     break;
//             }
//         } else {
//             console.error('Invalid command format.');
//         }
//     });
// }

function parseCommands(xmlContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  const commands = xmlDoc.getElementsByTagName("command");

  for (let i = 0; i < commands.length; i++) {
      const commandNode = commands[i];
      const commandType = commandNode.getAttribute("type");
      const attributes = {};

      const attributeNodes = commandNode.getElementsByTagName("attribute");
      for (let j = 0; j < attributeNodes.length; j++) {
          const attributeNode = attributeNodes[j];
          const key = attributeNode.getAttribute("key");
          const value = attributeNode.getAttribute("value");
          attributes[key] = value;
      }

      switch (commandType) {
          case 'add':
              // Handle add command
              addComponent(attributes.type, parseInt(attributes.x), parseInt(attributes.y), attributes);
              break;
          case 'connect':
              // Handle connect command
              connectComponents(parseInt(attributes.component1), parseInt(attributes.component2));
              break;
          // Add more commands as needed
          default:
              console.error(`Unknown command type: ${commandType}`);
              break;
      }
  }
}


const editor = document.getElementById("editor");
editor.addEventListener("input", () => {
      const commands = editor.value;
      pcbLayout.clear(); // Clear existing layout
      parseCommands(commands); // Parse and execute commands
});

  // Parse and execute commands
parseCommands( editor.value);

function connectComponents(componentId1, componentId2) {

    // Find components by their IDs
    const component1 = pcbLayout.components[componentId1]; // Adjust index for array
    const component2 = pcbLayout.components[componentId2]; // Adjust index for array

    if (component1 && component2) {
        pcbLayout.autoConnect(component1, component2)
    } else {
        console.error('One or both components not found.');
    }
}


function parseAttributes(attributeStr) {
    const attributes = {};
    // Extract attribute key-value pairs
    const attributePairs = attributeStr.split(',').map(pair => pair.trim());
    // Process each pair
    attributePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        attributes[key.trim().toLowerCase()] = value.trim();
    });
    return attributes;
}

function addComponent(type, x, y, attributes) {
    // Add component logic based on type and attributes

    var width, height;
    switch (type) {
        case 'pad':
            // Example: Add a pad component
            const size = parseInt(attributes.size);
            pcbLayout.createPad({ x, y, size });
            break;
        case 'outline':
            // Example: Add an outline component
            width = parseInt(attributes.width);
            height = parseInt(attributes.height);
            pcbLayout.createOutline({ x, y, width, height });
            break;
        case 'label':
            // Example: Add a label component
            const text = attributes.text;
            pcbLayout.createLabel({ x, y, text });
            break;
        case 'roundpad':
            // Example: Add a round pad component
            const innerRadius = parseInt(attributes.innerRadius);
            const outerRadius = parseInt(attributes.outerRadius);
            pcbLayout.createRoundPad({ x, y, innerRadius, outerRadius });
            break;
        case 'squarepad':
            // Example: Add a square pad component
            width = parseInt(attributes.width);
            height = parseInt(attributes.height);
            pcbLayout.createSquarePad({ x, y, width, height });
            break;
        default:
            console.error(`Unknown component type: ${type}`);
            break;
    }
}