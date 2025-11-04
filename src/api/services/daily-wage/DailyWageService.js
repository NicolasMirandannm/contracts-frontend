import BaseService from "@/api/BaseService.js";
import httpConfig from "@/api/httpConfig.js";

class DailyWageService extends BaseService {
  constructor() {
    super("daily-wage");
  }

  async findAllByDiarist(diaristId, params) {
    return await this.get(`day-laborer/${diaristId}`, params);
  }

  async totalCurrentMonth() {
      return await this.get("count/current-month");
  }

  async totalProfitCurrentMonth() {
      return await this.get("total-profit/current-month");
  }
}

export default new DailyWageService();