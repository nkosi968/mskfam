# MSK FAM - Carpentry & Projects

## Project info

A professional carpentry and custom projects website showcasing MSK FAM's services in furniture design, kitchen units, bathroom vanities, and more.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

You can work locally using your own IDE by cloning this repository and pushing changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase (Firestore & Storage)

## Firebase Setup

This project uses Firebase for data storage. To set up Firebase:

1. **Install Firebase CLI** (if not already installed):
   ```sh
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```sh
   firebase login
   ```

3. **Initialize Firebase in your project**:
   ```sh
   firebase init
   ```
   - Select "Firestore" and "Storage" when prompted
   - Choose your existing Firebase project

4. **Deploy Firebase Rules**:
   ```sh
   firebase deploy --only firestore:rules,storage
   ```

5. **Update Firebase Configuration**:
   - The Firebase config is already set up in `src/lib/firebase.ts`
   - Make sure the project ID matches your Firebase project

## Admin Panel

- Access the admin panel at `/admin704`
- Add products with name, description, price, and images
- Images can be uploaded from your device or added via URL
- Products are stored in Firestore and images in Firebase Storage

## How can I deploy this project?

You can deploy this project to any hosting service that supports Node.js applications. Popular options include:

- Vercel
- Netlify
- GitHub Pages
- AWS
- DigitalOcean

For Vite-based projects, build the application with `npm run build` and deploy the `dist` folder to your hosting provider.
