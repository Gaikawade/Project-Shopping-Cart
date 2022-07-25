const isValidName = (name) => {
    // let pattern = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/g;
    let pattern = /^[a-zA-Z]+$/g;
    if(pattern.test(name)) return true;
    else return false;
}

const isValidEmail = (email) => {
    let pattern = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})/g;
    if(pattern.test(email)) return true;
    else return false;
}

const isValidPhone = (phone) => {
    let pattern = /^(\+91)?0?[6-9]\d{9}$/g;
    if(pattern.test(phone)) return true;
    else return false;
}

const isValidPassword = (password) => {
    let pattern = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,15}$/g;
    if(pattern.test(password)) return true;
    else return false;
}

// const isValidCity = (name) => {
//     let pattern = /^[a-zA-Z]+$/g;
//     if(pattern.test(name)) return true;
//     else return false;
// }

const isValidPincode = (pincode) => {
    let pattern = /^\d{6}$/g;
    if(pattern.test(pincode)) return true;
    else return false;
}



module.exports = {
    isValidName,
    isValidPhone,
    isValidEmail,
    isValidPassword,
    isValidPincode,
};