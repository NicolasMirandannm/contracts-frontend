export default class EnterpriseDto {
    constructor(name, cnpj, ownerName, ownerEmail, ownerPhone, address, status) {
        this.name = name;
        this.cnpj = cnpj;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.ownerPhone = ownerPhone;
        this.address = address;
        this.status = status;
    }

}