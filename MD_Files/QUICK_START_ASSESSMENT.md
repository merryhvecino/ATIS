# 🚀 Quick Start - Assessment Features

## Test the New Features in 5 Minutes

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- Logged in to ATIS

---

## ✅ Test Checklist

### 1. Carbon Footprint Calculator (2 min)

**Steps:**
1. Click **"Plan"** tab in navigation
2. Set origin: "Auckland CBD"
3. Set destination: "Auckland Airport"
4. Click **"Find itineraries"**
5. Click **"▶ View Details"** on any itinerary
6. Scroll down to see:
   - ✅ Updated **"🌱 CO₂ Savings"** stat with real data
   - ✅ **"🌍 Environmental Impact Analysis"** section

**What to Look For:**
- Real CO₂ calculations (not placeholder data)
- Percentage savings vs. car
- Per-leg emissions breakdown
- Tree equivalent metrics
- Eco-score rating

**Screenshot This:** Environmental Impact Analysis section

---

### 2. MCDA Scoring (2 min)

**Steps:**
1. Same trip from above (should have 3 route options)
2. In **"View Details"**, look for:
   - ✅ **Score badge** next to route number (e.g., "78.5/100")
   - ✅ **Rank badge** (#1, #2, #3)
   - ✅ **"🏆 Multi-Criteria Decision Score"** section

**What to Look For:**
- Total MCDA score (0-100)
- Rank among alternatives
- Breakdown by 5 criteria:
  - ⏱️ Time
  - 💰 Cost
  - 🛋️ Comfort
  - ✓ Reliability
  - 🌱 Environmental
- Color-coded bars (green/blue/yellow)
- AI recommendation text
- Weight distribution at bottom

**Screenshot This:** MCDA Score Breakdown section

---

### 3. Analytics Dashboard (1 min)

**Steps:**
1. Click **"Analytics"** tab in navigation
2. View the dashboard (loads automatically)
3. Check sections:
   - ✅ **4 Summary stat cards** (Trips, Users, CO₂, MCDA)
   - ✅ **System Performance** metrics
   - ✅ **MCDA Insights** panel
   - ✅ **Environmental Impact Summary**

**What to Look For:**
- Real numbers based on your planned trips
- CO₂ savings accumulating
- Average MCDA scores
- Tree equivalents
- Car trips avoided

**Screenshot This:** Full Analytics Dashboard

---

## 🎯 Demo Scenario for Presentation

### Scenario: Commute from Home to University

```
1. Login to ATIS
2. Go to Plan tab
3. Enter:
   - Origin: "Albany, Auckland"
   - Destination: "Auckland CBD"
   - Optimize: "Fastest"
   - Modes: Bus + Train + Walk
4. Click "Find itineraries"
5. Review 3 options with:
   - Different MCDA scores
   - Different CO₂ impacts
   - Different trade-offs
```

### Talking Points:

**Carbon Calculator:**
> "This route saves 1.8kg of CO₂ compared to driving alone—that's a 76% reduction. Over a year of commuting, this would require 8 trees to offset if I drove."

**MCDA Scoring:**
> "Option #1 scores highest at 82/100 because it excels in time (90/100) and reliability (88/100), though it costs slightly more. The system balances 5 criteria with customizable weights."

**Analytics:**
> "The dashboard shows that across all users, we've collectively planned 42 trips, saved 85kg of CO₂, and avoided 42 car trips. The average MCDA score of 76.8 indicates good route quality."

---

## 📸 Key Screenshots to Capture

### For Report/Presentation:

1. **Trip Planning Results**
   - Shows 3 itineraries with MCDA scores and ranks
   - Visible score badges: #1 (82.5), #2 (78.3), #3 (74.1)

2. **Environmental Impact**
   - Full "🌍 Environmental Impact Analysis" section
   - Shows CO₂ saved, distance, trees, per-leg breakdown

3. **MCDA Breakdown**
   - Full "🏆 Multi-Criteria Decision Score" section
   - Shows all 5 criteria with progress bars and scores

4. **Analytics Dashboard**
   - Top section with 4 summary cards
   - System Performance metrics grid
   - Environmental Impact Summary panel

---

## 🐛 Troubleshooting

### Issue: No MCDA scores showing

**Solution:**
- Backend might need restart
- Check console for errors
- Verify `/plan` endpoint returns `mcda_score` field

### Issue: Environmental data missing

**Solution:**
- Check backend logs for `environmental.py` errors
- Verify trip has `environmental` object in response

### Issue: Analytics shows all zeros

**Solution:**
- You need to plan at least one trip first
- Click "Analytics" tab to reload data
- Check if backend created `analytics_data.json`

---

## 📊 Expected Results

### After Planning 3 Trips:

**Analytics Dashboard Should Show:**
- Total Trips: 3
- Total CO₂ Saved: ~5-10 kg
- Avg MCDA Score: ~75-80
- Distance: ~30-60 km

**Each Itinerary Should Have:**
- MCDA Score: 50-95 range
- Rank: #1, #2, or #3
- Environmental data: CO₂, savings, trees
- 5 criterion scores: Time, Cost, Comfort, Reliability, Environmental

---

## 🎓 Assessment Talking Points

### Feature 1: Carbon Footprint
- **ITS Concept:** Sustainability metrics in transportation
- **Innovation:** Real-time modal comparison
- **Impact:** User behavior change through awareness

### Feature 2: MCDA
- **ITS Concept:** Multi-objective optimization
- **Innovation:** Customizable preference weights
- **Impact:** Personalized route recommendations

### Feature 3: Analytics
- **ITS Concept:** Data-driven system evaluation
- **Innovation:** Real-time performance monitoring
- **Impact:** Evidence-based planning insights

---

## ⏱️ Time Breakdown

- **Setup & Login:** 30 seconds
- **Test Carbon Calculator:** 2 minutes
- **Test MCDA Scoring:** 2 minutes
- **Test Analytics:** 1 minute
- **Screenshot & Notes:** 1 minute
- **Total:** ~6-7 minutes

---

## ✅ Ready for Assessment!

All three features are:
- ✅ Fully implemented
- ✅ Integrated into UI
- ✅ Working with real data
- ✅ Visually polished
- ✅ Documented

### Next Steps:
1. Test each feature following this guide
2. Capture screenshots
3. Review `ASSESSMENT_FEATURES.md` for technical details
4. Prepare demo for presentation

**Good luck with your assessment!** 🎉

