import BaseService from "@/api/BaseService.js";

class DailyWageService extends BaseService {
    constructor() {
        super("daily-wage");
    }
}

export default new DailyWageService();