const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config')

router.post('/register', async (req, res) => {
    try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        username: req.body.username,
        password: hashedPassword,
        profile_picture: req.body.profile_picture,
        liked_posts: [],
        bookmarked_posts: [],
        created_posts: [],
    });

        const result = await user.save();

        const {password, ...data} = await result.toJSON();
        res.status(200).json({
            message: "User Registered Successfully!",
            data: data,
        });
        
    } catch (err) {
        res.status(400).send(err);
        console.log(err);
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
        return res.status(400).send({ message: "User Not Found!"});
    }

    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({ 
            message: "Invalid Credentials!"
        });
    }
    
    const token = jwt.sign({ id: user._id, username: user.username }, config.jwtSecret);

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, 
    })

    res.status(200).json({
        message : "success login"
    });
});


router.get("/get_user", async (req, res) => {
    try {

        const cookie = req.cookies['jwt'];
        
        const claims = jwt.verify(cookie, config.jwtSecret);
        
        if (!claims) {
            res.status(401).send({ 
                message: "Unauthenticated!"
            });
        }
        
        const user = await User.findOne({ _id: claims.id })
            .populate('created_posts')
            .populate('bookmarked_posts')
            .populate('liked_posts'); 

        const { password, ...data } = await user.toJSON();
        
        res.status(200).json(data);
    } catch (err) {
        res.status(401).json({
            message: "Unauthenticated!"
        });
    }
});

router.post("/logout", (req, res) => {
    try {

        if (!req.cookies["jwt"]) {
            return res.status(400).json({ 
                message: "No JWT cookie found. User not logged in." 
            });
        }

        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout Successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;