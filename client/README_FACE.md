Face verification & hero image instructions

1) Place your hero image
- Put your hero image file (the one you pasted in chat) at:
  client/public/images/hero-people.jpg
- The LandingPage will load this image automatically.

2) Face verification (frontend placeholder)
- The Login page now has a "Face" tab which opens your webcam and shows a preview.
- This is a frontend-only placeholder. To test:
  - Start the dev server: in PowerShell run:

    cd c:\Users\saman\Desktop\hackathon\client; npm start

  - Open the app, go to /login, choose Face, and click "Open Camera".

3) Backend OTP
- OTP endpoints have been disabled (return 410). Face verification capture should be wired to a backend face-verification endpoint later.

4) Next steps for integration
- Use OpenCV or a face recognition service on the server to verify captured frames.
- When ready, implement a POST /api/auth/face-verify endpoint that accepts an image and returns a JWT on success.

If you want, I can add a small server endpoint that accepts base64 image and returns a fake token for development.
