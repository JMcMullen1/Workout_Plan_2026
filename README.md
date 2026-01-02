# 🏋️ Training Macrocycle 2026 - Progressive Web App

A lightweight, mobile-first Progressive Web App (PWA) for tracking your 2026 training macrocycle. Supports multiple mesocycles with GTG (Grease the Groove) progression, Hyrox simulations, and goal-based filtering.

## ✨ Features

### Macrocycle & Mesocycle Management
- **Scalable Architecture**: Built to handle multiple mesocycles across a full 2026 macrocycle
- **Flexible Date Ranges**: Set custom start/end dates for each mesocycle
- **Progress Tracking**: Visual progress bars showing completion percentage
- **Template System**: Pre-built Mesocycle 1 template with option for custom mesocycles

### Mesocycle 1 (4-Week Plan)
Auto-generates a comprehensive 4-week training schedule with:

- **Lower Body Hypertrophy** (Monday): Machine-based leg training
- **GTG (Grease the Groove)**: Mon-Sat, 5 sets/day, alternating:
  - **Day A**: Press-ups + Chin-ups
  - **Day B**: Dips + Bent-over Rows (24kg KB)
  - Automatic progression tracking
- **Hyrox Simulations**: 2x/week Half Hyrox with pro weights
  - Week 4 includes 1x Full Hyrox
  - 1km run progression: starts at 5:00, -5s per week
- **Basketball Jump Training**: Weekly jump session (Thursday)
- **Grappling Solo Training**: 3x/week BJJ drills

### Goal-Based Organization
Color-coded sessions by training goal:
1. 🏀 **Dunk** (Orange) - Jump training
2. 💪 **Murph** (Teal) - GTG push/pull work
3. 🏃 **Hyrox** (Yellow) - Hyrox simulations + 1km runs
4. 🥋 **BJJ** (Purple) - Grappling training

**Filter by goal** using chips at the top of the mesocycle view.

### Session Tracking
- ✅ Completion checkboxes
- 📝 Session notes
- 💯 RPE tracking (Rate of Perceived Exertion 0-10)
- 🎯 GTG set tracking (5 daily sets per movement)
- 📊 Real-time progress updates

### Data Management
- 💾 **Auto-save**: All data persists in browser localStorage
- 📥 **Export**: Download full macrocycle as JSON
- 📤 **Import**: Restore from backup JSON file
- 🔄 **Offline-first**: Works without internet connection

### PWA Features
- 📱 **Installable**: Add to home screen on iOS/Android
- ⚡ **Fast**: Cached assets for instant loading
- 📴 **Offline**: Full functionality without internet
- 🎨 **Native feel**: Standalone app experience

---

## 🚀 Quick Start

### 1. Generate Icons

Before deploying, you need to create app icons. Choose one method:

#### Option A: Use the Built-in Generator (Quick)
1. Open `icons/generate-icons.html` in your browser
2. Click "Generate All Icons"
3. Download each icon to the `icons/` folder

#### Option B: Use ImageMagick (CLI)
```bash
cd icons

# Create base icon
convert -size 512x512 gradient:#1a1a2e-#e94560 \
        -gravity center -pointsize 200 -fill white \
        -annotate +0+0 "T26" icon-512x512.png

# Resize to all sizes
for size in 72 96 128 144 152 192 384; do
  convert icon-512x512.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

#### Option C: Design Custom Icons
Use Canva, Figma, or any design tool to create a 512x512px icon, then resize.

### 2. Test Locally

Simply open `index.html` in a browser:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Or just open the file
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

Visit: `http://localhost:8000`

### 3. Deploy to GitHub Pages

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: Training PWA"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main

