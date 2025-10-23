export default class SignUpDto {
    constructor(name, email, password, phoneNumber) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
    }
}