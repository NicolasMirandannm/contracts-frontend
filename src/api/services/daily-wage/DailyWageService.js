import BaseService from "@/api/BaseService.js";
import httpConfig from "@/api/httpConfig.js";

class DailyWageService extends BaseService {
  constructor() {
    super("daily-wage");
  }

  async findAllByDiarist(diaristId, params) {
    return await this.get(`day-laborer/${diaristId}`, params);
  }
}

export default new DailyWageService();