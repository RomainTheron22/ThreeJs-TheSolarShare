
# ThreeJS-TheSolarShare

## **About the Project**
This project is a **representation of the artwork The Solar Share**, an innovative and artistic exploration of sustainable solar energy flows. The original work can be found on the [official website](https://tss.earth). 

The interactive 3D visualization allows users to engage with the key concepts of The Solar Share by adjusting parameters and exploring its detailed components.

---

## **Features**
1. **Interactive Parameters**  
   - Users can adjust **temperature**, **luminosity**, and **pH** to see how these parameters influence spirulina saturation.
   - The aquarium's saturation and visual representation change in real-time based on the parameter settings.

2. **Dynamic Aquarium Shading**  
   - The saturation effect is achieved using a **custom shader** adapted from a ShaderToy example: [ShaderToy](https://www.shadertoy.com/view/tdG3Rd). 
   - Adjusting parameters changes the shader's color values dynamically, giving a vivid visual cue of the spirulina density.

3. **Object Tooltips**  
   - Hovering over objects (e.g., the main structure and chariots) reveals additional information about their purpose and functionality through interactive tooltips.

---

## **How to Run the Project**

### **1. Clone the Repository**
To get started, clone the repository from GitHub:

```bash
git clone https://github.com/VotreNomGitHub/ThreeJS-TheSolarShare.git
```

### **2. Navigate to the Project Directory**
Change to the directory containing the project files:

```bash
cd ThreeJS-TheSolarShare
```

### **3. Install a Local Server**
The project requires a local server to serve the files properly. You can use `npx serve`:

```bash
npx serve
```

> If `npx` is not installed, you can install it by installing Node.js from [Node.js Official Website](https://nodejs.org).

### **4. Open the Application**
After running `npx serve`, you’ll receive a URL (e.g., `http://localhost:3000`). Open this URL in your web browser to view the project.

---

## **Acknowledgments**
- **The Solar Share** artwork concept from [Disnovation.org](https://tss.earth).  
- Shader inspiration from [ShaderToy](https://www.shadertoy.com/view/tdG3Rd).  
- Powered by [Three.js](https://threejs.org).
