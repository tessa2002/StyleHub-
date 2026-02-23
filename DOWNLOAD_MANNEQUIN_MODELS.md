# How to Download and Setup Realistic Mannequin Models

## Quick Setup Guide

Follow these steps to get realistic mannequin models like in your reference image:

---

## Step 1: Download Mannequin 3D Models

### Option A: Sketchfab (RECOMMENDED - Free & High Quality)

1. **Go to Sketchfab**
   - Visit: https://sketchfab.com/

2. **Search for Mannequins**
   - Search: "female mannequin"
   - Or: "dress form"
   - Or: "fashion mannequin"

3. **Filter Results**
   - Click "Downloadable" filter
   - Look for "CC" (Creative Commons) or "Free" licenses

4. **Recommended Models** (Search these exact names):
   - "Female Mannequin" by various artists
   - "Fashion Mannequin Female"
   - "Dress Form"
   - "Store Mannequin"

5. **Download**
   - Click on a model you like
   - Click "Download 3D Model" button
   - Choose format: **"glTF"** (GLB or GLTF)
   - Download the file

### Option B: Free3D

1. Visit: https://free3d.com/
2. Search: "mannequin"
3. Download GLB or OBJ format
4. If OBJ, convert to GLB using: https://products.aspose.app/3d/conversion/obj-to-glb

### Option C: CGTrader (Free Models)

1. Visit: https://www.cgtrader.com/
2. Search: "mannequin free"
3. Filter: Free models
4. Download GLB format

---

## Step 2: Place Models in Your Project

### Create Folder Structure:

```bash
# In your project root
cd frontend/public
mkdir -p models
```

### Place Downloaded Files:

```
frontend/public/models/
├── female-mannequin.glb     ← Your downloaded mannequin
├── male-mannequin.glb       ← Optional: for male garments
└── README.txt               ← Note about model source
```

### Rename Your Downloaded File:

```bash
# Example: if you downloaded "mannequin_v1.glb"
mv mannequin_v1.glb female-mannequin.glb
```

---

## Step 3: Update Component to Use Your Model

The component is already set up! It will automatically look for:
- `/models/female-mannequin.glb`

If the file exists, it will use it.  
If not, it will use the built-in fallback mannequin.

---

## Step 4: Test It

1. **Start your application:**
   ```bash
   cd frontend
   npm start
   ```

2. **Navigate to New Request page**

3. **Go to Customization Studio**

4. **You should see your realistic mannequin!**

---

## Recommended Free Mannequin Models

### Best Free Options on Sketchfab:

1. **"Female Mannequin"** by Quaternius
   - URL: Search on Sketchfab
   - License: CC0 (Public Domain)
   - Quality: High
   - Format: GLB

2. **"Dress Form"** by various artists
   - Search: "dress form realistic"
   - Look for downloadable ones
   - Choose GLB format

3. **"Fashion Mannequin"**
   - Search: "fashion mannequin female"
   - Filter: Downloadable + Free
   - Download GLB

---

## Alternative: Use Online Mannequin URLs

If you find a mannequin hosted online, you can use it directly:

### Update NewOrder.js:

```javascript
<MannequinPreview
  mannequinModelUrl="https://example.com/models/mannequin.glb"
  // ... other props
/>
```

---

## Model Requirements

### File Format:
- ✅ GLB (preferred)
- ✅ GLTF
- ❌ OBJ (needs conversion)
- ❌ FBX (needs conversion)

### Model Specifications:
- **Polygon Count:** 10,000 - 50,000 (for good performance)
- **Textures:** Included or simple colors
- **Rigging:** Not required (static pose is fine)
- **Size:** Under 10MB recommended

### Pose:
- Standing straight
- Arms at sides or slightly out
- Neutral pose
- Facing forward

---

## Converting Other Formats to GLB

If you have OBJ, FBX, or other formats:

### Online Converters:

