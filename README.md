
# Face Recognition Attendance System

This project uses face-api.js for facial recognition. Before running the application, you need to download the face-api.js models.

## Setup Instructions

### 1. Download Face API Models

Download the following models from the face-api.js GitHub repository and place them in the `public/models` directory:

- ssd_mobilenetv1_model-weights_manifest.json
- ssd_mobilenetv1_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1

You can download these models from:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

### 2. Run the Application

```bash
npm run dev
```

## Usage

1. Register a user account
2. Go to Face Registration page to register your face
3. Use face login to sign in quickly
4. Use attendance capture to mark attendance

## Features

- Face detection and recognition
- Attendance tracking
- User management
- Reports and analytics
