# Zodiac AR Application
Web AR prototype built using Mediapipe and Three.js.

## Tech Stack

- **AR Framework**: Mediapipe
- **Programming Language**: Typescript
- **UI Framework**: Next

## Quick start
In the root folder, run `npm i`.

`package.json`
  - `npm start`: Launches the app

### Requirements
- node 16+, npm 8+
- pm2

For further development documentation, please refer to [README-DEV.md](./README-DEV.md).

## Folder Structure
Here is a list of the most relevant folders containing the source code for the app.

```
/ZodiacAR
├── /frontend
│   └── /src
│       ├── /assets
│       ├── /components
│       ├── /three_components
│       ├── /constants
│       ├── /containers
│       ├── /pages
│       ├── /utils
│           └── /facemesh
│       └── /store
│           └── /translations
└── README.md
```
### Components

- **FaceTracker**: A component that handles face tracking using Mediapipe and displays the results.
- **DraggableSlider**: A slider component that allows users to drag a handle between different points.
- **SliderAnchor**: A sub-component of `DraggableSlider` that represents an anchor point on the slider.
- **Button**: A reusable button component with customizable styles and actions.

### Three Components

- **FaceMask**: A class containing the 3D face mask that can be applied to the user's face based on face landmarks.
- **Animals**: A class containing all 3D model of animals that can be placed in the scene and adjuts to face landmarks.
- **Postprocessing**: Effect composer and effects for the Three.js scene.

### Containers

- **LandingPage**: The landing page of the application, providing an overview and navigation options.
- **ARPage**: The main container for the AR experience, integrating various components and managing the overall AR flow.
