# Firebase Storage Setup

## CORS Configuration for Image Uploads

If you're experiencing image upload failures, you need to configure CORS (Cross-Origin Resource Sharing) for your Firebase Storage bucket.

### Option 1: Using Google Cloud CLI (Recommended)

1. **Install Google Cloud SDK**
   - Download from: https://cloud.google.com/sdk/docs/install

2. **Configure gcloud to use your Firebase project**

   ```bash
   gcloud config set project mskweb-1db5c
   ```

3. **Apply CORS configuration**
   ```bash
   gsutil cors set cors.json gs://mskweb-1db5c.firebasestorage.app
   ```

### Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project `mskweb-1db5c`
3. Navigate to Storage > Rules
4. Update the rules to allow your domain:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if true;  // For testing only! Use authentication in production
    }
  }
}
```

### Option 3: Debugging Image Upload Issues

If uploads still fail:

1. **Open Developer Console** (F12)
2. **Go to Console tab**
3. **Try uploading an image**
4. **Look for logged messages** - you'll see:
   - "Starting image upload for file: ..."
   - "Storage path: ..."
   - "Uploading bytes..."
   - Any error messages shown

### Common Error Messages and Solutions

| Error                   | Solution                                                                          |
| ----------------------- | --------------------------------------------------------------------------------- |
| `Permission denied`     | Check Storage Rules in Firebase console. Update rules to allow writes.            |
| `unauthenticated`       | Enable anonymous authentication in Firebase Auth console or update Storage Rules. |
| `File must be an image` | Make sure you're uploading an actual image file (jpeg, png, gif, etc.)            |
| `File too large`        | Maximum file size is 5MB. Compress your image.                                    |
| `Storage error: ...`    | Check the specific error message in the browser console.                          |

### Storage Rules for Development

For quick testing, use these permissive rules (ONLY for development!):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### Enabling Anonymous Authentication (Optional)

1. Go to Firebase Console > Authentication
2. Click "Get Started"
3. Enable "Anonymous" provider
4. This allows users to upload without creating an account

---

**After making these changes, try uploading an image again and check the browser console for detailed error messages.**
