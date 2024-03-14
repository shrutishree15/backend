// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const sha256 = require('sha256'); // Import the library for generating hash function

// Generate referral code
const generateReferralCode = () => {
  // Generate a random string or use user's ID
  const uniqueIdentifier = Math.random().toString(36).substring(2, 8); // Use base 36 for smaller codes
  // Apply hash function to create a unique code
  const referralCode = sha256(uniqueIdentifier).substring(0, 8); // Truncate the hash to desired length
  return referralCode;
}; 



// Register a new user
router.post('/register', async (req, res) => {
  try {
    // Create user
    const user = await User.create(req.body);

    // Generate referral code
    user.referralCode = generateReferralCode(); // Use the referral code provided by the user

    // Set referral parent based on existing user's referral code
    if (req.body.referralCode) 
    {
      const parentUser = await User.findOne({ referralCode: req.body.referralCode });

      if (parentUser)
       {

        if(!parentUser.referralParent)
        {
          user.referralParent = parentUser._id;

          // Check if parent has children
          const children = await User.findOne({ referralParent: parentUser._id });
  
          if (!children) {
            
            // Parent is at level 1, add 20% bonus
            const referralBonus = user.balance * 0.2;
            parentUser.balance += referralBonus;
            parentUser.referralPercentage = 0.2*100;
            await parentUser.save();
  
          } 

        }
        
        else {
          // Parent is not at level 1
          // Parent has children, add 10% bonus to parent and 20% bonus to grandparent
        
          // Add 10% bonus to parent
          
          user.referralParent = parentUser._id;
          const referralBonusParent = user.balance * 0.1;
          
          parentUser.balance += referralBonusParent;
          parentUser.referralPercentage = 0.1*100;
          await parentUser.save();
        
          // Check if the parent's parent (grandparent) exists
          if (parentUser.referralParent) {
            const grandparentUser = await User.findById(parentUser.referralParent);
        
            // Add 20% bonus to grandparent
            
            const referralBonusGrandparent = user.balance * 0.2;
            grandparentUser.balance += referralBonusGrandparent;
            grandparentUser.referralPercentage = 0.2*100;
            await grandparentUser.save();
          }
        }
        
      } else {
        // If referral code is not found, make the user a parent node
        user.referralParent = null;
      }
    }

    // Save user
    await user.save();

    // Return newly created user
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


  router.get('/view', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
 
});

// Function to recursively build user tree
const buildUserTree = async (parentId) => {
  const users = await User.find({ referralParent: parentId });
  const userTree = [];
  for (const user of users) {
    const children = await buildUserTree(user._id);
    userTree.push({ user, children });
  }
  return userTree;
};

// Endpoint to get user tree
router.get('/tree', async (req, res) => {
  try {
    const tree = await buildUserTree(null);
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
