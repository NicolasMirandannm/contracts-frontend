export default class DailyWageDto {
    constructor(enterprise, daylaborer, baseDailyRate, bonus, deduction, paymentValue, notes, paymentStatus, workDay, startHour, endHour) {
        this.enterprise = enterprise;
        this.daylaborer = daylaborer;
        this.baseDailyRate = baseDailyRate;
        this.bonus = bonus;
        this.deduction = bonus;
        this.paymnetValue = paymentValue;
        this.notes = notes;
        this.paymentStatus = paymentStatus;
        this.workDay = workDay;
        this.startHour = endHour;
        this.endHour = endHour;
    }
}