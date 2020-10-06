//-------------------------- Function define section --------------------------//
const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isEmpty = email => (email.trim() === '' ?  true : false);
const isEmail = email => (email.match(emailRegEx)? true: false);




exports.validateSignupData = (data) =>{
let errors = {};

if(isEmpty(data.email)){
   errors.email = " Must not be Empty";
}
else if(!isEmail(data.email)){
   errors.email = " Must be a valid email address";
}
if(isEmpty(data.password)){
   errors.password = " Must not be Empty"
}
if(data.password !== data.confirmPassword){
   errors.confirmPassword =" Password must match"
}
if( isEmpty(data.handle)){
   errors.handle = " Must not be empty";
}

return {
    errors,
    valid: Object.keys(errors).length === 0 ? true: false
}
}


exports.validateLoginData = (data) =>{
    let errors = {}
 
    if(isEmpty(user.email)){
       error.email = "Email must be empty!";
    }
    if(isEmpty(user.password)){
       errors.password ="Password Must not be empty!";
    }
    if(Object.keys(errors).length > 0){
       return res.status(400).json(errors);
    }
 
}