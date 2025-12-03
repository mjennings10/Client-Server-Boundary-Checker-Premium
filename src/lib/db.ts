import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface BoundaryCheck {
  id: string;
  createdAt: string;
  code: string;
  classification: string;
  explanation: string;
}

interface Database {
  boundaryChecks: BoundaryCheck[];
}

const DB_PATH = join(process.cwd(), 'data', 'db.json');

function ensureDbExists(): void {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dataDir, { recursive: true });
  }
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ boundaryChecks: [] }, null, 2));
  }
}

function readDb(): Database {
  ensureDbExists();
  try {
    const data = readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { boundaryChecks: [] };
  }
}

function writeDb(db: Database): void {
  ensureDbExists();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const db = {
  boundaryCheck: {
    create(data: { code: string; classification: string; explanation: string }): BoundaryCheck {
      const database = readDb();
      const newCheck: BoundaryCheck = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...data,
      };
      database.boundaryChecks.unshift(newCheck);
      // Keep only the last 100 checks
      database.boundaryChecks = database.boundaryChecks.slice(0, 100);
      writeDb(database);
      return newCheck;
    },

    findMany(options?: { orderBy?: { createdAt: 'desc' | 'asc' }; take?: number }): BoundaryCheck[] {
      const database = readDb();
      let checks = [...database.boundaryChecks];

      if (options?.orderBy?.createdAt === 'asc') {
        checks.reverse();
      }

      if (options?.take) {
        checks = checks.slice(0, options.take);
      }

      return checks;
    },

    findUnique(options: { where: { id: string } }): BoundaryCheck | null {
      const database = readDb();
      return database.boundaryChecks.find((c) => c.id === options.where.id) || null;
    },
  },
};
