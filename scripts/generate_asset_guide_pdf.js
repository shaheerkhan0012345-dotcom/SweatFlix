const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const img1Path = path.join(__dirname, '..', 'assets', 'reference_3d_body_model.jpg');
const img2Path = path.join(__dirname, '..', 'assets', 'reference_exercise_and_rail.jpg');

let base64Img1 = '';
let base64Img2 = '';

if (fs.existsSync(img1Path)) {
  base64Img1 = `data:image/jpeg;base64,${fs.readFileSync(img1Path).toString('base64')}`;
}
if (fs.existsSync(img2Path)) {
  base64Img2 = `data:image/jpeg;base64,${fs.readFileSync(img2Path).toString('base64')}`;
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SweatFlix - Master Asset Generation Guide</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 14mm 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      background: #FFFFFF;
      font-size: 9.5pt;
      line-height: 1.4;
    }

    .section-block {
      page-break-inside: avoid;
      margin-bottom: 14px;
    }

    .page-break {
      page-break-before: always;
    }

    /* Header banner */
    .header-banner {
      background: #0F172A;
      color: #FFFFFF;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 12px;
      border-left: 6px solid #EF4444;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-title {
      font-size: 18pt;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      font-size: 9.5pt;
      color: #94A3B8;
      margin-top: 2px;
    }
    .header-badge {
      background: #EF4444;
      color: #FFFFFF;
      padding: 5px 12px;
      border-radius: 16px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Headings */
    h2 {
      font-size: 13pt;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #EF4444;
      margin-top: 10px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 6px;
      color: #334155;
      font-size: 9pt;
    }

    /* Callouts */
    .callout {
      background: #F8FAFC;
      border-left: 4px solid #3B82F6;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    .callout-gold {
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
    }
    .callout-red {
      background: #FEF2F2;
      border-left: 4px solid #EF4444;
    }

    /* Reference Images Showcase */
    .images-grid {
      display: flex;
      gap: 12px;
      margin: 8px 0 12px 0;
      page-break-inside: avoid;
    }
    .image-card {
      flex: 1;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px;
      text-align: center;
    }
    .image-card img {
      max-height: 200px;
      max-width: 100%;
      object-fit: contain;
      border-radius: 4px;
      background: #FFFFFF;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .image-caption {
      font-size: 8pt;
      font-weight: 700;
      color: #475569;
      margin-top: 6px;
    }

    /* Code & Prompt block */
    .prompt-box {
      background: #0F172A;
      color: #E2E8F0;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: "Consolas", monospace;
      font-size: 8pt;
      line-height: 1.35;
      margin: 4px 0 10px 0;
      border: 1px solid #1E293B;
      page-break-inside: avoid;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 10px 0;
      font-size: 8pt;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th {
      background: #0F172A;
      color: #FFFFFF;
      text-align: left;
      padding: 5px 6px;
      font-weight: 700;
      font-size: 8pt;
    }
    td {
      padding: 4px 6px;
      border-bottom: 1px solid #E2E8F0;
      color: #334155;
    }
    tr:nth-child(even) td {
      background: #F8FAFC;
    }
    .file-name {
      font-family: "Consolas", monospace;
      color: #DC2626;
      font-weight: 700;
      font-size: 7.5pt;
    }
    .pill {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 7pt;
      font-weight: 700;
      background: #E2E8F0;
      color: #475569;
    }
    .pill-red {
      background: #FEE2E2;
      color: #B91C1C;
    }
    .pill-green {
      background: #DCFCE7;
      color: #15803D;
    }
    .pill-gold {
      background: #FEF3C7;
      color: #B45309;
    }

    /* Folder structure tree */
    .folder-tree {
      background: #0F172A;
      color: #38BDF8;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: "Consolas", monospace;
      font-size: 8pt;
      line-height: 1.45;
      margin: 8px 0;
      page-break-inside: avoid;
    }
    .folder-comment {
      color: #94A3B8;
      font-style: italic;
    }

    .footer {
      margin-top: 10px;
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #94A3B8;
    }
  </style>
</head>
<body>

  <!-- ==================== SECTION 1: COVER & VISUAL STANDARDS ==================== -->
  <div class="header-banner">
    <div>
      <div class="header-title">SWEATFLIX ATHLETICS</div>
      <div class="header-subtitle">Official AI Asset Generation & Specification Guide</div>
    </div>
    <div class="header-badge">MASTER SPECIFICATION</div>
  </div>

  <div class="callout callout-gold">
    <strong>Instructions for Asset Generation:</strong> Use this document to generate standalone, watermark-free images and loop videos for SweatFlix. All filenames match our React Native database schema for instant plug-and-play integration.
  </div>

  <h2>1. 3D Body & Anatomy Visual Standards</h2>
  <p>All exercise movements and anatomical models follow a <strong>metallic chrome athletic CGI figure</strong> style with glowing active muscle indicators and isolated pure white backgrounds.</p>

  <div class="images-grid">
    <div class="image-card">
      <img src="${base64Img1}" alt="3D Model Movement Reference" />
      <div class="image-caption">Fig 1.1: Chrome Athletic Model (Barbell Military Press)</div>
    </div>
    <div class="image-card">
      <img src="${base64Img2}" alt="Exercise + Active Muscle Rail" />
      <div class="image-caption">Fig 1.2: Movement View + Active Muscle Highlight Rail</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Attribute</th>
        <th style="width: 48%;">Specification Standard</th>
        <th style="width: 30%;">Avoid</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Body Material</strong></td>
        <td>Chrome silver / metallic titanium muscular anatomy with deep striations</td>
        <td>Fleshy skin tones, cartoonish plastic, skinless anatomy</td>
      </tr>
      <tr>
        <td><strong>Apparel</strong></td>
        <td>Solid black or dark charcoal athletic compression trunks / shorts</td>
        <td>Baggy shirts, bright shoes, visible third-party logos</td>
      </tr>
      <tr>
        <td><strong>Active Muscle Glow</strong></td>
        <td>Glowing neon overlay on firing muscle group (Crimson Red or Cyan Blue)</td>
        <td>Whole-body aura, messy gradients</td>
      </tr>
      <tr>
        <td><strong>Background</strong></td>
        <td>Pure solid white (<code>#FFFFFF</code>) or transparent PNG alpha channel</td>
        <td>Gym walls, floor shadows, reflections</td>
      </tr>
      <tr>
        <td><strong>Format & Ratio</strong></td>
        <td>1080x1080 (1:1 Square) or 1080x1440 (3:4 Portrait), high resolution JPG/PNG</td>
        <td>Watermarks, text, phone borders</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 2: PROMPTS & ANATOMY ==================== -->
  <div class="page-break"></div>

  <h2>2. Ready-to-Copy AI Generation Prompts</h2>

  <h3>A. Exercise Movement Prompt (Midjourney / DALL-E / Leonardo)</h3>
  <div class="prompt-box">
3D medical athletic CGI render of a muscular male bodybuilder performing [EXERCISE NAME, e.g. Barbell Standing Military Press], perfect biomechanical posture, chrome silver and metallic grey muscular anatomy, deep muscle definition and striations, black compression athletic shorts, active [TARGET MUSCLE, e.g. Anterior Deltoid and Triceps] highlighted in glowing crimson red, isolated on pure solid white background, high-end sports medicine visualization, 8k resolution, crisp studio lighting --no background, floor, shadows, gym, watermarks, text
  </div>

  <h3>B. Standing Neutral Anatomy (Anterior Front & Posterior Back)</h3>
  <div class="prompt-box">
Full body 3D anatomical CGI illustration of an athletic muscular man standing in neutral anatomical posture, [front view / back view], chrome silver metallic muscle tone, defined abdominal six-pack, vascularity, wearing black compression trunks, [chest / back] highlighted with soft glowing red overlay, isolated on pure white background, medical precision, clean render, 8k --no shadows, floor, clothes, text
  </div>

  <h2>3. Master Anatomy Models Manifest (8 Files)</h2>
  <p>Place these files into: <code>assets/images/anatomy/</code></p>

  <table>
    <thead>
      <tr>
        <th style="width: 32%;">Target File Name</th>
        <th style="width: 28%;">Anatomy View</th>
        <th style="width: 40%;">Active Muscle Highlight Zone</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="file-name">body_anterior_full.jpg</td>
        <td>Full Front Body View</td>
        <td>Full anterior balance (Pectorals, Abdominals, Quadriceps)</td>
      </tr>
      <tr>
        <td class="file-name">body_posterior_full.jpg</td>
        <td>Full Rear Body View</td>
        <td>Full posterior chain (Latissimus, Traps, Glutes, Hamstrings)</td>
      </tr>
      <tr>
        <td class="file-name">focus_chest.jpg</td>
        <td>Chest Torso Close-up</td>
        <td>Pectoralis Major & Clavicular Head (Red Glow)</td>
      </tr>
      <tr>
        <td class="file-name">focus_back.jpg</td>
        <td>Upper Back Close-up</td>
        <td>Latissimus Dorsi, Rhomboids & Mid-Traps (Red Glow)</td>
      </tr>
      <tr>
        <td class="file-name">focus_shoulders.jpg</td>
        <td>Shoulders Close-up</td>
        <td>Anterior, Lateral & Posterior Deltoids (Red Glow)</td>
      </tr>
      <tr>
        <td class="file-name">focus_arms.jpg</td>
        <td>Biceps & Triceps Close-up</td>
        <td>Biceps Brachii & Triceps Lateral Head (Red Glow)</td>
      </tr>
      <tr>
        <td class="file-name">focus_abs.jpg</td>
        <td>Core Midsection Close-up</td>
        <td>Rectus Abdominis & External Obliques (Red Glow)</td>
      </tr>
      <tr>
        <td class="file-name">focus_legs.jpg</td>
        <td>Lower Body Close-up</td>
        <td>Quadriceps, Hamstrings & Calves (Red Glow)</td>
      </tr>
    </tbody>
  </table>

  <div class="callout callout-red">
    <strong>Side Rail Thumbnails:</strong> Generate small square crops (200x200px) named <code>thumb_ant_delts.jpg</code>, <code>thumb_front_delts.jpg</code>, <code>thumb_shoulders_rail.jpg</code> for the vertical exercise screen rail.
  </div>

  <!-- ==================== SECTION 3: 36 EXERCISE VIDEOS ==================== -->
  <div class="page-break"></div>

  <h2>4. Workout Exercises & Video Library (36 Movements)</h2>
  <p>Save these short 5-12s looping video clips (MP4, H.264, 720p/1080p, 16:9 or 9:16) in: <code>assets/videos/exercises/</code></p>

  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Muscle Group</th>
        <th style="width: 30%;">Exercise Name</th>
        <th style="width: 35%;">Target Video File Name</th>
        <th style="width: 20%;">Key Cadence</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><span class="pill pill-red">CHEST</span></td><td>Standard Push-Ups</td><td class="file-name">chest_standard_pushups.mp4</td><td>2s down, 1s press</td></tr>
      <tr><td><span class="pill pill-red">CHEST</span></td><td>Incline Dumbbell Press</td><td class="file-name">chest_incline_dumbbell_press.mp4</td><td>30 deg bench, press arc</td></tr>
      <tr><td><span class="pill pill-red">CHEST</span></td><td>Dumbbell Chest Flyes</td><td class="file-name">chest_dumbbell_flyes.mp4</td><td>Slight elbow bend, squeeze</td></tr>
      <tr><td><span class="pill pill-red">CHEST</span></td><td>Diamond Push-Ups</td><td class="file-name">chest_diamond_pushups.mp4</td><td>Hands touching, triceps</td></tr>
      <tr><td><span class="pill pill-red">CHEST</span></td><td>Cable Crossover</td><td class="file-name">chest_cable_crossover.mp4</td><td>High pulley to hip cross</td></tr>
      <tr><td><span class="pill pill-red">CHEST</span></td><td>Decline Push-Ups</td><td class="file-name">chest_decline_pushups.mp4</td><td>Feet elevated on box</td></tr>

      <tr><td><span class="pill">BACK</span></td><td>Overhand Pull-Ups</td><td class="file-name">back_pullups.mp4</td><td>Chin clears bar, full hang</td></tr>
      <tr><td><span class="pill">BACK</span></td><td>Bent-Over Barbell Row</td><td class="file-name">back_barbell_bent_row.mp4</td><td>45 deg hinge, bar to ribs</td></tr>
      <tr><td><span class="pill">BACK</span></td><td>Cable Lat Pulldown</td><td class="file-name">back_lat_pulldown.mp4</td><td>Wide grip, pull to collar</td></tr>
      <tr><td><span class="pill">BACK</span></td><td>Single-Arm Dumbbell Row</td><td class="file-name">back_dumbbell_row.mp4</td><td>Knee on bench, elbow high</td></tr>
      <tr><td><span class="pill">BACK</span></td><td>Conventional Deadlift</td><td class="file-name">back_barbell_deadlift.mp4</td><td>Hip hinge, shins to bar</td></tr>
      <tr><td><span class="pill">BACK</span></td><td>Cable Face Pulls</td><td class="file-name">back_cable_face_pulls.mp4</td><td>Rope to eyes, external rot</td></tr>

      <tr><td><span class="pill pill-gold">SHOULDERS</span></td><td>Standing Military Press</td><td class="file-name">shoulder_military_press.mp4</td><td>Overhead lockout, core brace</td></tr>
      <tr><td><span class="pill pill-gold">SHOULDERS</span></td><td>Dumbbell Lateral Raise</td><td class="file-name">shoulder_lateral_raises.mp4</td><td>Elbows parallel to ground</td></tr>
      <tr><td><span class="pill pill-gold">SHOULDERS</span></td><td>Arnold Dumbbell Press</td><td class="file-name">shoulder_arnold_press.mp4</td><td>180 deg wrist rotation</td></tr>
      <tr><td><span class="pill pill-gold">SHOULDERS</span></td><td>Front Plate Raise</td><td class="file-name">shoulder_front_plate_raise.mp4</td><td>Weight plate to eye level</td></tr>
      <tr><td><span class="pill pill-gold">SHOULDERS</span></td><td>Reverse Pec-Deck Fly</td><td class="file-name">shoulder_reverse_pec_deck.mp4</td><td>Rear delt squeeze</td></tr>
      <tr><td><span class="pill pill-gold">SHOULDERS</span></td><td>Barbell Upright Row</td><td class="file-name">shoulder_upright_row.mp4</td><td>Wide grip, elbows high</td></tr>

      <tr><td><span class="pill">ARMS</span></td><td>Barbell Biceps Curl</td><td class="file-name">arms_barbell_bicep_curl.mp4</td><td>Elbows pinned to ribs</td></tr>
      <tr><td><span class="pill">ARMS</span></td><td>Cable Triceps Pushdown</td><td class="file-name">arms_triceps_rope_pushdown.mp4</td><td>Rope flare at bottom</td></tr>
      <tr><td><span class="pill">ARMS</span></td><td>Dumbbell Hammer Curl</td><td class="file-name">arms_dumbbell_hammer_curl.mp4</td><td>Neutral grip, brachialis</td></tr>
      <tr><td><span class="pill">ARMS</span></td><td>Overhead Triceps Extension</td><td class="file-name">arms_overhead_triceps_ext.mp4</td><td>Dumbbell behind head</td></tr>
      <tr><td><span class="pill">ARMS</span></td><td>EZ-Bar Preacher Curl</td><td class="file-name">arms_preacher_curl.mp4</td><td>Preacher bench isolation</td></tr>
      <tr><td><span class="pill">ARMS</span></td><td>Parallel Bar Dips</td><td class="file-name">arms_parallel_bar_dips.mp4</td><td>Lower to 90 deg, lockout</td></tr>

      <tr><td><span class="pill pill-green">ABS</span></td><td>Forearm Plank Hold</td><td class="file-name">abs_standard_plank.mp4</td><td>Rigid straight body line</td></tr>
      <tr><td><span class="pill pill-green">ABS</span></td><td>Hanging Leg Raise</td><td class="file-name">abs_hanging_leg_raise.mp4</td><td>Legs to 90 deg, no swing</td></tr>
      <tr><td><span class="pill pill-green">ABS</span></td><td>Bicycle Crunches</td><td class="file-name">abs_bicycle_crunches.mp4</td><td>Opposite knee to elbow</td></tr>
      <tr><td><span class="pill pill-green">ABS</span></td><td>Cable Woodchopper</td><td class="file-name">abs_cable_woodchopper.mp4</td><td>High to low rotational cut</td></tr>
      <tr><td><span class="pill pill-green">ABS</span></td><td>Ab Wheel Rollout</td><td class="file-name">abs_ab_wheel_rollout.mp4</td><td>From knees, roll to chest</td></tr>
      <tr><td><span class="pill pill-green">ABS</span></td><td>Weighted Russian Twists</td><td class="file-name">abs_russian_twist.mp4</td><td>Torso twist with plate</td></tr>

      <tr><td><span class="pill pill-red">LEGS</span></td><td>Barbell Back Squats</td><td class="file-name">legs_barbell_squat.mp4</td><td>Crease below knee parallel</td></tr>
      <tr><td><span class="pill pill-red">LEGS</span></td><td>Romanian Deadlift</td><td class="file-name">legs_romanian_deadlift.mp4</td><td>Hip hinge, hamstring stretch</td></tr>
      <tr><td><span class="pill pill-red">LEGS</span></td><td>Bulgarian Split Squat</td><td class="file-name">legs_bulgarian_split_squat.mp4</td><td>Rear foot on bench</td></tr>
      <tr><td><span class="pill pill-red">LEGS</span></td><td>45-Degree Leg Press</td><td class="file-name">legs_leg_press_machine.mp4</td><td>Deep sled press, no knee snap</td></tr>
      <tr><td><span class="pill pill-red">LEGS</span></td><td>Walking Dumbbell Lunges</td><td class="file-name">legs_walking_lunges.mp4</td><td>Knee kisses floor lightly</td></tr>
      <tr><td><span class="pill pill-red">LEGS</span></td><td>Standing Calf Raises</td><td class="file-name">legs_standing_calf_raise.mp4</td><td>Peak calf squeeze pause</td></tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 4: 30-DAY MONTHLY DIET ==================== -->
  <div class="page-break"></div>

  <h2>5. 30-Day Monthly Diet Image Manifest (30 Gourmet Meals)</h2>
  <p>Place high-resolution food photography (16:9 or 4:3, well-lit, appetizing, plated cleanly) into: <code>assets/images/meals/</code></p>

  <h3>A. Breakfasts (7 Rotating Morning Meals)</h3>
  <table>
    <thead><tr><th style="width: 32%;">Target File Name</th><th style="width: 30%;">Dish Name</th><th style="width: 15%;">Kcal</th><th style="width: 23%;">Presentation</th></tr></thead>
    <tbody>
      <tr><td class="file-name">breakfast_beef_bacon_eggs.jpg</td><td>Halal Smoked Beef Bacon & Soft Eggs</td><td>380 Kcal</td><td>Halal beef bacon, 2 eggs, sourdough toast</td></tr>
      <tr><td class="file-name">breakfast_banana_oats.jpg</td><td>Rolled Oats with Banana & Berries</td><td>340 Kcal</td><td>Oatmeal bowl, banana slices, blueberries</td></tr>
      <tr><td class="file-name">breakfast_avocado_toast.jpg</td><td>Poached Egg Avocado Toast</td><td>310 Kcal</td><td>Sourdough, smashed avocado, 2 eggs</td></tr>
      <tr><td class="file-name">breakfast_protein_pancakes.jpg</td><td>Oat Flour Protein Pancakes</td><td>420 Kcal</td><td>3 golden pancakes with maple drizzle</td></tr>
      <tr><td class="file-name">breakfast_greek_parfait.jpg</td><td>Greek Yogurt Granola Parfait</td><td>290 Kcal</td><td>Yogurt jar with raw honey and walnuts</td></tr>
      <tr><td class="file-name">breakfast_spinach_omelet.jpg</td><td>Spinach & Feta Egg White Omelet</td><td>260 Kcal</td><td>Folded omelet with wilted spinach</td></tr>
      <tr><td class="file-name">breakfast_chia_pudding.jpg</td><td>Overnight Chia Berry Pudding</td><td>280 Kcal</td><td>Chia seed glass jar with raspberries</td></tr>
    </tbody>
  </table>

  <h3>B. Morning Snacks (5 Mid-Morning Options)</h3>
  <table>
    <thead><tr><th style="width: 32%;">Target File Name</th><th style="width: 30%;">Dish Name</th><th style="width: 15%;">Kcal</th><th style="width: 23%;">Presentation</th></tr></thead>
    <tbody>
      <tr><td class="file-name">snack_apple_almond.jpg</td><td>Crisp Apple & Almond Butter</td><td>180 Kcal</td><td>Apple slices with almond butter dip</td></tr>
      <tr><td class="file-name">snack_protein_bar.jpg</td><td>Homemade Dark Oat Protein Bar</td><td>220 Kcal</td><td>Square cut bar on parchment paper</td></tr>
      <tr><td class="file-name">snack_cottage_berries.jpg</td><td>Cottage Cheese & Blackberries</td><td>160 Kcal</td><td>White porcelain bowl with berries</td></tr>
      <tr><td class="file-name">snack_boiled_eggs.jpg</td><td>Hard-Boiled Eggs with Paprika</td><td>150 Kcal</td><td>Two halved eggs with golden yolk</td></tr>
      <tr><td class="file-name">snack_mixed_nuts.jpg</td><td>Raw Athletic Trail Nut Mix</td><td>200 Kcal</td><td>Almonds, walnuts, pumpkin seeds</td></tr>
    </tbody>
  </table>

  <h3>C. Lunches (8 High-Protein Entrees)</h3>
  <table>
    <thead><tr><th style="width: 32%;">Target File Name</th><th style="width: 30%;">Dish Name</th><th style="width: 15%;">Kcal</th><th style="width: 23%;">Presentation</th></tr></thead>
    <tbody>
      <tr><td class="file-name">lunch_spicy_chicken.jpg</td><td>Cajun Grilled Chicken & Rice</td><td>480 Kcal</td><td>Grilled sliced breast, jasmine rice & greens</td></tr>
      <tr><td class="file-name">lunch_salmon_quinoa.jpg</td><td>Pan-Seared Atlantic Salmon</td><td>520 Kcal</td><td>Crisp salmon fillet, quinoa, asparagus</td></tr>
      <tr><td class="file-name">lunch_beef_sweetpotato.jpg</td><td>Lean Sirloin & Sweet Potato</td><td>540 Kcal</td><td>Sirloin steak with roasted potato wedges</td></tr>
      <tr><td class="file-name">lunch_turkey_wrap.jpg</td><td>Whole-Wheat Roast Turkey Wrap</td><td>410 Kcal</td><td>Rolled flatbread cut diagonally</td></tr>
      <tr><td class="file-name">lunch_tuna_poke.jpg</td><td>Ahi Tuna Rice Poke Bowl</td><td>460 Kcal</td><td>Ahi tuna, edamame, cucumber, sesame</td></tr>
      <tr><td class="file-name">lunch_chicken_fajita.jpg</td><td>Mexican Chicken Fajita Bowl</td><td>490 Kcal</td><td>Charred chicken strips, sautéed peppers</td></tr>
      <tr><td class="file-name">lunch_tofu_stirfry.jpg</td><td>Crispy Sesame Tofu Bowl</td><td>430 Kcal</td><td>Golden tofu cubes with snap peas</td></tr>
      <tr><td class="file-name">lunch_shrimp_pasta.jpg</td><td>Garlic Herb Jumbo Shrimp Pasta</td><td>470 Kcal</td><td>Sautéed prawns with whole-wheat ribbon pasta</td></tr>
    </tbody>
  </table>

  <h3>D. Evening Snacks & E. Dinners (10 Combined Options)</h3>
  <table>
    <thead><tr><th style="width: 32%;">Target File Name</th><th style="width: 30%;">Dish Name</th><th style="width: 15%;">Slot / Kcal</th><th style="width: 23%;">Presentation</th></tr></thead>
    <tbody>
      <tr><td class="file-name">snack_peanut_banana.jpg</td><td>Banana & Natural Peanut Butter</td><td>Snack (240 Kcal)</td><td>Sliced banana with dollops of peanut butter</td></tr>
      <tr><td class="file-name">snack_whey_smoothie.jpg</td><td>Dark Cocoa Whey Protein Shake</td><td>Snack (210 Kcal)</td><td>Tall glass with rich chocolate protein shake</td></tr>
      <tr><td class="file-name">snack_rice_cakes.jpg</td><td>Salted Rice Cakes with Turkey</td><td>Snack (140 Kcal)</td><td>Two rice cakes topped with lean turkey</td></tr>
      <tr><td class="file-name">snack_dark_chocolate.jpg</td><td>85% Dark Chocolate & Walnuts</td><td>Snack (190 Kcal)</td><td>Two squares dark chocolate, walnut halves</td></tr>
      <tr><td class="file-name">dinner_salad_bowl.jpg</td><td>Mediterranean Tuna Salad Bowl</td><td>Dinner (350 Kcal)</td><td>Flaked tuna, Kalamata olives, cucumbers</td></tr>
      <tr><td class="file-name">dinner_cod_greens.jpg</td><td>Baked Cod Fillet & Green Beans</td><td>Dinner (320 Kcal)</td><td>White cod baked with lemon butter</td></tr>
      <tr><td class="file-name">dinner_turkey_meatballs.jpg</td><td>Lean Turkey Meatballs & Zucchini</td><td>Dinner (390 Kcal)</td><td>Turkey meatballs over spiralized zucchini</td></tr>
      <tr><td class="file-name">dinner_flank_steak.jpg</td><td>Grilled Flank Steak & Asparagus</td><td>Dinner (440 Kcal)</td><td>Sliced flank steak with grilled asparagus</td></tr>
      <tr><td class="file-name">dinner_salmon_bowl.jpg</td><td>Teriyaki Wild Salmon & Cauliflower</td><td>Dinner (460 Kcal)</td><td>Glazed salmon fillet with cauliflower purée</td></tr>
      <tr><td class="file-name">dinner_chicken_soup.jpg</td><td>Hearty Shredded Chicken Broth</td><td>Dinner (280 Kcal)</td><td>Clear chicken broth with carrots & celery</td></tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 5: CHALLENGES & DIRECTORY ==================== -->
  <div class="page-break"></div>

  <h2>6. Challenge Covers & Home Hero Banners (4 Images)</h2>
  <p>Save these 1920x1080 (16:9) cinematic horizontal images in: <code>assets/images/challenges/</code></p>

  <table>
    <thead><tr><th style="width: 35%;">Target Filename</th><th style="width: 25%;">Challenge Name</th><th style="width: 40%;">Cinematic Concept</th></tr></thead>
    <tbody>
      <tr><td class="file-name">challenge_fatburn_cover.jpg</td><td>30-Day Fat Burn Generator</td><td>Athletes with arms crossed / battle ropes, energetic blue studio</td></tr>
      <tr><td class="file-name">challenge_hypertrophy_cover.jpg</td><td>Upper Body Hypertrophy</td><td>Muscular athlete lifting heavy barbell, dramatic purple/dark gym</td></tr>
      <tr><td class="file-name">challenge_cardio_cover.jpg</td><td>Morning Cardio Blitz</td><td>Sprinting runner under dark stadium floodlights, dynamic mist</td></tr>
      <tr><td class="file-name">hero_workout_card.jpg</td><td>Today's Workout Home Hero</td><td>Physique bodybuilder holding barbell, clean premium lighting</td></tr>
    </tbody>
  </table>

  <h2>7. Project Directory Structure</h2>
  <p>Place your generated files directly into these exact folders in your project directory:</p>

  <div class="folder-tree">
fitness app/
└── assets/
    ├── images/
    │   ├── anatomy/       <span class="folder-comment">← 8 3D Anatomy files (body_anterior_full.jpg, focus_chest.jpg, etc.)</span>
    │   ├── meals/         <span class="folder-comment">← 30 Gourmet meal images (breakfast_beef_bacon_eggs.jpg, etc.)</span>
    │   └── challenges/    <span class="folder-comment">← 4 Cinematic covers (challenge_fatburn_cover.jpg, etc.)</span>
    └── videos/
        └── exercises/     <span class="folder-comment">← 36 Exercise loop videos (chest_standard_pushups.mp4, etc.)</span>
  </div>

  <div class="callout callout-gold">
    <strong>Delivery Tip:</strong> You can send or paste files in batches (for instance, the 30 Diet images first, or the 3D Anatomy images first). Once placed in the folders above, the app picks them up automatically.
  </div>

  <div class="footer">
    <span>SweatFlix Master Asset Specification Guide</span>
    <span>Generated for Shaheer</span>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(__dirname, '..', 'SweatFlix_Asset_Generation_Guide.html');
const pdfFilePath = path.join(__dirname, '..', 'SweatFlix_Asset_Generation_Guide.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const command = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfFilePath}" --no-pdf-header-footer "${htmlFilePath}"`;

console.log('Regenerating clean-layout PDF...');
execSync(command);

const stats = fs.statSync(pdfFilePath);
console.log(`CLEAN PDF generated successfully! Size: ${stats.size} bytes`);
