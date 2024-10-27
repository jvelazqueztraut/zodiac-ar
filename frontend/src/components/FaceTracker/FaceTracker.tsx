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

import { FilterTypes } from 'constants/ar-constants';

export interface FaceTrackerProps {
  isVisible: boolean;
  selectedFilter: FilterTypes | null;
}

export interface CanCapture {
  capture: () => void;
}

const defaultProps: Partial<FaceTrackerProps> = {};

const FaceTracker = forwardRef<CanCapture, FaceTrackerProps>(
  ({ isVisible, selectedFilter }, ref) => {
    useImperativeHandle(ref, () => ({
      capture() {
        takeSnapshot();
      },
    }));

    // Refs to the video and canvas elements
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sceneRef = useRef<SceneManager | null>(null);

    // State for the FaceLandmarker, canvas context, and webcam status
    const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
      null
    );
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
      const stream = videoRef.current.srcObject as MediaStream;
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

      // If landmarks are detected, send them to scene manager
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        sceneRef.current.onLandmarks(
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

      // TODO Redraw canvas for snapshot

      // Convert the canvas content to a PNG image and trigger a download
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'snapshot.png'; // Set the filename for the snapshot
      link.click(); // Trigger the download
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

    // Update the scene assets when the selectedAnchor changes
    useEffect(() => {
      if (sceneRef.current) {
        sceneRef.current.updateSceneFilter(selectedFilter);
      }
    }, [selectedFilter]);

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
