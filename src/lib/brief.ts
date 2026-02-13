// Wrapper for morning brief generator skill
import { getWorkspacePath } from '@/lib/workspace';

// Ensure the skill uses correct workspace root (webpack may virtualize __dirname)
process.env.WORKSPACE = getWorkspacePath();

const { generateBrief } = require('../../skills/brain/morning-brief.js');

export { generateBrief };