# Enable GitHub Pages
# Go to: Settings > Pages > Source: main branch > Save
```

Your app will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

**Important**: If your repo is not at the root (e.g., `username.github.io/repo-name/`), update `manifest.webmanifest`:
```json
"start_url": "/repo-name/",
```

---

## 📱 Installing to Home Screen

### iOS (iPhone/iPad)
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Tap "Add"

Alternatively, Chrome will show an install prompt automatically.

### Desktop (Chrome/Edge)
1. Visit the app
2. Click the install icon in the address bar (➕ or computer icon)
3. Click "Install"

---

## 📊 Data Model

The app uses a hierarchical data structure designed for scaling:

```javascript
{
  macrocycle: {
    id: "2026",
    name: "Macrocycle 2026",
    mesocycles: [
      {
        id: "meso-1",
        name: "Mesocycle 1",
        fromDate: "2026-01-06",
        toDate: "2026-02-02",
        template: "mesocycle-1",
        schedule: [
          {
            id: "2026-01-06-lower",
            date: "2026-01-06",
            type: "lower-hypertrophy",
            title: "Lower Body Hypertrophy",
            goal: null,
            exercises: [...],
            completed: false,
            notes: "",
            rpe: null
          },
          {
            id: "2026-01-06-gtg",
            date: "2026-01-06",
            type: "gtg",
            title: "GTG A",
            goal: 2,
            movements: [
              {
                name: "Press-ups",
                target: 10,
                completed: [false, false, false, false, false]
              }
            ]
          }
          // ... more sessions
        ]
      }
      // ... more mesocycles
    ]
  }
}
```

### Session Types
- `lower-hypertrophy`: Machine-based leg training
- `gtg`: Grease the Groove daily practice
- `hyrox`: Hyrox simulation (Half or Full)
- `jump`: Basketball jump training
- `grappling`: BJJ solo drills

---

## ➕ Adding Future Mesocycles

### Via UI
1. Open the app
2. Click "+ Add Mesocycle"
3. Fill in:
   - Name (e.g., "Mesocycle 2")
   - From Date
   - To Date
   - Template (choose "Blank" for custom)
4. Click "Save"

### Programmatically
To create custom mesocycle templates, edit `app.js`:

```javascript
// Add to generateSchedule function
if (template === 'mesocycle-2') {
    return generateMesocycle2Schedule(fromDate, toDate);
}

