// Re-export script agent function
import { getWorkspacePath } from '@/lib/workspace';
process.env.WORKSPACE = getWorkspacePath();
const { generateScript } = require('../../../skills/factory/script');
export { generateScript };