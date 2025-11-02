export default class PaymentDto {
  constructor(id, dailyWages, date, value, method, observations) {
    this.id = id;
    this.dailyWages = dailyWages;
    this.date = date;
    this.value = value;
    this.method = method;
    this.observations = observations;
  }
}