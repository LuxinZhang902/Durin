# 🌐 Web Interface - Liveness & Deepfake Detection

## 🚀 Quick Start

### 1. Start the Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Open the Web Interface

Open your browser and go to:
```
http://localhost:8000/test
```

## 📸 How to Use

### Step 1: Start Camera
1. Click **"Start Camera"** button
2. Allow browser to access your webcam
3. Position your face in the camera view

### Step 2: Capture Photo
1. Make sure your face is clearly visible
2. Ensure good lighting
3. Click **"Capture Photo"** button

### Step 3: View Results
The system will automatically analyze your image and display:

#### ✅ Overall Status
- **PASS** = Identity verified, all checks passed
- **FAIL** = One or more checks failed

#### 📷 Face Detection
- Whether a face was detected
- If it's a real face (not a photo of a photo)

#### 🤖 Deepfake Detection (Reality Defender)
- **AUTHENTIC** = Real photograph
- **DEEPFAKE DETECTED** = AI-generated or manipulated

#### 😊 Liveness Score
- 0.0 - 1.0 score showing confidence
- Higher = more confident it's a real, live person

#### 🛡️ Sanctions Screening (OpenSanctions)
- Checks against OFAC, UN, EU sanctions
- PEP (Politically Exposed Persons) database
- **PASSED** = No matches
- **FLAGGED** = Found in sanctions database

#### 📱 Device Risk
- Low/Medium/High risk assessment
- Checks for suspicious device patterns

## 🎯 What Gets Tested

### Real APIs Used:
1. **DeepFace + RetinaFace** - Face detection
2. **Reality Defender** - Deepfake detection
3. **OpenSanctions** - Sanctions/PEP screening
4. **SQLite Database** - Stores all results

### Detection Capabilities:
- ✅ Real face vs photo of photo
- ✅ AI-generated faces (Stable Diffusion, Midjourney, etc.)
- ✅ Deepfake videos/images
- ✅ Screen recording detection
- ✅ Sanctions list matching
- ✅ Device fraud patterns

## 📊 Understanding Results

### Liveness Score
- **0.8 - 1.0** = Highly confident real person
- **0.6 - 0.8** = Likely real person
- **0.4 - 0.6** = Uncertain
- **< 0.4** = Likely not a real person

### Deepfake Score (Reality Defender)
- **< 0.3** = Highly confident authentic
- **0.3 - 0.5** = Likely authentic
- **0.5 - 0.7** = Suspicious, possible deepfake
- **> 0.7** = Very likely deepfake

### Device Risk
- **< 30%** = Low risk (normal device)
- **30% - 70%** = Medium risk (shared device)
- **> 70%** = High risk (fraud pattern detected)

## 🚩 Common Flags

### NO_FACE_DETECTED
- Face not visible or too small
- Solution: Move closer to camera

### DEEPFAKE_DETECTED
- AI-generated or manipulated image
- Could be legitimate or fraud attempt

### REALITY_DEFENDER_DEEPFAKE
- Reality Defender's AI detected synthetic content
- High confidence deepfake detection

### REPLAY_DETECTED
- Image appears to be a screen recording
- May be photo of photo

### SANCTIONS_MATCH
- Name matched sanctions/PEP database
- Requires compliance review

### HIGH_DEVICE_RISK
- Device shows suspicious patterns
- May be used for fraud

### DUPLICATE_IDENTITY
- Same face used with different user ID
- Identity fraud attempt

## 🔬 Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Beautiful gradient design
- **JavaScript** - Webcam API integration
- **Canvas API** - Image capture

### Backend APIs
- **FastAPI** - Python web framework
- **DeepFace** - Face detection ML models
- **Reality Defender** - Enterprise deepfake detection
- **OpenSanctions** - Sanctions/PEP data
- **SQLAlchemy** - Database ORM

### Database
- **SQLite** - Local persistence
- Stores all analysis results
- Production-ready schema

## 🎨 Features

### Beautiful UI
- ✅ Modern gradient design
- ✅ Responsive layout
- ✅ Smooth animations
- ✅ Real-time status updates
- ✅ Progress indicators

### Real-time Analysis
- ✅ Live webcam feed
- ✅ Instant capture
- ✅ Automatic analysis
- ✅ Detailed results breakdown

### Production Ready
- ✅ Error handling
- ✅ Loading states
- ✅ Mobile responsive
- ✅ Cross-browser compatible

## 📱 Browser Compatibility

### Supported Browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Requirements:
- Webcam access permission
- JavaScript enabled
- Modern browser (2020+)

## 🔒 Privacy & Security

### What Happens to Your Image:
1. **Captured locally** in your browser
2. **Sent to backend API** for analysis
3. **Processed by Reality Defender** API
4. **Stored in database** for audit trail
5. **NOT permanently stored** as raw image

### APIs Used:
- **Reality Defender** - Image sent to their servers for analysis
- **OpenSanctions** - Only name is checked (not image)
- **Local Processing** - Face detection happens on your server

### Data Retention:
- Face embeddings stored (not raw images)
- Analysis results stored in database
- Can be deleted via DELETE endpoint

## 🐛 Troubleshooting

### Camera not working?
- Check browser permissions
- Close other apps using webcam
- Try different browser
- Reload page

### Analysis taking too long?
- First request downloads ML models (~450MB)
- Subsequent requests are faster (5-15 seconds)
- Check internet connection (Reality Defender API)

### "API Error" messages?
- Make sure backend server is running
- Check API keys in .env.local file
- Verify CORS settings

### Results not showing?
- Check browser console (F12)
- Ensure backend is on http://localhost:8000
- Try refreshing the page

## 🎯 Demo Tips

### For Best Results:
1. **Good lighting** - Face clearly visible
2. **Center your face** - Look at camera
3. **Neutral background** - Avoid busy backgrounds
4. **Stable connection** - For API calls

### What to Show:
1. Beautiful UI design
2. Real-time webcam capture
3. Comprehensive analysis results
4. Multiple API integrations
5. Production-ready technology

## 🚀 Production Deployment

### To deploy:
1. Add authentication
2. Rate limiting
3. HTTPS only
4. Restrict CORS
5. Add user dashboard

### Environment Setup:
```bash
# Required in .env.local
REALITY_DEFENDER_API_KEY=your_key
OPENSANCTIONS_API_KEY=your_key
```

## 📚 API Documentation

Full API docs available at:
```
http://localhost:8000/docs
```

---

**Built with ❤️ using FastAPI, Reality Defender, OpenSanctions, and DeepFace**

**Ready for hackathon demos and production deployment!** 🚀
