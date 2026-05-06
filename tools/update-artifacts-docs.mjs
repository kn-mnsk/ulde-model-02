import fs from 'fs';
import path from 'path';

const artifactsPath = path.resolve('src/app/ulde/core/artifacts/ulde-artifacts.ts');
const ownershipPath = path.resolve('tools/artifacts-ownership.json');

const ownership = JSON.parse(fs.readFileSync(ownershipPath, 'utf8'));
const lines = fs.readFileSync(artifactsPath, 'utf8').split('\n');

function makeComment(info, indent) {
  const written = info.writtenBy.join(', ');
  const read = info.readBy.join(', ');

  return [
    `${indent}/**`,
    `${indent} * ${info.description}`,
    `${indent} * Written by: ${written}`,
    `${indent} * Read by: ${read}`,
    `${indent} */`
  ];
}

function isPropertyLine(line, key) {
  return line.trim().startsWith(key + ':') ||
         line.trim().startsWith(key + '?:');
}

function isCommentStart(line) {
  return line.trim().startsWith('/**');
}

function isCommentEnd(line) {
  return line.trim().endsWith('*/');
}

for (let i = 0; i < lines.length; i++) {
  for (const key of Object.keys(ownership)) {
    if (!isPropertyLine(lines[i], key)) continue;

    const indent = lines[i].match(/^\s*/)[0];
    const commentLines = makeComment(ownership[key], indent);

    // Remove existing comment block above the property
    let start = i - 1;
    while (start >= 0 && lines[start].trim() === '') start--;

    if (start >= 0 && isCommentEnd(lines[start])) {
      // Walk up to find the start of the comment
      let end = start;
      while (start >= 0 && !isCommentStart(lines[start])) start--;
      lines.splice(start, end - start + 1);
      i = start; // reset index
    }

    // Remove blank lines above the property
    while (i > 0 && lines[i - 1].trim() === '') {
      lines.splice(i - 1, 1);
      i--;
    }

    // Insert new comment
    lines.splice(i, 0, ...commentLines);
    i += commentLines.length;
  }
}

fs.writeFileSync(artifactsPath, lines.join('\n'), 'utf8');
console.log('ULDE artifacts ownership comments updated.');
