import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../db');
const filePath = path.join(dbDir, 'searchHistory.json');

class HistoryService {
  async ensureDbExists() {
    try {
      await fs.mkdir(dbDir, { recursive: true });
      await fs.writeFile(filePath, '[]', { flag: 'wx' }); // Create the file if it does not exist
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error('Error ensuring db exists:', error);
      }
    }
  }

  async read() {
    await this.ensureDbExists();
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  }

  async write(data: any) {
    await this.ensureDbExists();
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing search history:', error);
    }
  }

  async addCity(cityName: string) {
    const cities = await this.read();
    const id = cities.length ? cities[cities.length - 1].id + 1 : 1;
    cities.push({ id, name: cityName });
    await this.write(cities);
  }

  async getCities() {
    return await this.read();
  }

  async removeCity(id: number) {
    let cities = await this.read();
    cities = cities.filter((city: any) => city.id !== id);
    await this.write(cities);
  }
}

export default new HistoryService();