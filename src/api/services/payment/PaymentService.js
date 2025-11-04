import BaseService from "@/api/BaseService.js";
import httpConfig from "@/api/httpConfig.js";

class PaymentService extends BaseService {
  constructor() {
    super("payments");
  }

  async downloadStatementPdf(id) {
    return await httpConfig.post(`/${this.resource}/${id}/statement/pdf`, null, {
      responseType: "blob",
    });
  }
}

export default new PaymentService();