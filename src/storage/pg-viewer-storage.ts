import { Pool } from "pg";

export class PgViewerStorage {
  private static rowToPgViewer(row: any): PgViewer {
    return {
      id: row.id,
      name: row.name,
      lastAction: row.last_action
    };
  }

  constructor(private db: Pool) {}

  public async get(id: string): Promise<PgViewer | undefined> {
    const result = await this.db.query("select * from viewers where id = $1", [
      id
    ]);
    return result.rowCount === 0
      ? undefined
      : PgViewerStorage.rowToPgViewer(result.rows[0]);
  }

  public async getMany(ids: string[]): Promise<PgViewer[]> {
    const result = await this.db.query(
      "select * from viewers where id = any($1)",
      [ids]
    );
    return result.rows.map(PgViewerStorage.rowToPgViewer);
  }

  public async getRecentNames(): Promise<string[]> {
    const result = await this.db.query(
      "select name from viewers order by last_action desc limit 100"
    );
    return result.rows.map(row => row.name);
  }

  public async getWithAchievements(
    id: string
  ): Promise<PgViewerWithAchievements | undefined> {
    const result = await this.db.query(
      `
      select viewers.id, viewers.name, viewers.last_action, achievements.achievement from viewers
      left join achievements on viewers.id = achievements.viewerId
      where viewers.id = $1
      order by achievements.date
    `,
      [id]
    );
    if (result.rowCount === 0) {
      return undefined;
    }
    return result.rows.reduce(
      (state, row) => ({
        ...PgViewerStorage.rowToPgViewer(row),
        achievements: (state.achievements || []).concat(row.achievement || [])
      }),
      {}
    );
  }

  public async getAllAchievements(): Promise<PgAchievement[]> {
    const result = await this.db.query(`
      select achievements.*, viewers.name as viewerName
      from achievements
      inner join viewers on achievements.viewerId = viewers.id
      order by achievements.date
    `);
    return result.rows.map(row => ({
      achievement: row.achievement,
      viewerId: row.viewerid,
      date: row.date,
      viewerName: row.viewername
    }));
  }

  public async getLastAchievements(n: number): Promise<PgAchievement[]> {
    const result = await this.db.query(
      `
      select achievements.*, viewers.name as viewerName
      from achievements
      inner join viewers on achievements.viewerId = viewers.id
      order by achievements.date desc
      limit $1
    `,
      [n]
    );
    return result.rows.map(row => ({
      achievement: row.achievement,
      viewerId: row.viewerid,
      date: row.date,
      viewerName: row.viewername
    }));
  }

  public async update(id: string, lastAction: Date, name?: string) {
    if (name) {
      await this.db.query(
        `
        insert into viewers(id, last_action, name) values ($1, $2, $3)
        on conflict (id) do update set last_action = $2, name = $3
      `,
        [id, lastAction, name]
      );
    } else {
      await this.db.query(
        `
        insert into viewers(id, last_action) values ($1, $2)
        on conflict (id) do update set last_action = $2
      `,
        [id, lastAction]
      );
    }
  }

  public async addAchievement(
    viewerId: string,
    achievement: string,
    date: Date
  ) {
    await this.db.query(
      "insert into achievements(viewerId, achievement, date) values ($1, $2, $3)",
      [viewerId, achievement, date]
    );
    await this.update(viewerId, date);
  }

  public async deleteAll() {
    await this.db.query("truncate table viewers");
    await this.db.query("truncate table achievements");
  }
}

export interface PgViewer {
  id: string;
  name: string;
  lastAction: Date;
}

export interface PgViewerWithAchievements extends PgViewer {
  achievements: string[];
}

export interface PgAchievement {
  achievement: string;
  viewerId: string;
  viewerName: string;
  date: Date;
}
