'use strict'
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
 const bcrypt = require('bcryptjs');
const auth = require('basic-auth');

const User = require('./models').User;
const Course = require('./models').Course;
const app = express();




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


      const users = await User.findAll();

    if (authentication){
        const user = await  User.findAll(user => user.emailAddress === authentication.name);
        if(user){
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


//user routes. 
router.get('/users', userAuth, asyncHandler(async (req, res) => {
    const AuthorizedUser = req.currentUser;
    const user = await User.findById(user.id, {
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
) );

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


// get courses

router.get('/courses' , asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attribute: {
            exclude:[
                'password',
                'createdAt',
                'updatedAt'
            ]
        },
        include: [
            {
                model: User, 
                attributes: {
                    exclude: [
                        'password',
                        'createdAt',
                        'updatedAt'
                    ]
                }

            }
        ]
    });
    res.json(courses);
}))
//     }
// }))

module.exports= router;