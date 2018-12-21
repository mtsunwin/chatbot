import express from 'express'

const router = express.Router();

router.get('/', (req, res) => {
    res.end("Thang oke baby 213");
});


export default router;