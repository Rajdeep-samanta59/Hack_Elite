import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  // navigation is handled in AuthContext after login; OTP flow reloads the page
  const { login, biometricLogin } = useAuth();
  const [loginMethod, setLoginMethod] = useState('email'); // email, face
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [usingBackend, setUsingBackend] = useState(false);
  const [backendUrl] = useState(() => {
    if (process.env.REACT_APP_FACE_SERVICE_URL) return process.env.REACT_APP_FACE_SERVICE_URL;
    const host = (window.location && window.location.hostname) ? window.location.hostname : '127.0.0.1';
    const resolvedHost = host === 'localhost' ? '127.0.0.1' : host; // prefer IPv4 loopback to avoid odd resolutions
    return `http://${resolvedHost}:8001`;
  });
  const imgLoadedRef = React.useRef(false);
  const imgLoadTimerRef = React.useRef(null);
  const backendRetryTimerRef = React.useRef(null);
  const backendPollRef = React.useRef(null);
  const backendHandledSuccessRef = React.useRef(false);
  const snapshotIntervalRef = React.useRef(null);
  const lastObjectUrlRef = React.useRef(null);
  const attachBackendImage = React.useCallback(() => {
    const img = document.querySelector('#face-video-img');
    if (!img) return;
    setUsingBackend(true);
    // Clear prior listeners/timers
    img.onload = () => {
      imgLoadedRef.current = true;
      if (backendRetryTimerRef.current) {
        clearTimeout(backendRetryTimerRef.current);
        backendRetryTimerRef.current = null;
      }
      // If snapshot polling was active, stop it once streaming works
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
        snapshotIntervalRef.current = null;
      }
      toast.dismiss('face-stream');
    };
    img.onerror = () => {
      // Retry without switching to local webcam
      if (!backendRetryTimerRef.current) {
        toast.loading('Connecting to face detection…', { id: 'face-stream' });
      }
      backendRetryTimerRef.current = setTimeout(() => {
        // After two flips, fall back to snapshot polling mode
        const attemptCount = (img.dataset.errCount ? parseInt(img.dataset.errCount, 10) : 0) + 1;
        img.dataset.errCount = String(attemptCount);
        if (attemptCount >= 2) {
          // Start polling snapshots and paint into the <img>
          if (!snapshotIntervalRef.current) {
            snapshotIntervalRef.current = setInterval(async () => {
              try {
                const res = await fetch(`${backendUrl}/snapshot.jpg?t=${Date.now()}`, {
                  cache: 'no-store'
                });
                if (!res.ok) return;
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
                lastObjectUrlRef.current = url;
                img.src = url;
                imgLoadedRef.current = true;
                toast.dismiss('face-stream');
              } catch (_) {}
            }, 200);
          }
        } else {
          // Flip between stream endpoints
          let url;
          if (!img.src || img.src.includes('/stream.mjpg')) {
            url = `${backendUrl}/video_feed?t=${Date.now()}`;
          } else {
            url = `${backendUrl}/stream.mjpg?t=${Date.now()}`;
          }
          img.src = url;
        }
      }, 800);
    };
    // Prefer the alternate extension first to avoid ad blockers
    img.src = `${backendUrl}/stream.mjpg?t=${Date.now()}`;
  }, [backendUrl]);

  // Helpers for face capture → biometric template hashing (client-side)
  const toHex = React.useCallback((buffer) => {
    const bytes = new Uint8Array(buffer);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      const h = bytes[i].toString(16).padStart(2, '0');
      hex += h;
    }
    return hex;
  }, []);

  const getDeviceFingerprint = React.useCallback(async () => {
    const scr = window.screen || { width: 0, height: 0, colorDepth: 0 };
    const parts = [
      navigator.userAgent || '',
      `${scr.width || 0}x${scr.height || 0}@${scr.colorDepth || 0}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    ].join('|');
    const enc = new TextEncoder().encode(parts);
    if (window.crypto?.subtle && window.crypto.subtle.digest) {
      const digest = await window.crypto.subtle.digest('SHA-256', enc);
      return toHex(digest);
    }
    // Fallback lightweight hash
    let h = 2166136261 >>> 0;
    for (let i = 0; i < enc.length; i++) {
      h ^= enc[i];
      h = Math.imul(h, 16777619);
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }, [toHex]);

  const captureFrameTemplate = React.useCallback(async () => {
    const video = document.querySelector('#face-video');
    const img = document.querySelector('#face-video-img');
    const sourceEl = video || img;
    if (!sourceEl) throw new Error('Camera stream not available');
    // Wait until the media has dimensions
    if (video) {
      if (!video.videoWidth || !video.videoHeight) {
        await new Promise((resolve) => {
          const onLoaded = () => {
            video.removeEventListener('loadeddata', onLoaded);
            resolve();
          };
          video.addEventListener('loadeddata', onLoaded, { once: true });
        });
      }
    } else if (img) {
      if (!img.complete || img.naturalWidth === 0) {
        await new Promise((resolve) => {
          const onLoad = () => {
            img.removeEventListener('load', onLoad);
            resolve();
          };
          img.addEventListener('load', onLoad, { once: true });
        });
      }
    }
    const canvas = document.createElement('canvas');
    // Downscale to stabilize hashing and reduce variance
    const targetWidth = 256;
    const width = video ? video.videoWidth : (img?.naturalWidth || targetWidth);
    const height = video ? video.videoHeight : (img?.naturalHeight || targetWidth);
    const aspect = height / (width || 1);
    canvas.width = targetWidth;
    canvas.height = Math.max(1, Math.round(targetWidth * aspect));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(sourceEl, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    if (window.crypto?.subtle && window.crypto.subtle.digest) {
      const digest = await window.crypto.subtle.digest('SHA-256', imageData);
      return toHex(digest);
    }
    // Fallback lightweight hash over pixels
    let h = 2166136261 >>> 0;
    for (let i = 0; i < imageData.length; i++) {
      h ^= imageData[i];
      h = Math.imul(h, 16777619);
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }, [toHex]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email, password: formData.password });
      await login({
        email: formData.email,
        password: formData.password
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleBiometricLogin = async () => {
  //   setLoading(true);

  //   try {
  //     // Simulate biometric authentication
  //     const biometricTemplate = 'mock_biometric_template_' + Date.now();
  //     await biometricLogin({ biometricTemplate });
  //   } catch (error) {
  //     toast.error('Biometric authentication failed. Please try email login.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Face verification placeholder: opens webcam preview; integration (OpenCV) will be added later
  const startCamera = async () => {
    try {
      setCameraOpen(true);
      // Force backend mode. No automatic fallback to local webcam.
      const video = document.querySelector('#face-video');
      setUsingBackend(true);
      fetch(`${backendUrl}/start`, { method: 'POST' }).catch(() => {});
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
        video.srcObject = null;
      }
      imgLoadedRef.current = false;
      // Defer actual image attachment until the <img> is mounted
      setTimeout(() => attachBackendImage(), 0);
      if (imgLoadTimerRef.current) clearTimeout(imgLoadTimerRef.current);
      imgLoadTimerRef.current = setTimeout(() => {
        if (!imgLoadedRef.current) {
          toast.error('Face service did not connect. Ensure http://127.0.0.1:8001/video_feed is working and try again.');
        }
      }, 6000);
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Could not open the camera. Please allow camera access.');
    }
  };

  const stopCamera = React.useCallback(() => {
    setCameraOpen(false);
    const video = document.querySelector('#face-video');
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      video.srcObject = null;
    }
    const img = document.querySelector('#face-video-img');
    if (img) {
      img.src = '';
      img.onload = null;
      img.onerror = null;
    }
    if (imgLoadTimerRef.current) {
      clearTimeout(imgLoadTimerRef.current);
      imgLoadTimerRef.current = null;
    }
    if (backendRetryTimerRef.current) {
      clearTimeout(backendRetryTimerRef.current);
      backendRetryTimerRef.current = null;
    }
    if (backendPollRef.current) {
      clearInterval(backendPollRef.current);
      backendPollRef.current = null;
    }
    if (snapshotIntervalRef.current) {
      clearInterval(snapshotIntervalRef.current);
      snapshotIntervalRef.current = null;
    }
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
    backendHandledSuccessRef.current = false;
    // Also notify backend to stop if it was used
    fetch(`${backendUrl}/stop`, { method: 'POST' }).catch(() => {});
  }, [backendUrl]);

  // Removed old fallback handler; we now surface a clear error toast if the stream doesn't connect.

  // Safety: whenever camera is open and we're not using backend, ensure local webcam is attached
  React.useEffect(() => {
    if (!cameraOpen || usingBackend) return;
    const video = document.querySelector('#face-video');
    if (video && !video.srcObject) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((e) => {
          console.error('Local camera attach error:', e);
        });
    }
  }, [cameraOpen, usingBackend]);

  // Attach backend image when camera is opened in backend mode
  React.useEffect(() => {
    if (cameraOpen && usingBackend) {
      attachBackendImage();
    }
  }, [cameraOpen, usingBackend, attachBackendImage]);

  // When using backend stream, poll /health to auto-complete login like the desktop app
  React.useEffect(() => {
    if (!cameraOpen || !usingBackend) {
      if (backendPollRef.current) {
        clearInterval(backendPollRef.current);
        backendPollRef.current = null;
      }
      return;
    }
    backendHandledSuccessRef.current = false;
    backendPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/health`);
        if (!res.ok) return;
        const data = await res.json();
        // When backend says login_successful, capture a frame and finish login
        if (data?.login_successful && !backendHandledSuccessRef.current) {
          backendHandledSuccessRef.current = true;
          setLoading(true);
          try {
            const biometricTemplate = await captureFrameTemplate();
            const deviceFingerprint = await getDeviceFingerprint();
            // Await and capture result so we can close camera and let AuthContext navigate
            await biometricLogin({ biometricTemplate, deviceFingerprint });
            // Stop camera immediately after successful login
            stopCamera();
          } catch (e) {
            console.error('Auto verify failed:', e);
            setLoading(false);
          }
        }
      } catch (_) {}
    }, 400);
    return () => {
      if (backendPollRef.current) {
        clearInterval(backendPollRef.current);
        backendPollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen, usingBackend, backendUrl, biometricLogin, captureFrameTemplate, getDeviceFingerprint, stopCamera]);

  const handleFaceVerify = async () => {
    setLoading(true);
    try {
      // 1) Capture frame and derive a deterministic biometric template (hash)
      const biometricTemplate = await captureFrameTemplate();
      // 2) Add a light device fingerprint to strengthen verification
      const deviceFingerprint = await getDeviceFingerprint();
      // 3) Call existing biometric login flow (server expects { biometricTemplate, deviceFingerprint? })
      await biometricLogin({ biometricTemplate, deviceFingerprint });
      // On success, AuthContext will navigate based on role
      // Stop camera immediately after success to free device
      stopCamera();
    } catch (err) {
      console.error('Face verification error:', err);
      toast.error('Face verification failed. Please try again or use Email login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffd3ea_0%,#e54be0_45%,#6b1f80_100%)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg"></div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-brand-200">Sign in to your MediElite account</p>
        </div>

        {/* Login Method Tabs */}
        <div className="glass-card p-6 mb-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white text-brand-600'
                    : 'text-white hover:bg-white/10'
                }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            {/* <button
              onClick={() => setLoginMethod('biometric')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'biometric'
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-white/10'
              }`}
            > */}
              {/* <Fingerprint className="w-4 h-4 inline mr-2" />
              Biometric */}
            {/* </button> */}
            <button
              onClick={() => setLoginMethod('face')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === 'face'
                    ? 'bg-white text-sky-700'
                    : 'text-white hover:bg-white/10'
                }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Face
            </button>
          </div>

          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleEmailLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                  disabled={loading}
                  className="w-full glass-cta py-3 font-semibold disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </motion.form>
          )}

          {/* Face verification tab */}
          {loginMethod === 'face' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
              <p className="text-sky-700">Use face verification to sign in.</p>
              <div className="camera-frame mx-auto">
                {cameraOpen ? (
                  usingBackend ? (
                    <img
                      id="face-video-img"
                      crossOrigin="anonymous"
                      alt="Face stream"
                      className="w-full h-full object-cover"
                      onLoad={() => { imgLoadedRef.current = true; if (imgLoadTimerRef.current) { clearTimeout(imgLoadTimerRef.current); imgLoadTimerRef.current = null; } }}
                    />
                  ) : (
                    <video id="face-video" autoPlay muted playsInline className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-200">
                    Click "Open Camera" to start
                  </div>
                )}
              </div>

              {!cameraOpen ? (
                <div className="flex gap-3 justify-center">
                  <button onClick={startCamera} className="glass-button px-6 py-3">Open Camera</button>
                  <Link to="/login" className="text-sm text-sky-600 self-center">Help</Link>
                </div>
              ) : (
                <div className="flex gap-3 justify-center">
                  <button onClick={handleFaceVerify} disabled={loading} className="glass-button px-6 py-3 disabled:opacity-50">{loading ? 'Verifying...' : 'Capture & Verify'}</button>
                  <button onClick={stopCamera} className="px-6 py-3 border rounded-lg text-sky-700">Close Camera</button>
                </div>
              )}
            </motion.div>
          )}

          {/* Biometric Login */}
          {/* {loginMethod === 'biometric' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <Fingerprint className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  Biometric Authentication
                </h3>
                <p className="text-blue-200 text-sm mb-6">
                  Use your fingerprint or face recognition to sign in
                </p>
                <button
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className="glass-button px-8 py-3 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Authenticate with Biometric'}
                </button>
              </div>
            </motion.div>
          )} */}

          {/* OTP Login */}
          {/* OTP flow removed. Face verification tab added above. */}
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-blue-200">
            Don't have an account?{' '}
            <Link to="/onboarding" className="text-white font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Forgot Password */}
        {/* <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-blue-200 hover:text-white text-sm">
            Forgot your password?
          </Link>
        </div> */}
      </motion.div>
    </div>
  );
};

export default LoginPage; 