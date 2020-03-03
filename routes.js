'use strict'
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
 const bcrypt = require('bcryptjs');
const auth = require('basic-auth');

const User = require('./models').User;
const Course = require('./models').Course;




function asyncHandler(cb){
    return async (req,res,next) => {
     try {
         await cb (req,res,next)
    }catch(err){
        next(err);
    }}
}
// from unit 9 workshop
const userAuth = async (req, res, next ) => {
    let authErrorMsg = null;
    const authentication = auth(req);


    const allUsers= await User.findAll();

    if (authentication){
        const legitUser = allUsers.find(user => user.emailAddress === authentication.name);
        if(legitUser){
            const authenticated = bcryptjs
            .compareSync(authentication.pass , legitUser.password);

            if(authenticated){
                console.log(`login successful for ${user.emailAddress}`);
                req.currentUser = user;
            } else {
                authErrorMsg =  `login is not  successful for ${user.emailAddress}`
            }
        }else {
            authErrorMsg = `username ${authentication.name} not found `;
        }
     } else {
        authErrorMsg = 'auth header not found'; 
        }
     if (authErrorMsg){
         console.warn(authErrorMsg);
         res.status(401).json({authErrorMsg: 'Unauthorized to access'})
     } else {
         next();
     }
};


//user routes. Current user without sensitive info
router.get('/users', userAuth, asyncHandler(async (req, res) => {
    const legitUser = req.currentUser;
    const user = await User.findByPk(legitUser.id, {
    attributes: {
        exclude: [
            'password',
            'createdAt',
            'updatedAt'
        ]
    }});
    if(user){
        res.status(200).json(user);
        } else {
            res.status(400).json({
                message: " not found "
            })
        }

}
) )

//post for user

router.post('/users', asyncHandler(async (req,res) => {
    const errors = validationResults(req);
    if(!errors.isEmpty())
    {
        const errorMsg = errors.array().map(error => error.msg);
        res.status(400).json({
            errors: errorMsg
        });
     } else {
         const user = req.body;
         if(user.password){
             user.password = bcrypt.hashSync(user.password);
         }
            await User.create(req.body);
            res.status(201).location('/').end();

         }
})
)
//     }
// }))

module.exports= router;