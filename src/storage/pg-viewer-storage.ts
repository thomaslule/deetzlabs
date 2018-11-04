import { Pool } from "pg";

export class PgViewerStorage {

  constructor(private db: Pool) {
  }

  public async get(id: string): Promise<PgViewer | undefined> {
    const result = await this.db.query("select * from viewers where id = $1", [id]);
    return result.rowCount === 0 ? undefined : result.rows[0];
  }

  public async getMany(ids: string[]): Promise<PgViewer[]> {
    const result = await this.db.query("select * from viewers where id = ANY($1)", [ids]);
    return result.rows;
  }

  public async getAllNames(): Promise<string[]> {
    const result = await this.db.query("select name from viewers order by name");
    return result.rows.map((row) => row.name);
  }

  public async getWithAchievements(id: string): Promise<PgViewerWithAchievements | undefined> {
    const result = await this.db.query(`
      select viewers.id, viewers.name, achievements.achievement from viewers
      left join achievements on viewers.id = achievements.viewerId
      where viewers.id = $1
      order by achievements.date
    `, [id]);
    if (result.rowCount === 0) { return undefined; }
    return result.rows.reduce((state, row) => ({
      id: row.id,
      name: row.name,
      achievements: (state.achievements || []).concat(row.achievement || []),
    }), {});
  }

  public async getAllAchievements(): Promise<PgAchievement[]> {
    const result = await this.db.query(`
      select achievements.*, viewers.name as viewerName
      from achievements
      inner join viewers on achievements.viewerId = viewers.id
      order by achievements.date
    `);
    return result.rows.map((row) => ({
      achievement: row.achievement,
      viewerId: row.viewerid,
      date: row.date,
      viewerName: row.viewername,
    }));
  }

  public async getLastAchievements(n: number): Promise<PgAchievement[]> {
    const result = await this.db.query(`
      select achievements.*, viewers.name as viewerName
      from achievements
      inner join viewers on achievements.viewerId = viewers.id
      order by achievements.date desc
      limit $1
    `, [n]);
    return result.rows.map((row) => ({
      achievement: row.achievement,
      viewerId: row.viewerid,
      date: row.date,
      viewerName: row.viewername,
    }));
  }

  public async store(viewer: PgViewer) {
    await this.db.query(`
      insert into viewers(id, name) values ($1, $2)
      on conflict (id) do update set name = $2
    `, [viewer.id, viewer.name]);
  }

  public async addAchievement(viewerId: string, achievement: string, date: Date) {
    await this.db.query(
      "insert into achievements(viewerId, achievement, date) values ($1, $2, $3)",
      [viewerId, achievement, date],
    );
  }

  public async deleteAll() {
    await this.db.query("truncate table viewers");
    await this.db.query("truncate table achievements");
  }
}

export interface PgViewer {
  id: string;
  name: string;
}

export interface PgViewerWithAchievements {
  id: string;
  name: string;
  achievements: string[];
}

export interface PgAchievement {
  achievement: string;
  viewerId: string;
  viewerName: string;
  date: Date;
}
