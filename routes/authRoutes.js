const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { getUserProfile, updateUserStatus, getUserStatuses, addUserStatus, getLiveStatus } = require("../controllers/userController");
const { createTeam, searchTeams, joinTeam, getTeamMembers, leaveTeam } = require("../controllers/teamController");

router.post('/register', register);
router.post('/login', login);
router.get("/profile", getUserProfile);
router.put("/update-status", updateUserStatus);
router.get("/user-statuses", getUserStatuses);
router.post("/add-status", addUserStatus);
router.get("/live-status/:email", getLiveStatus);
router.post("/create-team", createTeam);
router.post("/search-teams", searchTeams);
router.post("/join-team", joinTeam);
router.get("/get-team-members/:team_id", getTeamMembers);
router.post("/leave-team", leaveTeam);

module.exports = router;
