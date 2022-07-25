const isValidName = (name) => {
    // let pattern = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/g;
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
    pattern = /\.(gif|jpeg|jpg|png|webp|bmp)$/g;
    return pattern.test(file);
}

module.exports = {
    isValidName,
    isValidPhone,
    isValidEmail,
    isValidPassword,
    isValidPincode,
    isValidFile
};