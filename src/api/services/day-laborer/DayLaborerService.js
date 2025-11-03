import BaseService from "@/api/BaseService.js";

class DayLaborerService extends BaseService {
    constructor() {
        super("day-laborer");
    }

    async findAvailable(date, startHour, endHour, pageable = { page: 0, size: 20 }) {
        try {
            const params = {
                date: date,
                startHour: startHour,
                endHour: endHour,
                page: pageable.page || 0,
                size: pageable.size || 20
            };

            return await this.get('available', params);
        } catch (error) {
            console.error('Erro ao buscar diaristas disponíveis:', error);
            throw error;
        }
    }

    async findWithPendingPayments() {
        try {
            return await this.get('pending-payments');
        } catch (error) {
            console.error('Erro ao buscar diaristas com pagamentos pendentes:', error);
            throw error;
        }
    }
}

export default new DayLaborerService();