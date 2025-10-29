# 📹 Video Setup Instructions

## ✅ Implementation Complete!

### **Video Background Added to Hero Section**

---

## 📁 **Where to Place Your Video**

**Path:** `c:\Ecommerce-Clothing-store\vyronfashion\public\videos\hero-fashion-video.mp4`

**Steps:**
1. Copy your video file: `hero-fashion-video.mp4`
2. Paste into: `/public/videos/` folder (already created)
3. Reload the page - video will auto-play!

---

## 🎬 **Video Specifications (Recommended)**

```
Format: MP4 (H.264 codec)
Resolution: 1920x1080 (Full HD)
Duration: 10-20 seconds (will loop seamlessly)
File Size: 300-500KB (highly compressed)
FPS: 24-30fps
Audio: None (must be removed for autoplay)
```

### **If Your Video is Too Large:**

Use FFmpeg to compress (install from ffmpeg.org):

```bash
ffmpeg -i hero-fashion-video.mp4 \
  -vf "scale=1920:1080" \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -an \
  hero-fashion-video-optimized.mp4
```

**Explanation:**
- `-vf "scale=1920:1080"` - Resize to Full HD
- `-crf 28` - Compression quality (23-28 recommended, higher = smaller file)
- `-preset slow` - Better compression
- `-an` - Remove audio track

---

## 🎯 **How It Works**

### **Desktop (≥1024px):**
```
1. Page loads
2. Video starts playing automatically (muted, no controls)
3. Static poster shows while video loads (smooth transition)
4. Video loops seamlessly in background
5. Content (text, buttons) overlays on top with dark gradient
```

### **Mobile (<1024px):**
```
1. Shows static image instead (saves data)
2. Same content overlay
3. No video loading
```

---

## 🎨 **Technical Features**

✅ **Auto-play** - Starts immediately (no user action needed)
✅ **Loop** - Repeats continuously
✅ **Muted** - No sound (required for autoplay)
✅ **playsInline** - Plays in place on iOS (no fullscreen)
✅ **Invisible controls** - No play/pause buttons visible
✅ **Smooth loading** - Poster image → video fade-in
✅ **Desktop-only** - Mobile gets static image fallback
✅ **Parallax content** - Text moves on scroll

---

## 🔧 **Customization Options**

### **Change overlay darkness:**
```javascript
// In ScrollytellingHero.js, line ~72
<div className="absolute inset-0 bg-gradient-to-b 
  from-black/50    // Change: /50 = 50% opacity
  via-black/30     // Change: /30 = 30% opacity
  to-black/60"     // Change: /60 = 60% opacity
/>
```

### **Change fallback poster image:**
```javascript
// Line ~66 & ~86
backgroundImage: 'url(/images/banners/summer-hero.jpg)'
// Replace with your image path
```

### **Adjust video object-fit:**
```javascript
// Line ~59
className="... object-cover"
// Options: object-cover (fill, may crop)
//          object-contain (fit, may show black bars)
//          object-fill (stretch)
```

---

## 📊 **Performance Metrics**

### **Target Performance:**
```
LCP (Largest Contentful Paint): < 2.5s
- Poster image loads first (~50KB)
- Video loads in background
- Content visible immediately

FID (First Input Delay): < 100ms
- No JavaScript blocking
- Lazy video loading

CLS (Cumulative Layout Shift): < 0.1
- Fixed dimensions
- No layout jumps
```

### **Bundle Size Impact:**
```
Component code: +2KB
Video file: 300-500KB (desktop-only)
Mobile: 0KB (static image only)
```

---

## 🧪 **Testing Checklist**

### **Functionality:**
- [ ] Video auto-plays on desktop
- [ ] Video loops seamlessly
- [ ] No audio plays
- [ ] Poster shows while loading
- [ ] Mobile shows static image
- [ ] Content is readable (check contrast)

### **Performance:**
- [ ] Run Lighthouse audit (target: 90+ performance)
- [ ] Test on slow connection (3G throttling)
- [ ] Check video file size (should be < 500KB)
- [ ] Verify no console errors

### **Cross-browser:**
- [ ] Chrome/Edge (should work perfectly)
- [ ] Safari (check -webkit prefixes)
- [ ] Firefox (test autoplay)
- [ ] Mobile Safari iOS (playsInline important)

---

## 🎥 **Video Content Tips**

### **What Works Well:**
✅ Slow motion fashion shots
✅ Fabric close-ups (texture details)
✅ Models walking (elegant movement)
✅ Products floating/rotating
✅ Warm, soft lighting
✅ Minimal quick cuts

### **Avoid:**
❌ Fast movements (distracting)
❌ Bright flashing lights (accessibility)
❌ Text/logos in video (use overlay instead)
❌ Sudden scene changes (jarring when looping)
❌ People talking (since it's muted)

---

## 🚀 **Next Steps**

1. **Place video file** in `/public/videos/` folder
2. **Test on desktop** - should auto-play
3. **Test on mobile** - should show static image
4. **Optimize if needed** - compress video if > 500KB
5. **Monitor performance** - run Lighthouse

---

## 🆘 **Troubleshooting**

### **Video doesn't auto-play:**
- ✅ Check video is muted (required for autoplay)
- ✅ Verify file path: `/public/videos/hero-fashion-video.mp4`
- ✅ Check browser console for errors
- ✅ Try different browser (some block autoplay)

### **Video is choppy/laggy:**
- ❌ File too large - compress to < 500KB
- ❌ Resolution too high - use 1920x1080 max
- ❌ Bitrate too high - use CRF 28 in FFmpeg

### **Text is hard to read:**
- ✅ Increase overlay opacity (line 72)
- ✅ Add text-shadow to content
- ✅ Use brighter/darker video footage

---

## 📞 **Support**

If you encounter issues:
1. Check video file is in correct path
2. Verify video format is MP4 (H.264)
3. Ensure video has no audio track
4. Test file size (should be < 500KB)

**File Path:** `/public/videos/hero-fashion-video.mp4`

🎉 **Ready to go! Place your video and enjoy the luxury experience!**
