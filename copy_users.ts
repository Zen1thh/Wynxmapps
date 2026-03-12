import fs from 'fs';
import path from 'path';

const sourcePath = 'components/Users.tsx';
const targetPath = 'components/admin-side/AdminUsers.tsx';

let content = fs.readFileSync(sourcePath, 'utf-8');
content = content.replace('export const Users: React.FC = () => {', 'export const AdminUsers: React.FC = () => {');
content = content.replace("import { Card } from './ui/Card';", "import { Card } from '../ui/Card';");
content = content.replace("import { Modal } from './ui/Modal';", "import { Modal } from '../ui/Modal';");
content = content.replace("import { MOCK_USERS } from '../constants';", "import { MOCK_USERS } from '../../constants';");
content = content.replace("import { User } from '../types';", "import { User } from '../../types';");

fs.writeFileSync(targetPath, content, 'utf-8');
console.log('File copied and modified successfully.');
