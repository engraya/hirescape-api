import express from 'express';
const jobController = require('../controllers/jobController')
import { isAuthenticated } from '../middlewares/isAuthenticated';


const router = express.Router();

router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:id', jobController.getJobById);
router.post('/jobs', isAuthenticated, jobController.createJob);
router.put('/jobs/:id', isAuthenticated, jobController.updateJob);
router.delete('/jobs/:id', isAuthenticated, jobController.deleteJob);
router.get('/jobs/user/created', isAuthenticated, jobController.getUserCreatedJobs);
router.get('/jobs/user/applied', isAuthenticated, jobController.getUserAppliedJobs);
router.post('/jobs/apply/:id', isAuthenticated, jobController.applyForJob);
router.delete('/jobs/created/:id', isAuthenticated, jobController.deleteOwnJob);
router.delete('/jobs/applied/:id', isAuthenticated, jobController.removeJobFromApplied);

module.exports = router