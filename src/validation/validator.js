const isValid = (value) => {
    if(typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(typeof value === 'number' && value.toString().length === 0) return false;
    return true;
}

const isValidName = (name) => {
    let pattern = /^[a-zA-Z]+$/g;
    return pattern.test(name);
}

const isValidEmail = (email) => {
    let pattern = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})/g;
    return pattern.test(email);
}

const isValidPhone = (phone) => {
    let pattern = /^(\+91)?0?[6-9]\d{9}$/g;
    return pattern.test(phone);
}

const isValidPassword = (password) => {
    let pattern = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,15}$/g;
    return pattern.test(password);
}

const isValidPincode = (pincode) => {
    let pattern = /^\d{6}$/g;
    return pattern.test(pincode);
}

const isValidFile = (file) => {
    let pattern = /image\/(png|jpe?g|gif)/;
    return pattern.test(file);
}

const isValidText = (value) => {
    let pattern = /[a-zA-Z]+([\s][a-zA-Z]+)*/;
    return pattern.test(value);
}

module.exports = {
    isValid,
    isValidName,
    isValidPhone,
    isValidEmail,
    isValidPassword,
    isValidPincode,
    isValidFile,
    isValidText,
};