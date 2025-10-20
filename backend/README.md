# Podcast Scheduler Pro - Backend

This directory contains the Node.js backend server for the Podcast Scheduler Pro application. It handles Google Calendar authentication and API interactions.

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A [Google Cloud Platform](https://console.cloud.google.com/) account

### 2. Google Cloud Project Setup

Before you can run the backend, you need to configure your application in the Google Cloud Console to get the necessary credentials.

1.  **Create a New Project:** Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project (e.g., "Podcast Scheduler API").

2.  **Enable the Google Calendar API:**
    - In your new project, navigate to **APIs & Services > Library**.
    - Search for "Google Calendar API" and click **Enable**.

3.  **Configure the OAuth Consent Screen:**
    - Go to **APIs & Services > OAuth consent screen**.
    - Choose **External** and click **Create**.
    - Fill in the required app information (app name, user support email, developer contact). You can leave most other fields blank for now. Click **Save and Continue**.
    - On the "Scopes" page, click **Add or Remove Scopes**. Find and add the following scopes:
        - `.../auth/calendar.events`
        - `.../auth/calendar.readonly`
    - Click **Update**, then **Save and Continue**.
    - On the "Test users" page, click **Add Users** and add the Google accounts of your hosts. While your app is in "Testing" mode, only these users can authorize the application. Click **Save and Continue**.

4.  **Create Credentials:**
    - Go to **APIs & Services > Credentials**.
    - Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
    - For **Application type**, select **Web application**.
    - Give it a name (e.g., "Web Client for Scheduler").
    - Under **Authorized redirect URIs**, click **+ ADD URI** and enter: `http://localhost:3001/auth/google/callback`
    - Click **Create**.

5.  **Copy Your Credentials:** A window will pop up showing your **Client ID** and **Client Secret**. Copy these values. You will need them in the next step.

### 3. Backend Configuration (Local Machine)

1.  **Install Dependencies:**
    - Open your terminal in the `backend` directory.
    - Run the command:
      ```bash
      npm install
      ```

2.  **Create `.env` file:**
    - In the `backend` directory, create a new file named `.env`.
    - Paste your **Client ID** and **Client Secret** from the previous step into the appropriate fields.

    Your `.env` file should look like this:
    ```
    GCP_CLIENT_ID="YOUR_GCP_CLIENT_ID.apps.googleusercontent.com"
    GCP_CLIENT_SECRET="YOUR_GCP_CLIENT_SECRET"
    REDIRECT_URI="http://localhost:3001/auth/google/callback"
    FRONTEND_URI="http://localhost:5173" # Or whatever port your frontend runs on
    PORT=3001
    ```

### 3b. Configuration in Google AI Studio (or other Web IDEs)

If you are running this project in a web-based environment like Google AI Studio, you have two options for setting your credentials.

#### Option 1: Using the Secrets Manager (Recommended)

This is the most secure method. Your environment variables are stored securely and are not visible in your project files.

1.  Look for a **Secrets** or **Environment Variables** tab in your AI Studio workspace (it might have a 🔑 key icon).
2.  Add a new secret for each of the variables required in the `.env` file.
    -   **Key:** `GCP_CLIENT_ID` | **Value:** `YOUR_GCP_CLIENT_ID.apps.googleusercontent.com`
    -   **Key:** `GCP_CLIENT_SECRET` | **Value:** `YOUR_GCP_CLIENT_SECRET`
    -   **Key:** `REDIRECT_URI` | **Value:** `http://localhost:3001/auth/google/callback` (You may need to update this with the preview URL provided by AI Studio)
    -   **Key:** `FRONTEND_URI` | **Value:** `http://localhost:5173` (You may need to update this with the preview URL provided by AI Studio)
    -   **Key:** `PORT` | **Value:** `3001`
3.  Once saved, the backend server will automatically have access to these variables when you run it. You do not need to create a `.env` file.

#### Option 2: Creating a `.env` File Manually

If you prefer to use a `.env` file or cannot find the Secrets Manager:

1.  In the **File Explorer** panel on the left, select the `backend` directory.
2.  Click the **"New File"** icon (usually looks like a page with a `+`) at the top of the file explorer.
3.  When prompted for a name, type exactly `.env` and press Enter.
4.  A new, empty file will open. Copy the snippet below and paste it into your new `.env` file.
5.  Fill in your actual **Client ID** and **Client Secret**.

```
GCP_CLIENT_ID="YOUR_GCP_CLIENT_ID.apps.googleusercontent.com"
GCP_CLIENT_SECRET="YOUR_GCP_CLIENT_SECRET"
REDIRECT_URI="http://localhost:3001/auth/google/callback"
FRONTEND_URI="http://localhost:5173" # Or whatever port your frontend runs on
PORT=3001
```

### 4. Running the Server

1.  **Start the server:**
    - In your terminal (still in the `backend` directory), run:
      ```bash
      npm start
      ```
    - You should see a message: `Backend server is running on http://localhost:3001`

The backend is now running! Keep this terminal window open. You can now run the frontend application, and it will be able to communicate with your server.