// Create generator function
function generateMesocycle2Schedule(fromDateStr, toDateStr) {
    const schedule = [];
    // ... your custom schedule logic
    return schedule;
}
```

### Template Ideas
- **Strength Focus**: Heavy compound lifts + accessories
- **Endurance Block**: Long runs + conditioning
- **Deload Week**: Reduced volume/intensity
- **Peaking Phase**: Sport-specific training

---

## 🎯 Mesocycle 1 Details

### Weekly Structure

**Monday**
- Lower Body Hypertrophy (machines)
- GTG A: Press-ups + Chin-ups
- Grappling (3rd weekly session)

**Tuesday**
- Half Hyrox #1
- GTG B: Dips + Bent-over Rows

**Wednesday**
- Grappling Solo Training
- GTG A: Press-ups + Chin-ups

**Thursday**
- Basketball Jump Training
- GTG B: Dips + Bent-over Rows

**Friday**
- Half Hyrox #2 (with 1km run target)
- GTG A: Press-ups + Chin-ups

**Saturday**
- Grappling Solo Training
- GTG B: Dips + Bent-over Rows

**Sunday**
- Rest (Week 4: Full Hyrox simulation)

### GTG Progression Rules

**Day A** (Mon/Wed/Fri):
- Press-ups: Start at 10 reps, +2 each occurrence
- Chin-ups: Start at 1 rep, +1 each occurrence

**Day B** (Tue/Thu/Sat):
- Dips: Start at 1 rep, +1 each occurrence
- KB Rows (24kg, each side): Start at 6 reps, +2 each occurrence

### Hyrox & Run Progression

- **Week 1 Friday**: 1km target = 5:00
- **Week 2 Friday**: 1km target = 4:55
- **Week 3 Friday**: 1km target = 4:50
- **Week 4 Friday**: 1km target = 4:45

Week 4 also includes 1x Full Hyrox simulation (in addition to 2x Half).

### Lower Body Template

1. Leg Press - 3-4 sets × 8-15 reps
2. Leg Curl - 3-4 sets × 8-15 reps
3. Leg Extension - 3-4 sets × 8-15 reps
4. Hip Abductor - 3-4 sets × 8-15 reps
5. Calf Raise - 3-4 sets × 8-15 reps
6. Hack Squat (optional) - 3-4 sets × 8-15 reps

---

## 🛠️ Customization

### Colors & Theme

Edit `styles.css`:
```css
:root {
    --bg-primary: #1a1a2e;      /* Main background */
    --bg-secondary: #16213e;    /* Cards */
    --accent: #e94560;          /* Primary accent */

    --goal-1: #ff6b35;          /* Dunk - Orange */
    --goal-2: #4ecdc4;          /* Murph - Teal */
    --goal-3: #f7b801;          /* Hyrox - Yellow */
    --goal-4: #9b59b6;          /* BJJ - Purple */
}
```

### Adding Goal Categories

Edit `app.js`:
```javascript
const GOALS = {
    1: { name: 'Dunk', icon: '🏀', color: 'goal-1' },
    2: { name: 'Murph', icon: '💪', color: 'goal-2' },
    3: { name: 'Hyrox', icon: '🏃', color: 'goal-3' },
    4: { name: 'BJJ', icon: '🥋', color: 'goal-4' },
    5: { name: 'Your Goal', icon: '🎯', color: 'goal-5' }  // Add new
};
```

Then add corresponding CSS:
```css
:root {
    --goal-5: #your-color;
}
```

### Modifying Lower Body Exercises

Edit `app.js`:
```javascript
const LOWER_BODY_TEMPLATE = [
    { name: 'Your Exercise', sets: '3-4', reps: '8-12' },
    // ... add/remove exercises
];
```

---

## 🔧 Troubleshooting

### PWA Not Installing
- ✅ Ensure you're using HTTPS (or localhost)
- ✅ Check all icon files exist in `icons/`
- ✅ Verify `manifest.webmanifest` is served with correct MIME type
- ✅ Check browser console for errors

### Data Not Saving
- localStorage must be enabled in browser
- Check browser privacy settings (Private/Incognito mode may block)
- Export data regularly as backup

### Service Worker Not Updating
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear site data in browser DevTools
- Uninstall and reinstall the PWA

### Icons Not Showing
- Verify icon paths in `manifest.webmanifest`
- Ensure icon files are PNG format
- Check icon dimensions match filename sizes

---

## 📁 Project Structure

```
/Workout_Plan_2026/
├── index.html              # Main app HTML
├── styles.css              # All styles & theming
├── app.js                  # Core app logic
├── manifest.webmanifest    # PWA configuration
├── service-worker.js       # Offline caching
├── icons/
│   ├── generate-icons.html # Icon generator tool
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── README.md               # This file
```

---

## 🧪 Testing Checklist

Before deploying:

- [ ] All icons generated and in `icons/` folder
- [ ] Test on mobile device (iOS/Android)
- [ ] Verify offline functionality
- [ ] Test data export/import
- [ ] Create and complete sample sessions
- [ ] Test GTG set tracking
- [ ] Verify goal filters work
- [ ] Test mesocycle creation/editing/deletion
- [ ] Check PWA installability (Lighthouse)
- [ ] Ensure service worker registers successfully

---

## 🚀 Deployment Options

### GitHub Pages (Recommended)
- Free hosting
- Automatic HTTPS
- Custom domain support
- See "Deploy to GitHub Pages" above

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Cloudflare Pages
1. Push to GitHub
2. Connect repo in Cloudflare Pages dashboard
3. Deploy

---

## 📈 Future Enhancements

Ideas for extending the app:

- [ ] Charts & analytics (Chart.js integration)
- [ ] Rest timer with notifications
- [ ] Exercise video/image library
- [ ] Social sharing (share progress)
- [ ] Multi-user support (Firebase/Supabase)
- [ ] Apple Health / Google Fit integration
- [ ] Weekly email summaries
- [ ] Voice logging ("Hey app, log 10 press-ups")
- [ ] Progressive photo tracking
- [ ] Custom notification reminders

---

## 🐛 Reporting Issues

Found a bug or have a suggestion?
1. Check existing issues
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Browser/device info
   - Screenshots (if applicable)

---

## 📄 License

This project is open source and available for personal use.

---

## 💪 Credits

Built with:
- Vanilla JavaScript (no frameworks)
- CSS Grid & Flexbox
- localStorage API
- Service Worker API
- Web App Manifest

---

**Ready to crush your 2026 goals! 🏋️🔥**

For questions or support, refer to the troubleshooting section or check the code comments in `app.js`.