# Get Realistic Mannequin - Quick Guide

## Current Issue
You're seeing a simple geometric mannequin (green shape). You want a **realistic mannequin with face, hair, and details** like in your reference image.

## Solution: Download a 3D Mannequin Model

### Quick Steps (5 Minutes):

#### Step 1: Download Mannequin
Go to one of these sites and download a realistic mannequin:

**EASIEST - Sketchfab:**
1. Click this link: https://sketchfab.com/search?q=female+mannequin+realistic&type=models&features=downloadable
2. Find a mannequin you like (look for ones with "Downloadable" badge)
3. Click on it
4. Click "Download 3D Model" button
5. Choose format: **"glTF"** (this will give you a .glb file)
6. Download it

**Alternative - Free3D:**
1. Go to: https://free3d.com/3d-models/mannequin
2. Find a free mannequin model
3. Download it
4. If it's not GLB format, convert it at: https://products.aspose.app/3d/conversion/obj-to-glb

#### Step 2: Place the File
1. Find your downloaded file (probably in Downloads folder)
2. Rename it to: `female-mannequin.glb`
3. Move it to: `frontend/public/models/female-mannequin.glb`

**Full path should be:**
```
C:\Users\HP\style_hub\frontend\public\models\female-mannequin.glb
```

#### Step 3: Refresh Browser
1. Go back to your browser
2. Press Ctrl+Shift+R (hard refresh)
3. You should now see the realistic mannequin!

---

## Recommended Free Mannequin Models

### Best Options on Sketchfab:

1. **"Female Mannequin"** - Search for this
   - Look for realistic ones with face and hair
   - Make sure it says "Downloadable"
   - Choose CC0 or CC-BY license (free to use)

2. **"Realistic Female Mannequin"**
   - More detailed
   - Better quality
   - Some are free

3. **"Fashion Mannequin Female"**
   - Professional looking
   - Good for clothing display

### What to Look For:
- ✅ Has face with features
- ✅ Has hair/wig
- ✅ Realistic skin texture
- ✅ Standing pose
- ✅ Downloadable
- ✅ GLB or GLTF format
- ✅ Free license (CC0, CC-BY)

---

## If You Can't Download Right Now

The system will continue to show the fallback mannequin (the simple green shape). It still works for:
- Showing garment shape
- Rotation and zoom
- Customization preview

But to get the **realistic look like your reference image**, you MUST download a 3D model file.

---

## Troubleshooting

### "I downloaded but it's not showing"

**Check 1:** File name is exact
- Must be: `female-mannequin.glb`
- Not: `Female-Mannequin.glb` or `mannequin.glb`

**Check 2:** File location is correct
```
frontend/
  public/
    models/
      female-mannequin.glb  ← Must be here
```

**Check 3:** File format is GLB
- Right-click file → Properties
- Check extension is `.glb`
- If it's `.obj` or `.fbx`, convert it first

**Check 4:** Refresh browser
- Press Ctrl+Shift+R (hard refresh)
- Or close and reopen browser

### "Where do I put the file?"

Using File Explorer:
1. Navigate to: `C:\Users\HP\style_hub\frontend\public\models\`
2. Paste your `female-mannequin.glb` file there
3. Refresh browser

---

## Why You Need to Download

The realistic mannequin models are large files (5-50MB) with:
- Detailed 3D geometry
- Face features (eyes, nose, mouth)
- Hair/wig model
- Skin textures
- Realistic proportions

These can't be included in the code - they must be downloaded separately.

---

## Summary

**Current:** Simple geometric shape (fallback)  
**Goal:** Realistic mannequin with face and hair  
**Solution:** Download GLB file from Sketchfab  
**Time:** 5 minutes  
**Cost:** FREE  

**Once you add the GLB file, you'll see a realistic mannequin exactly like your reference image!**

---

Need help? The folder is ready at:
`frontend/public/models/`

Just add `female-mannequin.glb` there and refresh!
