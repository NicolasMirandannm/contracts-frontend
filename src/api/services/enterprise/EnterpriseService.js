import BaseService from "@/api/BaseService.js";

class EnterpriseService extends BaseService {
    constructor() {
        super("enterprises");
    }
}

export default new EnterpriseService();