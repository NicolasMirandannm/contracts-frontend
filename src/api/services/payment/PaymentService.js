import BaseService from "@/api/BaseService.js";

class PaymentService extends BaseService {
  constructor() {
    super("payments");
  }
}

export default new PaymentService();