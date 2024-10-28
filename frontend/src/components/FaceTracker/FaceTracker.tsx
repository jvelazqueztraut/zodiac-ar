import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { AnimatePresence } from 'framer-motion';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import SceneManager from 'three_components/scene_manager';

import { transformLandmarks } from 'utils/facemesh/landmarks_helpers';

import * as Styled from './FaceTracker.styles';

import { FilterTypes } from 'constants/ar-constants';

export interface FaceTrackerProps {
  isVisible: boolean;
  selectedFilter: FilterTypes | null;
  setIsReady: (isReady: boolean) => void;
  motion?: any;
}

export interface CanCapture {
  capture: () => void;
  close: () => void;
}

const defaultProps: Partial<FaceTrackerProps> = {};

const FaceTracker = forwardRef<CanCapture, FaceTrackerProps>(
  ({ isVisible, selectedFilter, setIsReady, motion }, ref) => {
    useImperativeHandle(ref, () => ({
      capture() {
        takeSnapshot();
      },
      close() {
        stopWebcam();
      },
    }));

    // Refs to the video and canvas elements
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvas3DRef = useRef<HTMLCanvasElement | null>(null);
    const sceneRef = useRef<SceneManager | null>(null);

    // Aux canvas for cropping video
    const canvas2DRef = useRef<HTMLCanvasElement | null>(null);

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
        setIsReady(true);
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
      if (canvas2DRef.current && canvas3DRef.current) {
        // canvas2DRef.current.width = videoRef.current.videoWidth; // Set canvas width to video width
        // canvas2DRef.current.height = videoRef.current.videoHeight; // Set canvas height to video height
        canvas2DRef.current.width = window.innerWidth;
        canvas2DRef.current.height = window.innerHeight;
        console.log(
          'Canvas 2D dimensions set:',
          canvas2DRef.current.width,
          canvas2DRef.current.height
        );
        // Set Canvas 3D dimensions to cropped video dimensions
        canvas3DRef.current.width = canvas2DRef.current.width; //canvas2DRef.current.width; // Set canvas width to video width
        canvas3DRef.current.height = canvas2DRef.current.height; //canvas2DRef.current.height; // Set canvas height to video height
        console.log(
          'Canvas 3D dimensions set:',
          canvas3DRef.current.width,
          canvas3DRef.current.height
        );
      }
    };

    // Function to continuously detect face landmarks in the video stream
    const detect = async () => {
      // Check if the necessary elements and states are ready for detection
      if (
        !faceLandmarker ||
        !videoRef.current ||
        !canvas2DRef.current ||
        !detectionRunning
      ) {
        console.log('Detection prerequisites not met or detection stopped.');
        return;
      }

      // Ensure the video and canvas have valid dimensions
      if (
        videoRef.current.videoWidth === 0 ||
        videoRef.current.videoHeight === 0 ||
        canvas2DRef.current.width === 0 ||
        canvas2DRef.current.height === 0
      ) {
        console.log('Invalid video dimensions.');
        return;
      }

      // Adjust the video dimensions to fit the canvas
      let offsetX = 0;
      let offsetY = 0;
      let scale = 1;
      if (
        videoRef.current.videoWidth / videoRef.current.videoHeight >
        innerWidth / innerHeight
      ) {
        scale = innerHeight / videoRef.current.videoHeight;
        offsetX = (innerWidth - videoRef.current.videoWidth * scale) / 2;
      } else {
        scale = innerWidth / videoRef.current.videoWidth;
        offsetY = (innerHeight - videoRef.current.videoHeight * scale) / 2;
      }
      const auxCanvasCtx = canvas2DRef.current.getContext('2d');
      auxCanvasCtx.drawImage(
        videoRef.current,
        offsetX,
        offsetY,
        videoRef.current.videoWidth * scale,
        videoRef.current.videoHeight * scale
      );

      // Send video frame to the 3D scene
      sceneRef.current.onFrame(canvas2DRef.current);

      // Run the face landmark detection for the current video frame
      const results = faceLandmarker.detectForVideo(
        canvas2DRef.current,
        performance.now()
      );

      // If landmarks are detected for first face, send them to scene manager
      sceneRef.current.onLandmarks(
        transformLandmarks(results.faceLandmarks[0] ?? null)
      );

      // Continue the detection loop if the webcam is still running
      if (webcamRunning) {
        requestAnimationFrame(detect); // Schedule the next detection
      }
    };

    // Function to take a snapshot of the current video frame and landmarks
    const takeSnapshot = () => {
      if (!canvas3DRef.current) return;
      console.log('Taking snapshot');
      // Convert the canvas content to a PNG image and trigger a download
      const dataUrl = canvas3DRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'snapshot.png'; // Set the filename for the snapshot
      link.click(); // Trigger the download
    };

    const animate = () => {
      if (!canvas2DRef.current) {
        console.log('Invalid canvas, stop scene animation.');
        return;
      }
      requestAnimationFrame(animate);
      sceneRef.current.resize(
        canvas2DRef.current.width,
        canvas2DRef.current.height
      );
      sceneRef.current.animate();
    };

    const initializeScene = () => {
      const useOrtho = true;
      const debug = false;
      sceneRef.current = new SceneManager(canvas3DRef.current, debug, useOrtho);

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
          <Styled.Wrapper {...motion}>
            {/* Video element for webcam feed */}
            <video ref={videoRef} id="webcam" autoPlay playsInline></video>
            {/* Canvas element for 3d scene */}
            <canvas ref={canvas3DRef}></canvas>
          </Styled.Wrapper>
        )}
        {/* Aux canvas element for cropping video */}
        <Styled.HiddenCanvas ref={canvas2DRef} />
      </AnimatePresence>
    );
  }
);

FaceTracker.displayName = 'FaceTracker';
FaceTracker.defaultProps = defaultProps;

export default FaceTracker;
