const fs = require('fs');
const path = require('path');

const dir = 'd:/Projects/ET Hackathon/Tru-Vox after suganth fixed/Tru-Vox/frontend/src';

const files = [
  'pages/LandingPage.jsx',
  'pages/AuthPage.jsx',
  'pages/ArticlePage.jsx',
  'components/WatchNextCard.jsx',
  'components/NarratorControls.jsx',
  'components/ImpactCard.jsx',
  'components/ChatPanel.jsx',
  'components/AISummaryCard.jsx',
  'components/SentimentBadge.jsx'
];

files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/text-\[(?:8|9|10|11|12)px\]/g, 'text-sm');
    content = content.replace(/text-xs/g, 'text-sm');
    content = content.replace(/text-\[12px\]/g, 'text-sm'); // ensure coverage
    fs.writeFileSync(p, content, 'utf8');
    console.log('Processed', f);
  } else {
    console.log('Missing', f);
  }
});
