
# Face Recognition Attendance System

This project uses face-api.js for facial recognition and Supabase for backend services.

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

### 2. Supabase Configuration

This project uses Supabase for backend services. To run the project locally:

1. Create a copy of the `.env.example` file and name it `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Create an account at [Supabase](https://supabase.com/) if you don't have one
   - Create a new project
   - Go to Project Settings > API
   - Copy the "Project URL" and "anon/public" key
   - Paste them in your `.env` file:
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

3. Set up your Supabase database schema:
   - Create a `profiles` table with the following columns:
     - `id` (UUID, primary key, references auth.users.id)
     - `name` (text)
     - `email` (text)
     - `avatar_url` (text, nullable)
     - `face_encoding` (text, nullable)
     - `employee_id` (text, nullable)
     - `department` (text, nullable)
     - `notes` (text, nullable)
   - Enable Row Level Security (RLS) on the table
   - Create appropriate RLS policies for the table

### 3. Run the Application

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

## Development Notes

- Environment variables for Supabase are configured in the `.env` file
- For security reasons, make sure not to commit the `.env` file to version control
- The project will fall back to demo Supabase credentials if environment variables are not found
