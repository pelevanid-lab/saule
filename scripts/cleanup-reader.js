const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/components/ContinuousReader.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Remove getBookBeginningContent block
content = content.replace(/const getBookBeginningContent = \([\s\S]*?\n};\n/, '');

// 2. Remove isBookStartItem definition
content = content.replace(/const isBookStartItem = item\.slug === 'preface' \|\| item\.slug === 'how-to-read';\n\s*/, '');

// 3. Remove && !isBookStartItem from various variables
content = content.replace(/\&\& !isBookStartItem/g, '');

// 4. Fix vol definition
content = content.replace(
  /const vol = isVolume\n\s*\? \(item\.metadata as Volume\)\n\s*: isBookStartItem\n\s*\? null\n\s*: volumes\.find\(\(v\) => v\.id === \(item\.metadata as ChapterMetadata \| AppendixMetadata\)\.volumeId\);/,
  `const vol = isVolume
          ? (item.metadata as Volume)
          : volumes.find((v) => v.id === (item.metadata as ChapterMetadata | AppendixMetadata).volumeId);`
);

// 5. Remove isBookStartItem from itemTitle logic
content = content.replace(
  /\s*\} else if \(isBookStartItem\) \{\n\s*itemTitle = item\.slug === 'preface'\n\s*\? \(dictionary\.common\.preface \|\| 'Preface'\)\n\s*: \(dictionary\.common\.how_to_read \|\| 'How should it be Read\?'\);/,
  ''
);

// 6. Remove isBookStartItem from item rendering
// This is the tricky part:
// `) : isBookStartItem ? ( ... ) : (`
const renderBlockRegex = /\s*\) : isBookStartItem \? \([\s\S]*?\/\* STANDARD READING VIEW \(Chapters, Appendices\) \*\//m;
content = content.replace(renderBlockRegex, '\n            ) : (\n              /* STANDARD READING VIEW (Chapters, Appendices) */');


fs.writeFileSync(targetFile, content, 'utf8');
console.log('ContinuousReader.tsx cleaned!');
