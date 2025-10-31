import { readdir, readFile } from 'fs/promises';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'app');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      if (!entry.isFile()) {
        return [];
      }
      // Only inspect TypeScript/TSX/JS/JSX files
      if (!/[.](ts|tsx|js|jsx)$/.test(entry.name)) {
        return [];
      }
      const content = await readFile(fullPath, 'utf8');
      const match = content.match(/export\s+const\s+revalidate\s*=\s*\{/);
      if (match) {
        return [{ file: fullPath, snippet: match[0] }];
      }
      return [];
    })
  );

  return files.flat();
}

const main = async () => {
  try {
    const results = await walk(ROOT);
    if (results.length > 0) {
      console.error('Invalid `revalidate` exports detected:');
      for (const result of results) {
        console.error(` - ${path.relative(process.cwd(), result.file)}: ${result.snippet}`);
      }
      process.exitCode = 1;
      return;
    }
    console.log('No invalid `revalidate` object exports detected under app/.');
  } catch (error) {
    console.error('Failed to scan for invalid revalidate exports:', error);
    process.exitCode = 1;
  }
};

main();
