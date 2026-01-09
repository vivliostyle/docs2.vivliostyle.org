import fs from 'fs';

const content = fs.readFileSync('./submodules/vfm/docs/ja/vfm.md', 'utf-8');

console.log('=== Testing TOC regex ===\n');

// Test manualTocMatch - with |$ like in loader
const manualTocMatch = content.match(/##\s+(目次|Table of Contents|Contents)\s*\n([\s\S]*?)(?=\n##\s|$)/m);
console.log('manualTocMatch found:', !!manualTocMatch);
if (manualTocMatch) {
  console.log('Match[0] length:', manualTocMatch[0].length);
  console.log('Match[1] (heading):', manualTocMatch[1]);
  console.log('Match[2] (content) preview:', manualTocMatch[2].substring(0, 200));
  
  const tocContent = manualTocMatch[2];
  const listMatch = tocContent.match(/^(?:.*\n)*?(- .*(?:\n(?:  - .*|- .*))*)/m);
  console.log('\nlistMatch found:', !!listMatch);
  if (listMatch) {
    console.log('List content preview:', listMatch[1].substring(0, 300));
  }
}

// Test replacement
const processedContent = content.replace(/##\s+(目次|Table of Contents|Contents)\s*\n[\s\S]*?(?=\n##\s|$)/m, '');
console.log('\n=== After replacement ===');
console.log('Original length:', content.length);
console.log('Processed length:', processedContent.length);
console.log('Removed characters:', content.length - processedContent.length);

// Check if "## 目次" still exists
const stillHasToc = processedContent.includes('## 目次');
console.log('Still has "## 目次":', stillHasToc);

// Show first 500 chars after "Vivliostyle Flavored Markdown"
const startIdx = processedContent.indexOf('# Vivliostyle Flavored Markdown');
if (startIdx >= 0) {
  console.log('\nFirst 500 chars after title:');
  console.log(processedContent.substring(startIdx, startIdx + 500));
}
