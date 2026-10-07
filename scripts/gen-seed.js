const fs = require('fs');
const path = require('path');

// We can compile fakeData or strip TS types with babel/regex
const fakeDataContent = fs.readFileSync(path.join(__dirname, '../data/fakeData.ts'), 'utf8');

// Use babel or simple regex extraction
// Let's see what babel / ts tools are in node_modules
const ts = require('typescript');
const result = ts.transpileModule(fakeDataContent, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
});

const tempFile = path.join(__dirname, 'temp_fakeData.js');
fs.writeFileSync(tempFile, result.outputText);

const { FAKE_CHALLENGES, FAKE_EXERCISES } = require(tempFile);
fs.unlinkSync(tempFile);

console.log('Challenges count:', FAKE_CHALLENGES.length);
console.log('Exercises count:', FAKE_EXERCISES.length);

let sql = `-- SweatFlix Seed Data: Exercises and Challenges
-- Generated from data/fakeData.ts

-- 1. Challenges
INSERT INTO public.challenges (id, title, days, target, description, banner_color)
VALUES
`;

const escapeSql = (str) => (str ? str.replace(/'/g, "''") : '');

const challengeRows = FAKE_CHALLENGES.map((c) => {
  return `  ('${escapeSql(c.id)}', '${escapeSql(c.title)}', ${c.totalDays}, 'Full Completion', '${escapeSql(c.description)}', '${escapeSql(c.bannerColor)}')`;
});
sql += challengeRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET\n  title = EXCLUDED.title,\n  days = EXCLUDED.days,\n  description = EXCLUDED.description,\n  banner_color = EXCLUDED.banner_color;\n\n';

sql += `-- 2. Exercises (${FAKE_EXERCISES.length} total across 6 body parts)
INSERT INTO public.exercises (id, name, body_part, level, duration_or_reps, kcal, thumbnail_url, video_url, steps, is_premium)
VALUES
`;

const exerciseRows = FAKE_EXERCISES.map((e) => {
  const stepsArray = "ARRAY[" + e.steps.map(s => `'${escapeSql(s)}'`).join(', ') + "]";
  return `  ('${escapeSql(e.id)}', '${escapeSql(e.name)}', '${escapeSql(e.bodyPart)}', '${escapeSql(e.level)}', '${escapeSql(e.reps)}', ${e.kcal}, '${escapeSql(e.thumbnail)}', '${escapeSql(e.videoUrl)}', ${stepsArray}, ${e.isPremium})`;
});

sql += exerciseRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET\n  name = EXCLUDED.name,\n  body_part = EXCLUDED.body_part,\n  level = EXCLUDED.level,\n  duration_or_reps = EXCLUDED.duration_or_reps,\n  kcal = EXCLUDED.kcal,\n  thumbnail_url = EXCLUDED.thumbnail_url,\n  video_url = EXCLUDED.video_url,\n  steps = EXCLUDED.steps,\n  is_premium = EXCLUDED.is_premium;\n';

const supabaseDir = path.join(__dirname, '../supabase');
if (!fs.existsSync(supabaseDir)) {
  fs.mkdirSync(supabaseDir, { recursive: true });
}

fs.writeFileSync(path.join(supabaseDir, 'seed.sql'), sql, 'utf8');
console.log('Successfully generated supabase/seed.sql');
