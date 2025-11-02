export default class DailyWageDto {
    constructor(enterprise, dayLaborer, baseDailyRate, paymentId, bonus, deduction, dayLaborerPaymentValue, notes, paymentStatus, workDay, startHour, endHour, version) {
        this.enterprise = enterprise;
        this.dayLaborer = dayLaborer;
        this.baseDailyRate = baseDailyRate;
        this.paymentId = paymentId;
        this.bonus = bonus;
        this.deduction = bonus;
        this.dayLaborerPaymentValue = dayLaborerPaymentValue;
        this.notes = notes;
        this.paymentStatus = paymentStatus;
        this.workDate = workDay;
        this.startHour = endHour;
        this.endHour = endHour;
        this.version = version;
    }
}