// Re-export research agent function
import { getWorkspacePath } from '@/lib/workspace';
process.env.WORKSPACE = getWorkspacePath();
const { runResearch } = require('../../../skills/factory/research');
export { runResearch };