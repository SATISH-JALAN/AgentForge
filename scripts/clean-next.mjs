import { rm } from 'node:fs/promises';

try {
  await rm('.next', { recursive: true, force: true });
} catch (error) {
  if (error instanceof Error) {
    console.error(`Failed to clean .next: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.error('Failed to clean .next');
    process.exitCode = 1;
  }
}