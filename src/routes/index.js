const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send({
        message: "PUP Munch-Hub's Server is Running... ༼ つ ◕_◕ ༽つ🍰🍔🍕",
    });
});

module.exports = router;
