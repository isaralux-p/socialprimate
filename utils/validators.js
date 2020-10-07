//-------------------------- Function define section --------------------------//
const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isEmpty = email => (email.trim() === '' ?  true : false);
const isEmail = email => (email.match(emailRegEx)? true: false);


// ------------------------------------------------------------------------------------- Signup
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
    };
};

//------------------------------------------------------------------------------------------------- Login
exports.validateLoginData = (data) =>{
    let errors = {}
 
    if(isEmpty(data.email)){
       error.email = "Email must be empty!";
    }
    if(isEmpty(data.password)){
       errors.password ="Password Must not be empty!";
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true: false
    };
};

//---------------------------------------------------------------------------------------------------- User Details
exports.reduceUserDetails = (data) => {
    let userDetails ={};

    if(!isEmpty(data.bio.trim())) {
        userDetails.bio = data.bio;
    }
    if(!isEmpty(data.website.trim())){
        //https://website.com
        if(data.website.trim().substring(0,4) !== 'https'){
            userDetails.website =`https://${data.website.trim()}`;
        }
        else {
            userDetails.website = data.website;
        }
    }
    if(!isEmpty(data.location.trim())){
        userDetails.location = data.location;
    }

    return userDetails;
}