1. **Aspose 3D Converter** (Free)
   - URL: https://products.aspose.app/3d/conversion
   - Upload your file
   - Convert to GLB
   - Download

2. **AnyConv** (Free)
   - URL: https://anyconv.com/obj-to-glb-converter/
   - Upload OBJ
   - Convert to GLB

3. **Blender** (Free Software)
   - Download: https://www.blender.org/
   - Import your model (File > Import)
   - Export as GLB (File > Export > glTF 2.0)

---

## Troubleshooting

### Model not showing?

**Check 1:** File path is correct
```
frontend/public/models/female-mannequin.glb
```

**Check 2:** File name is exact
- Must be: `female-mannequin.glb`
- Not: `Female-Mannequin.glb` or `mannequin.glb`

**Check 3:** File format is GLB
- Open file properties
- Check extension is `.glb`

**Check 4:** File size is reasonable
- Should be under 50MB
- If larger, use a simpler model

### Model is too big/small?

The component automatically scales based on measurements, but if needed:

Edit `MannequinPreview.js`:
```javascript
// Adjust scale multiplier
const widthScale = (chest / 36) * 1.5; // Increase 1.5 to make bigger
```

### Model is rotated wrong?

Edit `MannequinPreview.js`:
```javascript
<primitive 
  object={scene} 
  scale={scale}
  rotation={[0, Math.PI, 0]} // Add this line to rotate 180°
/>
```

---

## Example: Complete Setup

### 1. Download from Sketchfab:
```
Downloaded: fashion_mannequin_female.glb
Size: 8.5 MB
```

### 2. Place in project:
```bash
mv ~/Downloads/fashion_mannequin_female.glb frontend/public/models/female-mannequin.glb
```

### 3. Verify:
```bash
ls -lh frontend/public/models/
# Should show: female-mannequin.glb
```

### 4. Start app:
```bash
cd frontend
npm start
```

### 5. Test:
- Go to New Request
- Enter measurements
- Go to Customization Studio
- See realistic mannequin! ✨

---

## Using Multiple Mannequins

### For Different Body Types:

```
frontend/public/models/
├── mannequin-slim.glb
├── mannequin-average.glb
├── mannequin-plus.glb
└── mannequin-petite.glb
```

### Update component to choose based on measurements:

```javascript
const getMannequinUrl = (measurements) => {
  const chest = measurements?.Chest || 36;
  
  if (chest < 34) return '/models/mannequin-slim.glb';
  if (chest > 40) return '/models/mannequin-plus.glb';
  return '/models/mannequin-average.glb';
};
```

---

## Best Practices

### Do:
- ✅ Use GLB format
- ✅ Keep file size under 10MB
- ✅ Test on mobile devices
- ✅ Use neutral pose mannequins
- ✅ Check license before using

### Don't:
- ❌ Use copyrighted models without permission
- ❌ Use extremely high-poly models (slow performance)
- ❌ Use animated models (not needed)
- ❌ Forget to credit the creator (if required by license)

---

## License Information

When downloading models, check the license:

- **CC0 (Public Domain):** ✅ Free to use, no attribution needed
- **CC BY:** ✅ Free to use, attribution required
- **CC BY-SA:** ✅ Free to use, attribution + share-alike
- **Commercial License:** ⚠️ May require payment
- **Editorial Use Only:** ❌ Cannot use for commercial projects

---

## Support

### Need Help?

1. Check file path is correct
2. Verify file format is GLB
3. Test with a different model
4. Check browser console for errors
5. Try the fallback mannequin first

### Still Not Working?

The component includes a fallback mannequin that works without any model files. It will automatically use it if the GLB file is not found.

---

## Summary

1. ✅ Download mannequin GLB from Sketchfab
2. ✅ Place in `frontend/public/models/female-mannequin.glb`
3. ✅ Start your app
4. ✅ See realistic mannequin in preview!

**That's it! You now have realistic mannequin models like in your reference image!** 🎉
