# 📍 Location Search Feature - User-Friendly Place Names

## ✨ New Feature Added!

Your ATIS system now supports **searching by place name** instead of just coordinates! Much more user-friendly! 🎉

---

## 🎯 What's New

### **Before:**
```
Origin (lat,lng): -36.8485,174.7633
Destination (lat,lng): -36.8443,174.7676
```
❌ Confusing coordinates
❌ Hard to remember
❌ Not user-friendly

### **After:**
```
📍 Origin: Auckland CBD
🎯 Destination: Auckland Airport
```
✅ Easy to understand place names
✅ Search autocomplete
✅ Current location button
✅ Coordinates shown below (for reference)

---

## 🔍 Features

### **1. Place Name Search**
- Type any place name (e.g., "Britomart", "Sky Tower", "University of Auckland")
- Autocomplete dropdown appears with suggestions
- Click a result to select it
- Works for both Origin and Destination

### **2. Search Results Dropdown**
- Shows up to 5 relevant results
- Displays:
  - **Primary name** (bold)
  - **Full address** (below)
- Hover highlights
- Click to select

### **3. Current Location Button**
- 📍 "Current" button next to each field
- Uses your device's GPS
- Automatically gets place name via reverse geocoding
- Quick and convenient!

### **4. Coordinates Reference**
- Coordinates still shown below each field
- Smaller, grey text
- For technical reference
- Format: `lat, lng`

### **5. Swap Button**
- 🔄 Swap button exchanges both locations AND names
- Maintains consistency

---

## 🚀 How to Use

### **Search for a Place:**
1. Click in the "Origin" or "Destination" field
2. Start typing a place name (e.g., "Britomart")
3. Wait for search results dropdown
4. Click on the desired location
5. The field updates with the place name

### **Use Current Location:**
1. Click the "📍 Current" button
2. Allow location access if prompted
3. Your current location is set automatically
4. Place name is retrieved automatically

### **Example Searches:**
- "Britomart Station"
- "Auckland Airport"
- "Sky Tower"
- "University of Auckland"
- "Viaduct Harbour"
- "Mount Eden"
- "Ponsonby"
- "Parnell"

---

## 🌐 Technology

### **Geocoding Service:**
- **Provider**: OpenStreetMap Nominatim
- **Forward Geocoding**: Place name → Coordinates
- **Reverse Geocoding**: Coordinates → Place name
- **Free and open-source**

### **Search Query Format:**
```
https://nominatim.openstreetmap.org/search
?format=json
&q=[Your Search], Auckland, New Zealand
&limit=5
```

### **Reverse Geocoding:**
```
https://nominatim.openstreetmap.org/reverse
?format=json
&lat=[latitude]
&lon=[longitude]
```

---

## 📱 User Experience Flow

```
┌─────────────────────────────────────┐
│  User Types "Britomart"             │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Search API Called                  │
│  (after 3+ characters)              │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Dropdown Shows Results:            │
│  ✓ Britomart Transport Centre       │
│  ✓ Britomart Station                │
│  ✓ Britomart Place                  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  User Clicks "Britomart Station"    │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Field Updates:                     │
│  📍 Origin: Britomart Station       │
│  -36.8443, 174.7676                 │
└─────────────────────────────────────┘
```

---

## 🎨 UI Design

### **Input Field:**
```css
Display: Place name (bold, large)
Below: Coordinates (small, grey)
Button: "📍 Current" (top right)
Placeholder: "Search for a place..."
```

### **Dropdown:**
```css
Background: Glassmorphism with blur
Border: Subtle glass border
Shadow: Elevated shadow
Max Height: 200px (scrollable)
Hover: Subtle highlight
```

### **Result Items:**
```css
Primary Name: 14px, bold
Full Address: 11px, grey, below
Padding: 12px
Border: Between items
Transition: Smooth background on hover
```

---

## ✅ Benefits

### **For Users:**
- 🎯 **Easier to use** - No need to know coordinates
- 🔍 **Search by name** - Type what you know
- 📍 **Quick location** - One button for GPS
- 👁️ **Visual feedback** - See results immediately
- 🧠 **Memorable** - Place names stick in memory

### **For System:**
- 🌍 **Global coverage** - OpenStreetMap data
- 💰 **Free** - No API costs
- 🚀 **Fast** - Quick search results
- 🔄 **Reliable** - Established service
- 📊 **Accurate** - Quality geocoding

---

## 🔧 Technical Details

### **State Management:**
```javascript
// Location states
const [origin, setOrigin] = useState([-36.8485, 174.7633])
const [dest, setDest] = useState([-36.8443, 174.7676])
const [originName, setOriginName] = useState('Auckland CBD')
const [destName, setDestName] = useState('Auckland Airport')

// Search states
const [originSearch, setOriginSearch] = useState('')
const [destSearch, setDestSearch] = useState('')
const [searchResults, setSearchResults] = useState([])
const [searchingFor, setSearchingFor] = useState(null)
```

### **Key Functions:**
1. **`searchLocation(query, type)`** - Search for places
2. **`selectLocation(result)`** - Select from results
3. **`useCurrentLocation(type)`** - Get GPS location
4. **`swapOD()`** - Swap origin and destination

---

## 📝 Example Usage

### **Trip Planning Workflow:**

**Step 1:** User opens "Plan" tab
```
📍 Origin: [Auckland CBD]
🎯 Destination: [Auckland Airport]
```

**Step 2:** User changes origin
```
Types: "Sky Tower"
Dropdown appears with results
Clicks: "Sky Tower"
```

**Step 3:** Result
```
📍 Origin: Sky Tower
    -36.8485, 174.7633
🎯 Destination: Auckland Airport
    -37.0082, 174.7850
```

**Step 4:** Find routes
```
Click "Find itineraries"
Routes calculated based on coordinates
Results show journey options
```

---

## 🌟 Future Enhancements

### **Potential Improvements:**
- 🎯 Recent searches history
- ⭐ Favorite locations
- 🏠 Saved addresses (Home, Work)
- 🗺️ Map pin selection integration
- 🔍 More detailed search filters
- 📍 Popular landmarks list
- 🚉 Transit hub shortcuts
- 🏢 Business/venue search

---

## 🎉 Summary

**Your ATIS system now features:**

✅ **User-friendly place name search**
✅ **Autocomplete dropdown with suggestions**
✅ **Current location button with GPS**
✅ **Reverse geocoding for place names**
✅ **Clean, modern UI with glassmorphism**
✅ **Coordinates reference below**
✅ **Works for both origin and destination**
✅ **Swap function maintains names**

**No more confusing coordinates - just type the place name and go!** 🚀

Try it now in the **🗺️ Plan** tab!

