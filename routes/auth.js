const express = require("express");
const router = express.Router();
const User = require("../models/about");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET='shruti';


router.post(
  "/signup",
  [
    body("name", 'Enter a valid name').isLength({ min: 3 }),
    body("email", 'Enter a valid email').isEmail(),
    body("password",'Password must be of atleast 8 characters').isLength({ min: 8 })
  ],
  async(req, res) => {
    let success=false;
    //If there are errors ,then return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({success, errors: errors.array()});
    }

    //Check whether the user with same email already exist 
  try{
      let user= await User.findOne({email: req.body.email});
      if(user){
       return res.status(400).json({success, errors: 'Sorry , a user with this email already exist' });
      }
    
  //create a user
  const salt = await bcrypt.genSalt(10);
  const secPass= await bcrypt.hash(req.body.password, salt);
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
      });

      const data={
        user:{
          id:user.id
        }
      }

   success=true;
      const authtoken= jwt.sign(data, JWT_SECRET);
      res.json({success,authtoken});
    
      
    }
  catch(error){
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
     
  });



  
//ROUTE-2: Authenticate a user using: post "/api/auth/login". No login required
//we are using post so that our passwords remain safe and also for big database we can use post.
router.post(
  "/login",
  [
    body("email", 'Enter a valid email').isEmail(),
    body("password", 'Password cannot be blank').exists()
  ],
  async(req, res) => {
    let success=false;
    //If there are errors ,then return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({errors: errors.array()});
    }
  const { email, password}= req.body;

  try {
 let user= await User.findOne({email});
 if(!user){
  success=false;
  return res.status(400).json({success,error:'Please try to login with correct credentials'});
 }

 const passwordCompare= await bcrypt.compare(password,user.password);
 if(!passwordCompare){
  success=false;
  return res.status(400).json({success,error:'Please try to login with correct password'});
 }


 const data={
  user:{
    id:user.id
  }}
  success=true;
  const authtoken= jwt.sign(data, JWT_SECRET);
   res.json({success,authtoken});
}
  
  catch(error){
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
  
  
  });

//ROUTE-3:  Get details of loggedin  user using: post "/api/auth/getuser". Login required.
router.post(
  "/getuser", fetchuser , async(req, res) => {
    try {
     const userId = req.user.id;
      const user= await User.findById(userId).select("-password");
      res.send(user)
    }  catch(error){
      console.error(error.message);
      res.status(500).send('Internal server error');
    }
  });
  
module.exports = router;
