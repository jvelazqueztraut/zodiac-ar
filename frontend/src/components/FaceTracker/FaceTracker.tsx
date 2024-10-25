import { InputImage, NormalizedLandmarkList } from '@mediapipe/face_mesh';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { AnimatePresence } from 'framer-motion';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { transformLandmarks } from 'utils/facemesh/landmarks_helpers';
import { fadeMotionProps } from 'utils/styles/animations';
import SceneManager from 'utils/three_components/scene_manager';

import * as Styled from './FaceTracker.styles';

export interface FaceTrackerProps {
  isVisible: boolean;
}

export interface CanCapture {
  capture: () => void;
}

const defaultProps: Partial<FaceTrackerProps> = {};

const FaceTracker = forwardRef<CanCapture, FaceTrackerProps>(
  ({ isVisible }, ref) => {
    useImperativeHandle(ref, () => ({
      capture() {
        takeSnapshot();
      },
    }));

    // Refs to the video and canvas elements
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);

    // State for the FaceLandmarker, canvas context, and webcam status
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    // const [ctx, setCtx] = useState(null);
    const [webcamRunning, setWebcamRunning] = useState(false);
    const [detectionRunning, setDetectionRunning] = useState(false);

    // Initialize the FaceLandmarker when the component mounts
    useEffect(() => {
      initializeFaceLandmarker();
    }, []);

    // Start the webcam once the FaceLandmarker is initialized
    useEffect(() => {
      if (faceLandmarker) {
        startWebcam();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [faceLandmarker]);

    // Set canvas dimensiones once webcam is running
    useEffect(() => {
      if (detectionRunning) {
        setCanvasDimensions();
        initializeScene();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detectionRunning]);

    // Function to initialize the FaceLandmarker and set up the canvas context
    const initializeFaceLandmarker = async () => {
      try {
        // Load the necessary files for the FaceLandmarker
        const filesetResolver = await FilesetResolver.forVisionTasks(
          '/models/wasm'
        );

        // Create the FaceLandmarker instance with the specified options
        const faceLandmarkerInstance = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: '/models/face_landmarker.task', // Path to the model file
              delegate: 'GPU', // Use GPU for faster processing
            },
            outputFaceBlendshapes: true, // Enable face blendshapes output
            runningMode: 'VIDEO', // Set running mode to video for real-time processing
            numFaces: 1, // Detect one face at a time
          }
        );

        // Save the FaceLandmarker instance to the state
        setFaceLandmarker(faceLandmarkerInstance);
        console.log('FaceLandmarker initialized:', faceLandmarkerInstance);

        // Initialize the canvas context
        // if (canvasRef.current) {
        //   const context = canvasRef.current.getContext('2d');
        //   setCtx(context);
        //   console.log('Canvas context initialized:', context);
        // }
      } catch (error) {
        console.error('Error initializing FaceLandmarker:', error);
      }
    };

    // Function to start the webcam and begin face detection
    const startWebcam = async () => {
      console.log('Attempting to start webcam...');

      // Check if the FaceLandmarker is ready
      if (!faceLandmarker) {
        alert('Face Landmarker is still loading. Please try again.');
        console.error('Face Landmarker not initialized.');
        return;
      }

      const constraints = {
        video: true, // Request access to the user's webcam
      };

      try {
        // Get the video stream from the user's webcam
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream; // Set the video source to the webcam stream
        videoRef.current.style.display = 'block'; // Show the video element
        setWebcamRunning(true); // Update the state to indicate that the webcam is running
        console.log('Webcam stream started.');

        // Start face detection once the video data is loaded
        videoRef.current.addEventListener('loadeddata', () => {
          console.log('Video data loaded, starting detection...');
          setDetectionRunning(true); // Set detection running state to true
          detect(); // Start the detection loop
        });
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    // Function to stop the webcam and face detection
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stopWebcam = () => {
      const stream = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop all tracks (video and audio)
      }
      videoRef.current.style.display = 'none'; // Hide the video element
      setWebcamRunning(false); // Update the state to indicate that the webcam is stopped
      setDetectionRunning(false); // Stop the detection loop
      console.log('Webcam stopped.');
    };

    // Function to initialize the canvas dimensions
    const setCanvasDimensions = () => {
      // Set canvas dimensions to video dimensions
      if (canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth; // Set canvas width to video width
        canvasRef.current.height = videoRef.current.videoHeight; // Set canvas height to video height
        console.log(
          'Canvas dimensions set:',
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    };

    // Function to draw the detected face landmarks on the canvas
    // const drawLandmarks = (landmarks, ctx, color) => {
    //   ctx.fillStyle = color; // Set the color for the landmarks
    //   ctx.lineWidth = 1; // Set the line width for drawing

    //   // Loop through each landmark and draw a point on the canvas
    //   landmarks.forEach(landmark => {
    //     const x = landmark.x * canvasRef.current.width; // Scale x-coordinate to canvas width
    //     const y = landmark.y * canvasRef.current.height; // Scale y-coordinate to canvas height
    //     ctx.beginPath();
    //     ctx.arc(x, y, 1, 0, 1 * Math.PI); // Draw a small circle at the landmark position
    //     ctx.fill(); // Fill the circle with the specified color
    //   });
    // };

    // Function to continuously detect face landmarks in the video stream
    const detect = async () => {
      // Check if the necessary elements and states are ready for detection
      if (!faceLandmarker || !videoRef.current || !detectionRunning) {
        console.log('Detection prerequisites not met or detection stopped.');
        return;
      }

      // Ensure the video and canvas have valid dimensions
      if (
        videoRef.current.videoWidth === 0 ||
        videoRef.current.videoHeight === 0 ||
        canvasRef.current.width === 0 ||
        canvasRef.current.height === 0
      ) {
        console.log('Invalid video or canvas dimensions.');
        return;
      }

      // Run the face landmark detection for the current video frame
      const results = faceLandmarker.detectForVideo(
        videoRef.current,
        performance.now()
      );

      // Clear the canvas before drawing new landmarks
      // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // If landmarks are detected, draw them on the canvas
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        // results.FaceTrackers.forEach(landmarks => {
        //   console.log("Detected landmarks:", landmarks);
        //   drawLandmarks(landmarks, ctx, '#ffffff'); // Draw the landmarks in white
        // });
        onLandmarks(
          videoRef.current,
          transformLandmarks(results.faceLandmarks[0])
        );
      } else {
        console.log('No landmarks detected in this frame.');
      }

      // Continue the detection loop if the webcam is still running
      if (webcamRunning) {
        requestAnimationFrame(detect); // Schedule the next detection
      }
    };

    // Function to take a snapshot of the current video frame and landmarks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const takeSnapshot = () => {
      if (!canvasRef.current) return;
      // TODO: fix snapshot
      console.log('Taking snapshot');

      // Redraw the video frame and the landmarks on the canvas
      // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      // ctx.drawImage(
      //   videoRef.current,
      //   0,
      //   0,
      //   canvasRef.current.width,
      //   canvasRef.current.height
      // );

      // Draw landmarks again before taking the snapshot
      // if (faceLandmarker) {
      //   const results = faceLandmarker.detectForVideo(
      //     videoRef.current,
      //     performance.now()
      //   );

      //   if (results.FaceTrackers && results.FaceTrackers.length > 0) {
      //     // results.FaceTrackers.forEach(landmarks => {
      //     //   drawLandmarks(landmarks, ctx, '#00FF00'); // Draw the landmarks in green for the snapshot
      //     // });
      //   }
      // }

      // Convert the canvas content to a PNG image and trigger a download
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'snapshot.png'; // Set the filename for the snapshot
      link.click(); // Trigger the download
    };

    const onLandmarks = (
      image: InputImage,
      landmarks: NormalizedLandmarkList
    ) => {
      sceneRef.current.onLandmarks(image, landmarks);
    };

    const animate = () => {
      requestAnimationFrame(animate);
      sceneRef.current.resize(
        videoRef.current.clientWidth,
        videoRef.current.clientHeight
      );
      sceneRef.current.animate();
    };

    const initializeScene = () => {
      const useOrtho = true;
      const debug = false;
      sceneRef.current = new SceneManager(canvasRef.current, debug, useOrtho);

      animate();
    };

    // Start the detection loop if detectionRunning is true
    useEffect(() => {
      if (detectionRunning) {
        detect();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detectionRunning]);

    return (
      <AnimatePresence>
        {isVisible && (
          <Styled.Wrapper {...fadeMotionProps}>
            {/* Video element for webcam feed */}
            <video ref={videoRef} id="webcam" autoPlay playsInline></video>
            {/* Canvas element for drawing face landmarks */}
            <canvas ref={canvasRef}></canvas>
          </Styled.Wrapper>
        )}
      </AnimatePresence>
    );
  }
);

FaceTracker.displayName = 'FaceTracker';
FaceTracker.defaultProps = defaultProps;

export default FaceTracker;