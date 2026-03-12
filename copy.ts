import fs from 'fs';
import path from 'path';

const sourcePath = 'components/Settings.tsx';
const targetPath = 'components/admin-side/AdminSettings.tsx';

let content = fs.readFileSync(sourcePath, 'utf-8');
content = content.replace('export const Settings: React.FC = () => {', 'export const AdminSettings: React.FC = () => {');
content = content.replace("import { Card } from './ui/Card';", "import { Card } from '../ui/Card';");

fs.writeFileSync(targetPath, content, 'utf-8');
console.log('File copied and modified successfully.');
